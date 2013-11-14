/// <reference path="references.ts"/>
/// <reference path="../defs/ground.d.ts"/>
var Vineyard = (function () {
    function Vineyard(config_file) {
        if (typeof config_file === "undefined") { config_file = undefined; }
        if (config_file)
            this.load(config_file);
    }
    Vineyard.create_ground = function (db_name, databases, trellis_files) {
        var path = require('path');
        var ground = new Ground.Core(databases, db_name);
        for (var i in trellis_files) {
            ground.load_schema_from_file(trellis_files[i]);
        }

        //      ground.load_schema_from_file(path.join(__dirname, '../config/schema/standard.json'))
        //      ground.load_schema_from_file(path.join(__dirname, '../config/schema/site.json'))
        return ground;
    };

    // Eventually this will be asynchronous so bulbs can declare hooks to each other while each
    // other is still get loaded.
    Vineyard.prototype.get_bulb = function (name) {
        return when.resolve(this.bulbs[name]);
        //      var def = when.defer()
        //
        //      return def.promise
    };

    Vineyard.prototype.load_bulbs = function (bulbs) {
        var name, file, bulb_class;
        for (var name in bulbs) {
            var info = bulbs[name];
            if (info.path) {
                var path = require('path');
                file = path.resolve(info.path);
            } else
                file = name;

            var bulb_class = require(file);
            var bulb = new bulb_class(this, info);
            this.bulbs[name] = bulb;
            bulb.grow();
        }
    };

    Vineyard.prototype.load = function (config_file) {
        var path = require('path');
        var fs = require('fs');
        var json = fs.readFileSync(config_file, 'ascii');
        this.config = JSON.parse(json);
        this.config_folder = path.dirname(config_file);
        var ground_config = this.config.ground;

        // It's important to load ground before the bulbs since the bulbs usually hook into ground.
        this.ground = Vineyard.create_ground("local", ground_config.databases, ground_config.trellis_files);
        this.load_bulbs(this.config.bulbs);
    };

    Vineyard.prototype.start = function () {
        for (var i in this.bulbs) {
            var bulb = this.bulbs[i];
            bulb.start();
        }
    };
    return Vineyard;
})();
//# sourceMappingURL=Vineyard.js.map
