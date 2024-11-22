import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { NavLink } from '@remix-run/react'
import { processIntradayTrades } from '~/lib/broker/daily-report.server'
import { saveInstumentsIntoDB } from '~/lib/broker/instruments.server'
import { AngleoneTrade } from '~/types/angleone'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export async function loader({}: LoaderFunctionArgs) {
  // const trades: AngleoneTrade[] = [
  //   {
  //     exchange: 'NSE',
  //     producttype: 'INTRADAY',
  //     tradingsymbol: 'ITC-EQ',
  //     instrumenttype: '',
  //     symbolgroup: 'EQ',
  //     strikeprice: '-1',
  //     optiontype: '',
  //     expirydate: '',
  //     marketlot: '1',
  //     precision: '2',
  //     multiplier: '-1',
  //     tradevalue: '175.00',
  //     transactiontype: 'SELL',
  //     fillprice: '175.00',
  //     fillsize: '5',
  //     orderid: '201020000000095',
  //     fillid: '50005750',
  //     filltime: '13:27:53',
  //   },
  //   {
  //     exchange: 'NSE',
  //     producttype: 'INTRADAY',
  //     tradingsymbol: 'ITC-EQ',
  //     instrumenttype: '',
  //     symbolgroup: 'EQ',
  //     strikeprice: '-1',
  //     optiontype: '',
  //     expirydate: '',
  //     marketlot: '1',
  //     precision: '2',
  //     multiplier: '-1',
  //     tradevalue: '180.00',
  //     transactiontype: 'SELL',
  //     fillprice: '180.00',
  //     fillsize: '3',
  //     orderid: '201020000000095',
  //     fillid: '50005750',
  //     filltime: '13:27:53',
  //   },
  //   {
  //     exchange: 'NSE',
  //     producttype: 'INTRADAY',
  //     tradingsymbol: 'ITC-EQ',
  //     instrumenttype: '',
  //     symbolgroup: 'EQ',
  //     strikeprice: '-1',
  //     optiontype: '',
  //     expirydate: '',
  //     marketlot: '1',
  //     precision: '2',
  //     multiplier: '-1',
  //     tradevalue: '150.00',
  //     transactiontype: 'BUY',
  //     fillprice: '150.00',
  //     fillsize: '3',
  //     orderid: '201020000000095',
  //     fillid: '50005750',
  //     filltime: '13:27:53',
  //   },
  //   {
  //     exchange: 'NSE',
  //     producttype: 'INTRADAY',
  //     tradingsymbol: 'ITC-EQ',
  //     instrumenttype: '',
  //     symbolgroup: 'EQ',
  //     strikeprice: '-1',
  //     optiontype: '',
  //     expirydate: '',
  //     marketlot: '1',
  //     precision: '2',
  //     multiplier: '-1',
  //     tradevalue: '140.00',
  //     transactiontype: 'BUY',
  //     fillprice: '140.00',
  //     fillsize: '2',
  //     orderid: '201020000000095',
  //     fillid: '50005750',
  //     filltime: '13:27:53',
  //   },
  //   {
  //     exchange: 'NSE',
  //     producttype: 'INTRADAY',
  //     tradingsymbol: 'ITC-EQ',
  //     instrumenttype: '',
  //     symbolgroup: 'EQ',
  //     strikeprice: '-1',
  //     optiontype: '',
  //     expirydate: '',
  //     marketlot: '1',
  //     precision: '2',
  //     multiplier: '-1',
  //     tradevalue: '150.00',
  //     transactiontype: 'BUY',
  //     fillprice: '150.00',
  //     fillsize: '3',
  //     orderid: '201020000000095',
  //     fillid: '50005750',
  //     filltime: '13:27:53',
  //   },
  // ]
  // const res = processIntradayTrades(trades)
  // console.log('🚀 ~ loader ~ res:', res)

  // await saveInstumentsIntoDB()
  return {}
}

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1>Home</h1>
      <nav className="flex gap-4">
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>
    </div>
  )
}
