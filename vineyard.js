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

if (process.argv.indexOf('--profile') > -1) {
    var agent = require('webkit-devtools-agent');
    agent.start();
}

var Vineyard = (function () {
    function Vineyard(config_file) {
        this.bulbs = {};
        this.json_schemas = {};
        this.module_schema_files = [];
        if (!config_file)
            throw new Error("Vineyard constructor is missing config file path.");

        this.validator = require('tv4');
        this.config = this.load_config(config_file);
        var path = require('path');
        this.config_folder = path.dirname(config_file);

        if (typeof global.SERVER_ROOT_PATH === 'string')
            this.root_path = global.SERVER_ROOT_PATH;
        else {
            var path = require('path');
            this.root_path = path.dirname(require['main'].filename);
        }
        console.log('Vineyard root path: ' + this.root_path);
    }
    Vineyard.prototype.finalize = function () {
        var ground_config = this.config.ground;

        ground_config.trellis_files = this.module_schema_files.concat(ground_config.trellis_files);
        delete this.module_schema_files;

        console.log('schema-files:', ground_config.trellis_files);

        this.ground = Vineyard.create_ground("local", ground_config.databases, ground_config.trellis_files);

        for (var i in this.bulbs) {
            var bulb = this.bulbs[i];
            bulb.ground = this.ground;
            bulb.grow();
        }
    };

    Vineyard.create_ground = function (db_name, databases, trellis_files, metahub_files) {
        if (typeof metahub_files === "undefined") { metahub_files = null; }
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

    Vineyard.prototype.load_bulb = function (name, info) {
        if (typeof info === "undefined") { info = null; }
        if (!info)
            info = this.config.bulbs[name];

        if (!info)
            throw new Error("Could not find configuration for bulb: " + name);

        var file;
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

        bulb.till_ground(this.config.ground);

        return bulb;
    };

    Vineyard.prototype.load_all_bulbs = function () {
        var bulbs = this.config.bulbs;
        for (var name in bulbs) {
            this.load_bulb(name);
        }

        this.finalize();
    };

    Vineyard.prototype.add_schema = function (path) {
        this.module_schema_files.push(path);
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

    Vineyard.prototype.load_json_schema = function (name, path) {
        var fs = require('fs');
        this.json_schemas[name] = JSON.parse(fs.readFileSync(path, 'ascii'));
    };

    Vineyard.prototype.add_json_schema = function (name, schema) {
        this.json_schemas[name] = schema;
    };

    Vineyard.prototype.find_schema_errors = function (data, schema_name) {
        var schema = this.json_schemas[schema_name];
        if (!schema)
            throw new Error('Could not validate data.  No schema named ' + schema_name + ' was loaded.');

        if (this.validator.validate(data, schema))
            return null;

        return this.validator.error;
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
            this.config = config;
        }
        Bulb.prototype.till_ground = function (ground_config) {
        };

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