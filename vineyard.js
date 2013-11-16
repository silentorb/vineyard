var MetaHub = require('metahub');var Ground = require('ground');var Vineyard = (function () {
    function Vineyard(config_file) {
        if (typeof config_file === "undefined") { config_file = undefined; }
        this.bulbs = {};
        if (config_file)
            this.load(config_file);
    }
    Vineyard.create_ground = function (db_name, databases, trellis_files) {
        var path = require('path');
        var ground = new Ground.Core(databases, db_name);
        for (var i in trellis_files) {
            ground.load_schema_from_file(trellis_files[i]);
        }

        return ground;
    };

    Vineyard.prototype.get_bulb = function (name) {
        return when.resolve(this.bulbs[name]);
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
            if (!bulb_class)
                throw new Error('Could not load bulb module: "' + name + '" (path=' + file + ').');

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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vineyard;
(function (Vineyard) {
    var Bulb = (function (_super) {
        __extends(Bulb, _super);
        function Bulb(vineyard, config) {
            _super.call(this);
            this.vineyard = vineyard;
            this.ground = vineyard.ground;
            this.config = config;
        }
        Bulb.prototype.grow = function () {
        };

        Bulb.prototype.start = function () {
        };

        Bulb.prototype.stop = function () {
        };
        return Bulb;
    })(MetaHub.Meta_Object);
    Vineyard.Bulb = Bulb;
})(Vineyard || (Vineyard = {}));
var Vineyard;
(function (Vineyard) {
    var User = (function () {
        function User(source) {
            this.id = source.id || 0;
            this.name = source.name || '';
        }
        User.prototype.simple = function () {
            return {
                uid: this.id,
                name: this.name
            };
        };
        return User;
    })();
    Vineyard.User = User;
})(Vineyard || (Vineyard = {}));
require('source-map-support').install();
//# sourceMappingURL=vineyard.js.map
module.exports = Vineyard