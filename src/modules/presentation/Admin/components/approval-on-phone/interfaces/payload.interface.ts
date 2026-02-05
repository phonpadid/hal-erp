export interface JwtPayload {
  id: string
  step_id: string
  user_id: number
  email: string
  iat: number
  exp: number
}
