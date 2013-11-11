/// <reference path="references.ts"/>

module Vineyard {
  export class Framework {
    modules:{ [name: string]: Module
    } = {}
    config
    config_folder

    constructor(config_file:string = undefined) {
      if (config_file)
        this.load(config_file)
    }

    load_modules(modules) {
      for (var i in modules) {
        var name = modules[i]
        var module_class = require(name).module_class
        this.modules[name] = new module_class(this)
      }
    }

    load(config_file:string) {
      var path = require('path')
      var fs = require('fs')
      var json = fs.readFileSync(config_file, 'ascii')
      this.config = JSON.parse(json)
      this.config_folder = path.dirname(config_file)

      this.load_modules(this.config.modules)
    }

    start() {

    }
  }
}