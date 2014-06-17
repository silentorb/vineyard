/// <reference path="references.ts"/>


interface Bulb_Configuration {
  path?:string
  class?:string
  parent?:string
}

class Vineyard {
  bulbs:any = {}
  config
  config_folder
  ground:Ground.Core
  root_path:string

  constructor(config_file:string = undefined) {
    if (config_file)
      this.load_config(config_file)

    if (typeof global.SERVER_ROOT_PATH === 'string')
      this.root_path = global.SERVER_ROOT_PATH

    else {
      var path = require('path')
      this.root_path = path.dirname(require['main'].filename)
    }
    console.log('Vineyard root path: ' + this.root_path)
  }

  static create_ground(db_name:string, databases, trellis_files, metahub_files = null):Ground.Core {
    var path = require('path')
    var ground = new Ground.Core(databases, db_name);
    for (var i in trellis_files) {
      ground.load_schema_from_file(trellis_files[i])
    }

    if (metahub_files) {
      for (var j in metahub_files) {
        ground.load_metahub_file(metahub_files[j])
      }
    }

    return ground;
  }

  // Eventually this will be asynchronous so bulbs can declare hooks to each other while each
  // other is still get loaded.
  get_bulb(name:string):Promise {
    return when.resolve(this.bulbs[name])
  }

  load_bulb(name:string) {
    var file, info = <Bulb_Configuration> this.config.bulbs[name]
    if (info.path) {
      var path = require('path')
      file = path.resolve(info.path)
    }
    else {
      file = info.parent || name

      // The "vineyard-" prefix for Vineyard bulbs can be implicit in the configuration JSON.
      try {
        require.resolve(file)
      } catch (e) {
        file = 'vineyard-' + file
      }
    }

    var bulb_class = require(file)
    if (info.class)
      bulb_class = bulb_class[info.class]

    if (!bulb_class)
      throw new Error('Could not load bulb module: "' + name + '" (path=' + file + ').')

    if (typeof bulb_class !== 'function')
      throw new Error('bulb is not a class: "' + name + '" (path=' + file + ').')

    var bulb = new bulb_class(this, info)
    this.bulbs[name] = bulb
    bulb.grow()
  }

  load_all_bulbs() {
    var bulbs = this.config.bulbs
    for (var name in bulbs) {
      this.load_bulb(name)
    }
  }

  load_config(config_file:string) {
    var path = require('path')
    var fs = require('fs')
    var json = fs.readFileSync(config_file, 'ascii')
    this.config = JSON.parse(json)
    this.config_folder = path.dirname(config_file)
    var ground_config = this.config.ground

    // It's important to load ground before the bulbs since the bulbs usually hook into ground.
    this.ground = Vineyard.create_ground("local",
      ground_config.databases,
      ground_config.trellis_files,
      ground_config.metahub_files
    )
  }

  start():Promise {
    var promises = []
    for (var i in this.bulbs) {
      var bulb = this.bulbs[i]
      promises.push(bulb.start())
    }

    return when.all(promises)
  }

  stop():Promise {
    var promises = []
    for (var i in this.bulbs) {
      var bulb = this.bulbs[i]
      promises.push(bulb.stop())
    }

    return when.all(promises)
      .then(()=> {
        this.ground.stop()
      })
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
    vineyard:Vineyard
    config
    ground:Ground.Core

    constructor(vineyard:Vineyard, config) {
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