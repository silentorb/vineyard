/// <reference path="references.ts"/>
/// <reference path="../defs/ground.d.ts"/>

module Vineyard {
  export class Soil {
    bulbs:{ [name: string]: Bulb
    } = {}
    config
    config_folder
    ground:Ground.Core

    constructor(config_file:string = undefined) {
      if (config_file)
        this.load(config_file)
    }

    static create_ground(db_name:string, databases, trellis_files):Ground.Core {
      var path = require('path')
      var ground = new Ground.Core(databases, db_name);
      for (var i in trellis_files) {
        ground.load_schema_from_file(trellis_files[i])
      }
//      ground.load_schema_from_file(path.join(__dirname, '../config/schema/standard.json'))
//      ground.load_schema_from_file(path.join(__dirname, '../config/schema/site.json'))
      return ground;
    }

    load_bulbs(bulbs) {
      var name, file, bulb_class
      for (var name in bulbs) {
        var info = bulbs[name]
        if (info.path) {
          var path = require('path')
          file = path.resolve(info.path)
        }
        else
          file = name

        var bulb_module = require(file)
        if (bulb_module.Bulb)
          bulb_class = bulb_module.Bulb
        else if (bulb_module.bulb)
          bulb_class = bulb_module.bulb
        else
          throw new Error('Module "' + name + '" is missing a Bulb definition')

        this.bulbs[name] = new bulb_class(this, info)
      }
    }

    load(config_file:string) {
      var path = require('path')
      var fs = require('fs')
      var json = fs.readFileSync(config_file, 'ascii')
      this.config = JSON.parse(json)
      this.config_folder = path.dirname(config_file)

      this.load_bulbs(this.config.bulbs)
      var ground_config = this.config.ground

      this.ground = Soil.create_ground("local", ground_config.databases, ground_config.trellis_files)
    }

    grow() {
      for (var i in this.bulbs) {
        var bulb = this.bulbs[i]
        bulb.grow()
      }
    }
  }
}
