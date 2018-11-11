// Constructor for port object
function Port(mode, type) {
    this.mode = mode || 'in'; // TODO handle inout ports
    this.type = type || '_Unspecified_';
    this.DEFAULT_PORT_SIZE = 8;
    this.DEFAULT_PORT_FILL = '#0000FF';
}

Port.prototype.draw = function(ctx, xp, yp) {
    ctx.fillStyle = this.DEFAULT_PORT_FILL;
    
    if (this.mode == 'in') {
        ctx.fillRect(xp - this.DEFAULT_PORT_SIZE, // compensate for port width
                     yp - this.DEFAULT_PORT_SIZE/2,
                     this.DEFAULT_PORT_SIZE,
                     this.DEFAULT_PORT_SIZE);
    }
    else if (this.mode == 'out') {
        ctx.fillRect(xp,
                     yp - this.DEFAULT_PORT_SIZE/2,
                     this.DEFAULT_PORT_SIZE,
                     this.DEFAULT_PORT_SIZE);
    }
}