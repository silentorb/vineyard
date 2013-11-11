//var MetaHub = require('metahub')
/// <reference path="../defs/metahub.d.ts"/>
/// <reference path="references.ts"/>
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
//# sourceMappingURL=Module.js.map
