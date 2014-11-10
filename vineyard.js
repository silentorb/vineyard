var MetaHub = require('vineyard-metahub');var Ground = require('vineyard-ground');when = require('when');var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
if (process.argv.indexOf('--source-map'))
    require('source-map-support').install();

if (process.argv.indexOf('--monitor-promises'))
    require('when/monitor/console');

var Vineyard = (function () {
    function Vineyard(config_file) {
        this.bulbs = {};
        if (!config_file)
            throw new Error("Vineyard constructor is missing config file path.");

        this.config = this.load_config(config_file);
        var path = require('path');
        this.config_folder = path.dirname(config_file);
        var ground_config = this.config.ground;

        this.ground = Vineyard.create_ground("local", ground_config.databases, ground_config.trellis_files, ground_config.metahub_files);

        if (typeof global.SERVER_ROOT_PATH === 'string')
            this.root_path = global.SERVER_ROOT_PATH;
        else {
            var path = require('path');
            this.root_path = path.dirname(require['main'].filename);
        }
        console.log('Vineyard root path: ' + this.root_path);
    }
    Vineyard.create_ground = function (db_name, databases, trellis_files, metahub_files) {
        if (typeof metahub_files === "undefined") { metahub_files = null; }
        var path = require('path');
        var ground = new Ground.Core(databases, db_name);
        for (var i in trellis_files) {
            ground.load_schema_from_file(trellis_files[i]);
        }

        if (metahub_files) {
            for (var j in metahub_files) {
                ground.load_metahub_file(metahub_files[j]);
            }
        }

        return ground;
    };

    Vineyard.prototype.get_bulb = function (name) {
        return when.resolve(this.bulbs[name]);
    };

    Vineyard.prototype.load_bulb = function (name) {
        var file, info = this.config.bulbs[name];
        if (!info) {
            throw new Error("Could not find configuration for bulb: " + name);
        }
        if (info.path) {
            var path = require('path');
            file = path.resolve(info.path);
        } else {
            file = info.parent || name;

            try  {
                require.resolve(file);
            } catch (e) {
                file = 'vineyard-' + file;
            }
        }

        var bulb_class = require(file);
        if (info.class)
            bulb_class = bulb_class[info.class];

        if (!bulb_class)
            throw new Error('Could not load bulb module: "' + name + '" (path=' + file + ').');

        if (typeof bulb_class !== 'function')
            throw new Error('bulb is not a class: "' + name + '" (path=' + file + ').');

        var bulb = new bulb_class(this, info);
        this.bulbs[name] = bulb;
        bulb.grow();
    };

    Vineyard.prototype.load_all_bulbs = function () {
        var bulbs = this.config.bulbs;
        for (var name in bulbs) {
            this.load_bulb(name);
        }
    };

    Vineyard.prototype.load_config = function (config_file) {
        var fs = require('fs');
        var json = fs.readFileSync(config_file, 'ascii');
        var local = JSON.parse(json);
        var includes = local.includes;
        if (typeof includes == 'object') {
            for (var i = 0; i < includes.length; ++i) {
                var include = this.load_config(includes[i]);

                local = Vineyard.deep_merge(local, include);
            }
        }
        return local;
    };

    Vineyard.deep_merge = function (source, target) {
        if (typeof source != 'object')
            throw new Error('Configuration source is not an object.');

        if (typeof target != 'object')
            throw new Error('Configuration target is not an object.');

        for (var key in source) {
            var value = source[key];
            if (typeof value == 'object') {
                if (target[key] === undefined) {
                    target[key] = source[key];
                } else {
                    if (MetaHub.is_array(source)) {
                        for (var i = 0; i < source.length; ++i) {
                            target.push(source[i]);
                        }
                    } else {
                        Vineyard.deep_merge(value, target[key]);
                    }
                }
            } else {
                target[key] = value;
            }
        }

        return target;
    };

    Vineyard.prototype.start = function () {
        this.ground.harden_schema();

        var promises = [];
        for (var i in this.bulbs) {
            var bulb = this.bulbs[i];
            promises.push(bulb.start());
        }

        return when.all(promises);
    };

    Vineyard.prototype.stop = function () {
        var _this = this;
        var promises = [];
        for (var i in this.bulbs) {
            var bulb = this.bulbs[i];
            promises.push(bulb.stop());
        }

        return when.all(promises).then(function () {
            _this.ground.stop();
        });
    };
    return Vineyard;
})();

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
//# sourceMappingURL=vineyard.js.map
module.exports = Vineyard