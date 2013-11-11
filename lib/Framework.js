/// <reference path="references.ts"/>
var Vineyard;
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
//# sourceMappingURL=Framework.js.map
