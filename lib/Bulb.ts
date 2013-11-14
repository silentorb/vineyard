
/// <reference path="../defs/metahub.d.ts"/>
/// <reference path="references.ts"/>

module Vineyard {
  export class Bulb extends MetaHub.Meta_Object {
    vineyard: Vineyard
    config
    ground:Ground.Core

    constructor(vineyard: Vineyard, config) {
      super()
      this.vineyard = vineyard
      this.ground = vineyard.ground
      this.config = config
    }

    grow() {

    }

    start() {

    }

    stop() {

    }
  }
}