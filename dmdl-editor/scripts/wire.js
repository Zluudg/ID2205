function Wire(p1, p2) {
    this.startPort = p1;
    this.endPort = p2;

    this.DEFAULT_WIRE_COLOR = '#000000';
    this.DEFAULT_BAD_WIRE_COLOR = '#FF0000';
    this.DEFAULT_LINE_WIDTH = 1;
}

Wire.prototype.draw = function(ctx) {
    ctx.strokeStyle = this.DEFAULT_WIRE_COLOR;
    if (this.startPort.state === 'disabled' ||
        this.endPort.state === 'disabled')
        ctx.strokeStyle = this.DEFAULT_BAD_WIRE_COLOR;
    ctx.lineWidth = this.DEFAULT_LINE_WIDTH;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(this.startPort.center()[0], this.startPort.center()[1]);
    ctx.lineTo(this.endPort.center()[0], this.endPort.center()[1]);
    ctx.stroke();
}
