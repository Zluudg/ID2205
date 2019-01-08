// Constructor for port object
function Port(mode, type, state) {
    this.mode = mode || 'in'; // in/out
    this.type = type || 'Generic'; // A/B/C/D/E/F/G etc.
    this.state = state || 'disabled'; //enabled/disabled/mandatory/unavailable
    this.parentBlock = null;
    this.DEFAULT_PORT_SIZE = 8;
    this.DEFAULT_INPORT_FILL = '#0000FF';
    this.DEFAULT_OUTPORT_FILL = '#FF8800'; 
    this.x = 0;
    this.y = 0;
}

Port.prototype.contains = function(mx, my) {
  return (this.x <= mx) && (this.x + this.DEFAULT_PORT_SIZE >= mx) &&
         (this.y <= my) && (this.y + this.DEFAULT_PORT_SIZE >= my);
}

Port.prototype.center = function() {
    return [this.x + this.DEFAULT_PORT_SIZE/2,
            this.y + this.DEFAULT_PORT_SIZE/2];
}

Port.prototype.draw = function(ctx) {
    if (this.state === 'disabled')
        return;

    if (this.mode === 'in') {
        ctx.fillStyle = this.DEFAULT_INPORT_FILL;    
        ctx.fillRect(this.x, this.y, this.DEFAULT_PORT_SIZE, this.DEFAULT_PORT_SIZE);
    }
    else if (this.mode === 'out') {
        ctx.fillStyle = this.DEFAULT_OUTPORT_FILL;
        ctx.fillRect(this.x, this.y, this.DEFAULT_PORT_SIZE, this.DEFAULT_PORT_SIZE);
    }
}

Port.prototype.setState = function(state) {
    if (state == 'mandatory')
        return;
    this.state = state;
}

Port.prototype.getState = function() {
    return this.state;
}

Port.prototype.getMode = function() {
    return this.mode;
}

function PortA(state) {
    Port.call(this, 'in', 'A', state);
}
inherit(PortA, Port);

function PortB(state) {
    Port.call(this, 'in', 'B', state);
}
inherit(PortB, Port);

function PortD(state) {
    Port.call(this, 'in', 'D', state);
}
inherit(PortD, Port);

function PortE(state) {
    Port.call(this, 'out', 'E', state); //TODO error in GR-DMDL manual?
}
inherit(PortE, Port);

function PortG(state) {
    Port.call(this, 'in', 'G', state);
}
inherit(PortG, Port);

function PortH(state) {
    Port.call(this, 'in', 'H', state);
}
inherit(PortH, Port);

function PortL(state) {
    Port.call(this, 'out', 'L', state);
}
inherit(PortL, Port);

function PortM(state) {
    Port.call(this, 'out', 'M', state);
}
inherit(PortM, Port);

function PortN(state) {
    Port.call(this, 'out', 'N', state);
}
inherit(PortN, Port);

function PortQ(state) {
    Port.call(this, 'in', 'Q', state);
}
inherit(PortQ, Port);

function PortS(state) {
    Port.call(this, 'in', 'S', state);
}
inherit(PortS, Port);

function PortU(state) {
    Port.call(this, 'out', 'U', state);
}
inherit(PortU, Port);

function PortACK(mode, state) {
    Port.call(this, mode, 'ACK', state);
}
inherit(PortACK, Port);

function PortAMP(mode, state) {
    Port.call(this, mode, 'AMP', state);
}
inherit(PortAMP, Port);

function PortAMS(mode, state) {
    Port.call(this, mode, 'AMS', state);
}
inherit(PortAMS, Port);

function PortBACK(mode, state) {
    Port.call(this, mode, 'BACK', state);
}
inherit(PortBACK, Port);

function PortBCO(mode, state) {
    Port.call(this, mode, 'BCO', state);
}
inherit(PortBCO, Port);

function PortCTS(mode, state) {
    Port.call(this, mode, 'CTS', state);
}
inherit(PortCTS, Port);

function PortDATA(mode, state) {
    Port.call(this, mode, 'DATA', state);
}
inherit(PortDATA, Port);

function PortRTS(mode, state) {
    Port.call(this, mode, 'RTS', state);
}
inherit(PortRTS, Port);

