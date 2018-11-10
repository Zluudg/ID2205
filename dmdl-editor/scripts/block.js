// Constructor for block object
function Block(x, y, inPortList, outPortList, blockName) {
    this.x = x || 0;
    this.y = y || 0;
    this.inPortList = inPortList || [];
    this.outPortList = outPortList || [];
    this.blockName = blockName || "0xGeneric_Block";


    this.fill = '#FFDDDD';
    this.w = 10;
    this.h = 5;
}

Block.prototype.draw = function(ctx) {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h); 
}
