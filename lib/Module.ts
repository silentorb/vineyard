
//var MetaHub = require('metahub')
/// <reference path="../defs/metahub.d.ts"/>
/// <reference path="references.ts"/>

module Vineyard {
  export class Module extends MetaHub.Meta_Object {
    vineyard: Framework

    constructor(vineyard: Framework) {
      super()
      this.vineyard = vineyard
    }
  }
}