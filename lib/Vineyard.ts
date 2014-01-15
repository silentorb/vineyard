/// <reference path="references.ts"/>
/// <reference path="../defs/ground.d.ts"/>

class Vineyard {
  bulbs:any = {}
  config
  config_folder
  ground:Ground.Core
  root_path:string

  constructor(config_file:string = undefined) {
    if (config_file)
      this.load(config_file)

    var path = require('path')
    this.root_path = path.dirname(require['main'].filename)
  }

  static create_ground(db_name:string, databases, trellis_files):Ground.Core {
    var path = require('path')
    var ground = new Ground.Core(databases, db_name);
    for (var i in trellis_files) {
      ground.load_schema_from_file(trellis_files[i])
    }

    return ground;
  }

  // Eventually this will be asynchronous so bulbs can declare hooks to each other while each
  // other is still get loaded.
  get_bulb(name:string):Promise {
    return when.resolve(this.bulbs[name])
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

      var bulb_class = require(file)
      if (!bulb_class)
        throw new Error('Could not load bulb module: "' + name + '" (path=' + file + ').')

      var bulb = new bulb_class(this, info)
      this.bulbs[name] = bulb
      bulb.grow()
    }
  }

  load(config_file:string) {
    var path = require('path')
    var fs = require('fs')
    var json = fs.readFileSync(config_file, 'ascii')
    this.config = JSON.parse(json)
    this.config_folder = path.dirname(config_file)
    var ground_config = this.config.ground

    // It's important to load ground before the bulbs since the bulbs usually hook into ground.
    this.ground = Vineyard.create_ground("local", ground_config.databases, ground_config.trellis_files)
    this.load_bulbs(this.config.bulbs)
  }

  start() {
    for (var i in this.bulbs) {
      var bulb = this.bulbs[i]
      bulb.start()
    }
  }
}

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