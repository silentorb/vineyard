
module Vineyard {
  export interface IUser {
    id?
    name?:string
    roles?:IRole[]
  }

  export interface IRole {
    id?
    name?:string
  }
}