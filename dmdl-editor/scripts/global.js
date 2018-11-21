//Global variable used for inheritance
var inherit = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    Object.defineProperty(child.prototype, 'constructor', {
        value: child,
        enumerable: false,
        writable: true});
}
