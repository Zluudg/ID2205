// Constructor for block object
function Block(x, y, portList, blockName) {
    this.DEFAULT_FILL = '#FFDDFF'; // TODO move these to constants
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
    for (var i=0; i<this.portList.length; i++)
        this.portList[i].parentBlock = this;
    this.updatePorts();

    this.blockName = blockName || 'Generic';
    this.uniqueID = this.blockName.replace(" ", "_") + '_' + Block.blockCount;
    Block.blockCount++;
}

Block.blockCount = 0;

Block.prototype.draw = function(ctx) {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    ctx.fillStyle = '#000000';
    ctx.font = "12px Arial";
    ctx.fillText(this.blockName, this.x+this.w/6, this.y+this.h/2);

    for (var i=0; i<this.portList.length; i++)
        this.portList[i].draw(ctx);

}

Block.prototype.contains = function(mx, my) {
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

Block.prototype.getActivePorts = function() {
    return this.outPortList.concat(this.inPortList);
}

Block.prototype.updatePorts = function() {
    this.inPortList = [];
    this.outPortList = [];
    this.h = this.DEFAULT_HEIGHT;
    var il = 0;
    var ol = 0;

    // calculate No. enabled In/Out ports for use in next step
    for (var i=0; i<this.portList.length; i++) {

        var port = this.portList[i];

        if (port.state === 'disabled')
            continue;

        if (port.mode === 'in')
            il++;
        else if (port.mode === 'out')
            ol++;
    }

    // add height to block depending on whether block as more In ports or Out ports
    this.maxPortCount = Math.max(il, ol);
    for (var i=2; i<this.maxPortCount; i+=2)
        this.h += this.DEFAULT_HEIGHT/2;

    var outCount = 0;
    var inCount = 0;
    for (var i=0; i<this.portList.length; i++) {

        var port = this.portList[i];

        if (port.state === 'disabled')
            continue;

        if (port.mode === 'in') {
            port.x = this.x - port.DEFAULT_PORT_SIZE;
            port.y = this.y + (inCount+1)*this.h/(il+1) - port.DEFAULT_PORT_SIZE/2;
            this.inPortList.push(port);
            inCount++;
        }
        else if (port.mode === 'out') {
            port.x = this.x + this.w;
            port.y = this.y + (outCount+1)*this.h/(ol+1) - port.DEFAULT_PORT_SIZE/2;
            this.outPortList.push(port);
            outCount++;
        }
    }
}

Block.prototype.getPort = function(p) {
    var l = this.portList.length;
    for (var i=0; i<l; i++) {
        var port = this.portList[i];
        if (port.type === p)
            return port;
    }
}

/*
 * HERE BE SUBCLASSES
 */
function BlockBuffer(x, y) {
    Block.call(this,
               x, y,
               [
                new PortQ('mandatory'),
                new PortD('mandatory'),
                new PortU('mandatory'),
                new PortH('disabled'),
                new PortL('disabled'),
                new PortM('disabled'),
                new PortN('disabled'),
               ],
               'Buffer');
}
inherit(BlockBuffer, Block);

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

function BlockFraming(x, y) {
    Block.call(this,
               x, y,
               [
                new PortB('mandatory'),
                new PortDATA('out', 'disabled'),
                new PortACK('out', 'disabled'),
                new PortBCO('out', 'disabled'),
                new PortRTS('out', 'disabled'),
                new PortCTS('out', 'disabled'),
                new PortAMS('out', 'disabled'),
                new PortAMP('out', 'disabled'),
                new PortBACK('out', 'disabled'),
               ],
               'Framing');
}
inherit(BlockFraming, Block);

function BlockSending(x, y) {
    Block.call(this,
               x, y,
               [
                new PortB('mandatory'),
                new PortG('disabled'),
                new PortDATA('out', 'disabled'),
                new PortACK('out', 'disabled'),
                new PortBCO('out', 'disabled'),
                new PortRTS('out', 'disabled'),
                new PortCTS('out', 'disabled'),
                new PortAMS('out', 'disabled'),
                new PortAMP('out', 'disabled'),
                new PortBACK('out', 'disabled'),
               ],
               'Sending');
}
inherit(BlockSending, Block);

function BlockStart(x, y) {
    Block.call(this,
               x, y,
               [
                new PortE('mandatory')
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
    'Buffer': BlockBuffer,
    'Dummy Source': BlockDummySource,
    'Framing': BlockFraming,
    'Sending': BlockSending,
    'Start': BlockStart,
    'Timer': BlockTimer
    };
