import type { ActionFunctionArgs } from '@remix-run/node'

// {
//     "variety": "NORMAL",
//     "ordertype": "MARKET",
//     "producttype": "DELIVERY",
//     "duration": "DAY",
//     "price": 0.0,
//     "triggerprice": 0.0,
//     "quantity": "1000",
//     "disclosedquantity": "0",
//     "squareoff": 0.0,
//     "stoploss": 0.0,
//     "trailingstoploss": 0.0,
//     "tradingsymbol": "SBIN-EQ",
//     "transactiontype": "BUY",
//     "exchange": "NSE",
//     "symboltoken": "3045",
//     "ordertag": "10007712",
//     "instrumenttype": "",
//     "strikeprice": -1.0,
//     "optiontype": "",
//     "expirydate": "",
//     "lotsize": "1",
//     "cancelsize": "0",
//     "averageprice": 584.7,
//     "filledshares": "74",
//     "unfilledshares": "926",
//     "orderid": "111111111111111",
//     "text": "",
//     "status": "open",
//     "orderstatus": "open",
//     "updatetime": "09-Oct-2023 18:22:02",
//     "exchtime": "09-Oct-2023 18:21:12",
//     "exchorderupdatetime": "09-Oct-2023 18:21:12",
//     "fillid": "",
//     "filltime": "",
//     "parentorderid": "",
//     "clientcode": "DUMMY123"
// }

export async function action({ request }: ActionFunctionArgs) {
  if (request.headers.get('content-type')?.includes('application/json')) {
    const formPayload = await request.json()
    console.log('🚀 ~ action ~ formPayload:', formPayload)
  }
  return {}
}
