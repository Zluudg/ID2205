// Constructor for block object
function Block(x, y, portList, blockName) {
    this.DEFAULT_FILL = '#FF44CC'; // TODO move these to constants    
    this.DEFAULT_WIDTH = 78;
    this.DEFAULT_HEIGHT = 48;

    this.fill = this.DEFAULT_FILL;
    this.w = this.DEFAULT_WIDTH;
    this.h = this.DEFAULT_HEIGHT;
    this.x = x || 0;
    this.y = y || 0;

    this.portList = [];
    this.inPortList = [];
    this.outPortList = [];
    this.maxPortCount = 0;
    this.addPorts(portList);

    this.blockName = blockName || '_Generic_';
}

Block.prototype.draw = function(ctx) {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#000000';
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.font = "12px Arial";
    ctx.fillText(this.blockName, this.x+this.w/6, this.y+this.h/2);

    var il = this.inPortList.length;
    for (var i=0; i<il; i++) {
        var xp = this.x;
        var yp = this.y + (i+1)*this.h/(il+1);
        this.inPortList[i].draw(ctx, xp, yp);
    }

    var ol = this.outPortList.length;
    for (var i=0; i<ol; i++) {
        var xp = this.x + this.w;
        var yp = this.y + (i+1)*this.h/(ol+1);
        this.outPortList[i].draw(ctx, xp, yp);
    }
}

Block.prototype.contains = function(mx, my) {
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

// TODO Block.prototype.removePort

Block.prototype.addPorts = function(ports) {
    for (var i=0; i<ports.length; i++) {
        this.portList.push(ports[i]);
        if (ports[i].mode == 'in')
            this.inPortList.push(ports[i]);
        else if (ports[i].mode == 'out')
            this.outPortList.push(ports[i]);
        else
            alert('ERROR! Port mode not specified, port ignored.');
        // TODO add support for "inout" ports
    }

    this.maxPortCount = Math.max(this.inPortList.length,
                                 this.outPortList.length);
    for (var i=2; i<this.maxPortCount; i+=2) {
        this.h += this.DEFAULT_HEIGHT/2;
    }
}
