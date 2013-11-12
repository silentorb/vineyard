
//var MetaHub = require('metahub')
/// <reference path="../defs/metahub.d.ts"/>
/// <reference path="references.ts"/>

module Vineyard {
  export class Bulb extends MetaHub.Meta_Object {
    soil: Soil
    config

    constructor(soil: Soil, config) {
      super()
      this.soil = soil
      this.config = config
    }

    grow() {

    }
  }
}