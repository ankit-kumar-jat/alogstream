type OrderVariety = 'NORMAL' | 'STOPLOSS' | 'AMO' | 'ROBO'
type TxnType = 'BUY' | 'SELL'
type Exchange = 'BSE' | 'NSE' | 'NFO' | 'MCX' | 'BFO' | 'CDS' | 'NCDEX' | 'NCO'

type OrderType = 'MARKET' | 'LIMIT' | 'STOPLOSS_LIMIT' | 'STOPLOSS_MARKET'
type ProductType = 'DELIVERY' | 'INTRADAY' | 'CARRYFORWARD' | 'MARGIN' | 'BO'
type OrderDuration = 'DAY' | 'IOC'
export interface AngleoneUserProfile {
  clientcode: string
  name: string
  email: string
  mobileno: string
  exchanges: string[]
  products: string[]
  lastlogintime: string
  brokerid: string
}

export interface AngleoneGenerateToken {
  jwtToken: string
  refreshToken: string
  feedToken: string
}

export interface AngleoneScrip {
  exchange: string
  tradingsymbol: string
  symboltoken: string
}

export interface AngleonePlaceOrderRes {
  script: string
  orderid: string
  uniqueorderid: string
}

export interface AngleoneOrder {
  variety: string
  ordertype: string
  producttype: string
  duration: string
  price: string
  triggerprice: string
  quantity: string
  disclosedquantity: string
  squareoff: string
  stoploss: string
  trailingstoploss: string
  tradingsymbol: string
  transactiontype: string
  exchange: Exchange
  symboltoken: any
  instrumenttype: string
  strikeprice: string
  optiontype: string
  expirydate: string
  lotsize: string
  cancelsize: string
  averageprice: string
  filledshares: string
  unfilledshares: string
  orderid: number
  text: string
  status: string
  orderstatus: string
  updatetime: string
  exchtime: string
  exchorderupdatetime: string
  fillid: string
  filltime: string
  parentorderid: string
  uniqueorderid: string
  exchangeorderid: string
}

export interface AngleoneTrade {
  exchange: Exchange
  producttype: string
  tradingsymbol: string
  instrumenttype: string
  symbolgroup: string
  strikeprice: string
  optiontype: string
  expirydate: string
  marketlot: string
  precision: string
  multiplier: string
  tradevalue: string
  transactiontype: string
  fillprice: string
  fillsize: string
  orderid: string
  fillid: string
  filltime: string
}

export interface AngleoneLTPRes {
  exchange: string
  tradingsymbol: string
  symboltoken: string
  open: string
  high: string
  low: string
  close: string
  ltp: string
}