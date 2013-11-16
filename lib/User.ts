
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

  export class User {
    id:number;
    name:string;
    session;

    constructor(source:IUser) {
      this.id = source.id || 0;
      this.name = source.name || '';
    }

    simple():IUser {
      return {
        uid: this.id,
        name: this.name
      };
    }
  }
}