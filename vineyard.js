var MetaHub = require('metahub');var Vineyard;
(function (Vineyard) {
    var Framework = (function () {
        function Framework(config_file) {
            if (typeof config_file === "undefined") { config_file = undefined; }
            this.modules = {};
            if (config_file)
                this.load(config_file);
        }
        Framework.prototype.load_modules = function (modules) {
            for (var i in modules) {
                var name = modules[i];
                var module_class = require(name).module_class;
                this.modules[name] = new module_class(this);
            }
        };

        Framework.prototype.load = function (config_file) {
            var path = require('path');
            var fs = require('fs');
            var json = fs.readFileSync(config_file, 'ascii');
            this.config = JSON.parse(json);
            this.config_folder = path.dirname(config_file);

            this.load_modules(this.config.modules);
        };

        Framework.prototype.start = function () {
        };
        return Framework;
    })();
    Vineyard.Framework = Framework;
})(Vineyard || (Vineyard = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vineyard;
(function (Vineyard) {
    var Module = (function (_super) {
        __extends(Module, _super);
        function Module(vineyard) {
            _super.call(this);
            this.vineyard = vineyard;
        }
        return Module;
    })(MetaHub.Meta_Object);
    Vineyard.Module = Module;
})(Vineyard || (Vineyard = {}));
require('source-map-support').install();
//# sourceMappingURL=vineyard.js.map
