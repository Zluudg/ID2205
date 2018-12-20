//Global variable used for inheritance
var inherit = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    Object.defineProperty(child.prototype, 'constructor', {
        value: child,
        enumerable: false,
        writable: true});
}

var ModeEnum = Object.freeze({IDLE:1, PLACE:2, DRAG:3, WIRE:4, DELETE:5})
