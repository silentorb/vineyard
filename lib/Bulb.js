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
    var Bulb = (function (_super) {
        __extends(Bulb, _super);
        function Bulb(soil, config) {
            _super.call(this);
            this.soil = soil;
            this.config = config;
        }
        Bulb.prototype.grow = function () {
        };
        return Bulb;
    })(MetaHub.Meta_Object);
    Vineyard.Bulb = Bulb;
})(Vineyard || (Vineyard = {}));
//# sourceMappingURL=Bulb.js.map
