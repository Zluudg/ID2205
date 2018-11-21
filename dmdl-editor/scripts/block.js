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

    this.portList = portList;
    this.inPortList = [];
    this.outPortList = [];
    this.maxPortCount = 0;
    this.updatePorts();

    this.blockName = blockName || '_Generic_';
}

Block.prototype.draw = function(ctx) {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    ctx.fillStyle = '#000000';
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

Block.prototype.updatePorts = function() {
    for (var i=0; i<this.portList.length; i++) {
        if (this.portList[i].state == 'disabled')
            continue;

        if (this.portList[i].mode == 'in')
            this.inPortList.push(this.portList[i]);
        else if (this.portList[i].mode == 'out')
            this.outPortList.push(this.portList[i]);
    }

    this.maxPortCount = Math.max(this.inPortList.length,
                                 this.outPortList.length);
    for (var i=2; i<this.maxPortCount; i+=2) {
        this.h += this.DEFAULT_HEIGHT/2;
    }
}

function BlockDummySource(x, y) {
    Block.call(this,
               x, y,
               [
                new PortB('mandatory'),
                new PortE('mandatory'),
                new PortS('disabled')
               ],
               'Dummy Source');
}
inherit(BlockDummySource, Block);

function BlockStart(x, y) {
    Block.call(this,
               x, y,
               [
                new PortB('mandatory')
               ],
               'Start');
}
inherit(BlockStart, Block);

function BlockTimer(x, y) {
    Block.call(this,
               x, y,
               [
                new PortB('mandatory'),
                new PortG('disabled'),
                new PortA('disabled'),
                new PortS('disabled'),
                new PortE('mandatory')
               ],
               'Timer');
}
inherit(BlockTimer, Block);

// global variable that can be used to call different constructors based on a string
var blockMap = {
    'Dummy Source': BlockDummySource,
    'Start': BlockStart,
    'Timer': BlockTimer
    };
