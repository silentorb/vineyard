var MetaHub = require('vineyard-metahub');var Ground = require('vineyard-ground');when = require('when');var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Vineyard = (function () {
    function Vineyard(config_file) {
        if (typeof config_file === "undefined") { config_file = undefined; }
        this.bulbs = {};
        if (config_file)
            this.load_config(config_file);

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
        var path = require('path');
        var fs = require('fs');
        var json = fs.readFileSync(config_file, 'ascii');
        this.config = JSON.parse(json);
        this.config_folder = path.dirname(config_file);
        var ground_config = this.config.ground;

        this.ground = Vineyard.create_ground("local", ground_config.databases, ground_config.trellis_files, ground_config.metahub_files);
    };

    Vineyard.prototype.start = function () {
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