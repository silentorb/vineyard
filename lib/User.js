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
//# sourceMappingURL=User.js.map
