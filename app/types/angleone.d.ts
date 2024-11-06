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
