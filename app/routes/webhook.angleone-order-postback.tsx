import { OrderStatus } from '@prisma/client'
import type { ActionFunctionArgs } from '@remix-run/node'
import { retryAsync } from 'ts-retry'
import { getToken } from '~/lib/broker/angleone.server'
import { cancelOrder, getLTPData, placeOrder } from '~/lib/broker/order.server'
import { calculateTargetAndStoplossPrice } from '~/lib/broker/process-order.server'
import { db } from '~/lib/db.server'
import { AngleoneOrder } from '~/types/angleone'

export async function action({ request }: ActionFunctionArgs) {
  function getStatus(orderStatus: string): OrderStatus {
    switch (orderStatus) {
      case 'validation pending':
        return 'PENDING'
      case 'open pending':
        return 'PENDING'
      case 'open':
        return 'OPEN'
      case 'rejected':
        return 'CANCELED'
      case 'complete':
        return 'EXECUTED'
      case 'trigger pending':
        return 'TRIGGER_PENDING'
      case 'modify validation pending':
        return 'PENDING'
      case 'modify pending':
        return 'PENDING'
      case 'modify (previous open order) open':
        return 'OPEN'
      case 'not modified open':
        return 'OPEN'
      default:
        return 'PENDING'
    }
  }

  if (request.headers.get('content-type')?.includes('application/json')) {
    const formPayload: AngleoneOrder = await request.json()

    const existingOrder = await db.orderHistory.findUnique({
      where: {
        brokerOrderId: formPayload.orderid,
        clientId: formPayload.clientcode,
      },
    })

    if (!existingOrder) {
      return Response.json({ success: true })
    }
    const filledShares = parseInt(formPayload.filledshares)
    const sharesToFill = filledShares - existingOrder.filledShares
    const newOrderStatus = getStatus(formPayload.orderstatus)

    await db.orderHistory.update({
      where: {
        brokerOrderId: formPayload.orderid,
        clientId: formPayload.clientcode,
      },
      data: {
        status: newOrderStatus,
        price: formPayload.price,
        avgPrice: formPayload.averageprice,
        lotSize: parseInt(formPayload.lotsize, 10),
        filledShares:
          sharesToFill > 0 ? { increment: sharesToFill } : undefined,
        unfilledShares:
          sharesToFill > 0 ? { decrement: sharesToFill } : undefined,
      },
    })

    if (
      formPayload.producttype === 'INTRADAY' &&
      formPayload.ordertype === 'MARKET' &&
      sharesToFill > 0 &&
      newOrderStatus === 'EXECUTED' &&
      !existingOrder.parentOrderId
    ) {
      // console.log('🚀 ~ order-postback ~ formPayload:', formPayload)
      const signal = await db.signal.findUnique({
        where: { id: existingOrder.signalId, userId: existingOrder.userId },
      })

      if (!signal) {
        console.log('🚀 ~ order-postback: signal not found')
        return Response.json({ success: true })
      }

      console.log(
        `🚀 ~ calculating TGPrice&SLPrice ~ price: ${formPayload.tradingsymbol} ${parseFloat(formPayload.averageprice)} ~ TG: ${signal.takeProfitValue.toNumber()} ~ SL: ${signal.stopLossValue.toNumber()} `,
      )
      const { stopLossPrice, targetPrice } = calculateTargetAndStoplossPrice({
        price: parseFloat(formPayload.averageprice),
        target: signal.takeProfitValue.toNumber(),
        stopLoss: signal.stopLossValue.toNumber(),
        targetStopLossType: signal.targetStopLossType,
        txnType: existingOrder.txnType,
      })

      const { data: tokens, error } = await getToken({
        brokerAccountId: existingOrder.brokerAccountId,
        userId: existingOrder.userId,
      })
      if (error || !tokens) {
        console.log('🚀 ~ order-postback: unable to fetch tokens')
        return Response.json({ success: true })
      }

      const ltpData = await getLTPData({
        authToken: tokens.authToken,
        exchange: existingOrder.exchange,
        symbol: existingOrder.symbol,
        symbolToken: existingOrder.symbolToken,
      })

      if (!ltpData) {
        throw new Error('Unable to fetch created order.')
      }

      const ltpPrice = parseFloat(ltpData.ltp)
      const isStoplossAlreadyHit =
        existingOrder.txnType === 'BUY'
          ? stopLossPrice >= ltpPrice
          : stopLossPrice <= ltpPrice
      const isTargetAlreadyHit =
        existingOrder.txnType === 'BUY'
          ? targetPrice <= ltpPrice
          : targetPrice >= ltpPrice

      const txnTypeForSLTG = existingOrder.txnType === 'BUY' ? 'SELL' : 'BUY'

      // close the order as SL or TG already hit
      if (isStoplossAlreadyHit || isTargetAlreadyHit) {
        console.log(
          `🚀 ~ order-postback: closing order as SL or TG already hit ~ LTP: ${ltpPrice} ~ SL: ${stopLossPrice} ~ TG: ${targetPrice} ~ parentOrderId: ${existingOrder.id}_${existingOrder.symbol}`,
        )
        //Creates Market order with parentOrderId to close the parent order
        await retryAsync(async () => {
          const orderRes = await placeOrder({
            authToken: tokens.authToken,
            variety: 'NORMAL',
            ordertype: 'MARKET',
            producttype: 'INTRADAY',
            duration: 'DAY',
            exchange: existingOrder.exchange,
            tradingsymbol: existingOrder.symbol,
            symboltoken: existingOrder.symbolToken,

            transactiontype: txnTypeForSLTG,
            quantity: existingOrder.qty,
            price: '0',
            triggerprice: '0',
            squareoff: '0',
            stoploss: '0',
          })

          if (!orderRes) {
            console.log(
              '🚀 ~ order-postback: unable to exit for stoploss order',
            )
            return Response.json({ success: true })
          }
          await db.orderHistory.create({
            data: {
              brokerOrderId: orderRes.orderid,
              brokerUniqueOrderId: orderRes.uniqueorderid,
              clientId: existingOrder.clientId,

              price: 0,
              qty: existingOrder.qty,
              lotSize: existingOrder.lotSize,
              filledShares: 0,
              unfilledShares: existingOrder.qty * existingOrder.lotSize,
              txnType: txnTypeForSLTG,
              status: 'PENDING',
              variety: 'NORMAL',
              orderType: 'MARKET',
              productType: 'INTRADAY',

              exchange: existingOrder.exchange,
              symbol: existingOrder.symbol,
              symbolToken: existingOrder.symbolToken,

              userId: existingOrder.userId,
              signalId: existingOrder.signalId,
              brokerAccountId: existingOrder.brokerAccountId,

              parentOrderId: existingOrder.id,
            },
          })
        })

        return Response.json({ success: true })
      }

      //Creates SL order with parentOrderId
      console.log(
        '🚀 ~ order-postback: Creating SL order : parentOrderId:',
        existingOrder.id,
      )
      await retryAsync(
        async () => {
          const orderRes = await placeOrder({
            authToken: tokens.authToken,
            variety: 'STOPLOSS',
            ordertype: 'STOPLOSS_MARKET',
            producttype: 'INTRADAY',
            duration: 'DAY',
            exchange: existingOrder.exchange,
            tradingsymbol: existingOrder.symbol,
            symboltoken: existingOrder.symbolToken,
            transactiontype: txnTypeForSLTG,
            quantity: sharesToFill,
            price: '0',
            triggerprice: stopLossPrice.toFixed(2),
            squareoff: '0',
            stoploss: '0',
          })

          if (!orderRes) {
            console.log('🚀 ~ order-postback: unable to create stoploss order')
            throw new Error('Unable to create stoploss order.')
          }

          await db.orderHistory.create({
            data: {
              brokerOrderId: orderRes.orderid,
              brokerUniqueOrderId: orderRes.uniqueorderid,
              clientId: existingOrder.clientId,

              price: 0,
              qty: sharesToFill,
              lotSize: existingOrder.lotSize,
              filledShares: 0,
              unfilledShares: sharesToFill * existingOrder.lotSize,
              txnType: txnTypeForSLTG,
              status: 'PENDING',
              variety: 'STOPLOSS',
              orderType: 'STOPLOSS_MARKET',
              productType: 'INTRADAY',

              exchange: existingOrder.exchange,
              symbol: existingOrder.symbol,
              symbolToken: existingOrder.symbolToken,

              userId: existingOrder.userId,
              signalId: existingOrder.signalId,
              brokerAccountId: existingOrder.brokerAccountId,

              parentOrderId: existingOrder.id,
            },
          })
        },
        { delay: 100, maxTry: 2 },
      )

      //Creates TG order with parentOrderId
      console.log(
        '🚀 ~ order-postback: Creating TG order: parentOrderId:',
        existingOrder.id,
      )
      await retryAsync(
        async () => {
          const orderRes = await placeOrder({
            authToken: tokens.authToken,
            variety: 'NORMAL',
            ordertype: 'LIMIT',
            producttype: 'INTRADAY',
            duration: 'DAY',
            exchange: existingOrder.exchange,
            tradingsymbol: existingOrder.symbol,
            symboltoken: existingOrder.symbolToken,
            transactiontype: txnTypeForSLTG,
            quantity: sharesToFill,
            price: targetPrice.toFixed(2),
            triggerprice: '0',
            squareoff: '0',
            stoploss: '0',
          })

          if (!orderRes) {
            console.log(
              '🚀 ~ order-postback: unable to create target limit order',
            )
            throw new Error('Unable to create target limit order.')
          }

          await db.orderHistory.create({
            data: {
              brokerOrderId: orderRes.orderid,
              brokerUniqueOrderId: orderRes.uniqueorderid,
              clientId: existingOrder.clientId,

              price: targetPrice.toFixed(2),
              qty: sharesToFill,
              lotSize: existingOrder.lotSize,
              filledShares: 0,
              unfilledShares: sharesToFill * existingOrder.lotSize,
              txnType: txnTypeForSLTG,
              status: 'PENDING',
              variety: 'NORMAL',
              orderType: 'LIMIT',
              productType: 'INTRADAY',

              exchange: existingOrder.exchange,
              symbol: existingOrder.symbol,
              symbolToken: existingOrder.symbolToken,

              userId: existingOrder.userId,
              signalId: existingOrder.signalId,
              brokerAccountId: existingOrder.brokerAccountId,

              parentOrderId: existingOrder.id,
            },
          })
        },
        { delay: 100, maxTry: 2 },
      )
    }

    if (
      // This means SL or TG hit so cancle other SL or TG order
      formPayload.producttype === 'INTRADAY' &&
      (formPayload.ordertype === 'STOPLOSS_MARKET' ||
        formPayload.ordertype === 'LIMIT') &&
      newOrderStatus === 'EXECUTED' &&
      existingOrder.parentOrderId
    ) {
      console.log(
        '🚀 ~ order-postback: SL or TG executed : canceling other orders : parentOrderId:',
        existingOrder.id,
      )
      const allChildOrders = await db.orderHistory.findMany({
        where: {
          parentOrderId: existingOrder.parentOrderId,
          NOT: {
            status: {
              in: ['CANCELED', 'EXECUTED'],
            },
          },
        },
      })

      if (!allChildOrders.length) {
        return Response.json({ success: true })
      }

      const { data: tokens, error } = await getToken({
        brokerAccountId: existingOrder.brokerAccountId,
        userId: existingOrder.userId,
      })
      if (error || !tokens) {
        console.log('🚀 ~ order-postback: unable to fetch tokens')
        return Response.json({ success: true })
      }

      allChildOrders.map(childOrder =>
        retryAsync(
          async () => {
            const orderRes = await cancelOrder({
              authToken: tokens.authToken,
              orderid: childOrder.brokerOrderId,
              variety: childOrder.variety,
            })

            await db.orderHistory.update({
              where: { id: childOrder.id },
              data: { status: 'CANCELED' },
            })
          },
          { delay: 750, maxTry: 2 },
        ),
      )
    }

    return Response.json({ success: true })
  }
  return Response.json({ success: true })
}
