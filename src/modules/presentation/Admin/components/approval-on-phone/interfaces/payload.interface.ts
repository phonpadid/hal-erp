export interface JwtPayload {
  id: string
  step_id: string
  user_id: number
  email: string
  iat: number
  exp: number
}

export interface IStep {
  id: number,
  status_id: number
}
export interface IRole {
  id: number,
  name: string
}
