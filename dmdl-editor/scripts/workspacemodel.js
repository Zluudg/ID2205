function Workspace(canvas) {
    // init code---------------------------------------------------------------
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    // This complicates things a little but but fixes mouse co-ordinate
    // problems when there's a border or padding. See getMouse for more detail
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(
            canvas, null)['paddingLeft'], 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(
            canvas, null)['paddingTop'], 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(
            canvas, null)['borderLeftWidth'], 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(
            canvas, null)['borderTopWidth'], 10)   || 0;
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;
    // init code --------------------------------------------------------------


    /*
     * Blocks!
     */
    this.blockList = [];
    this.focusedBlock = null; // The block currently focused in the editor
    this.dragoffx = 0;
    this.dragoffy = 0; // Offset between top-left block corner and mouseclick
    this.toBePlaced = null // The block to be placed, if any
    this.noBlockGhost = true;
    this.ghostBlockX = null;
    this.ghostBlockX = null;
    this.ghostBlockH = 30;
    this.ghostBlockW = 45;

    /*
     * Wires!
     */
    this.wireList = [];
    this.focusedPort = null;
    this.noWireGhost = true;
    this.ghostWireX = null;
    this.ghostWireY = null;

    /*
     * Mouse event handlers!
     */
    var state = this;
    canvas.addEventListener('selectstart', function(e) {state.selectstartHandler(e)}, false);
    canvas.addEventListener('mousedown', function(e) {state.mousedownHandler(e)}, true);
    canvas.addEventListener('mousemove', function(e) {state.mousemoveHandler(e)}, true);
    canvas.addEventListener('mouseup', function(e) {state.mouseupHandler(e)}, true);
    canvas.addEventListener('dblclick', function(e) {state.dblclickHandler(e)}, false);
    canvas.addEventListener('mouseleave', function(e) {state.mouseleaveHandler(e)}, true);
    canvas.addEventListener('mouseenter', function(e) {state.mouseenterHandler(e)}, true);
    canvas.addEventListener('contextmenu', function(e) {state.contextmenuHandler(e)}, false);

    this.mode = ModeEnum.IDLE;

    /*
     * Drawing configurations!
     */
    this.isValid = false;
    this.selectionColor = '#00CC00';
    this.selectionWidth = 2;  
    this.interval = 30;
    this.d = 10;
    setInterval(function() { state.draw(); }, state.interval);
}

Workspace.prototype.setFocus = function(f) {
    if (f instanceof Block) {
        this.focusedPort = null;
        this.focusedBlock = f;
    }
    else if (f instanceof Port) {
        this.focusedPort = f;
        this.focusedBlock = null;
    }
    else if (f = null) {
        this.focusedPort = null;
        this.focusedBlock = null;
    }
    else {
        this.focusedPort = null;
        this.focusedBlock = null;
    }
}

/*
 * Adds a block to the workspace
 */
Workspace.prototype.addBlock = function(x, y, b) {
    var block = new blockMap[b](x, y);
    this.blockList.push(block);
}

/*
 * Adds a wire to the workspace
 */
Workspace.prototype.addWire = function(startPort, endPort) {
    var wire = new Wire(startPort, endPort);
    this.wireList.push(wire);
}

/*
 * Clears the entire canvas
 */
Workspace.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
}

/*
 * Function that draws the canvas if it needs to be updated
 */
Workspace.prototype.draw = function() {
    if (!this.isValid) {
        var ctx = this.ctx;
        var blocks = this.blockList;
        var wires = this.wireList;
        this.clear();
        var l = blocks.length;
        var lw = wires.length;
        ctx.setLineDash([]);

        // draw all blocks
        for (var i = 0; i < l; i++) {
            var block = blocks[i];
            if (block.x > this.width || block.y > this.height ||
                block.x + block.w < 0 || block.y + block.h < 0)
                continue;
            block.draw(ctx);
        }
    
        // draw focused block
        if (this.focusedBlock != null) {
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            var focus = this.focusedBlock;
            var d = this.d; // Space between focus mark and block
            ctx.strokeRect(focus.x-d, focus.y-d, focus.w+2*d, focus.h+2*d);
        }

        // draw focus port
        if (this.focusedPort != null) {
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            var focus = this.focusedPort;
            ctx.beginPath();
            ctx.arc(this.focusedPort.center()[0],
                    this.focusedPort.center()[1],
                    10,0,2*Math.PI);
            ctx.stroke(); 
        }

        // draw all lines
        for (var i=0; i<lw; i++) {
            wires[i].draw(ctx);
        }


        if (this.mode==ModeEnum.PLACE && !this.noBlockGhost) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.ghostBlockX,
                           this.ghostBlockY,
                           this.ghostBlockW,
                           this.ghostBlockH);
        }

        if (this.mode==ModeEnum.WIRE && !this.noWireGhost) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(this.focusedPort.center()[0], this.focusedPort.center()[1]);
            ctx.lineTo(this.ghostWireX, this.ghostWireY);
            ctx.stroke();
        }


        this.valid = true;
    }
}



Workspace.prototype.selectstartHandler = function(e) {
    e.preventDefault();
    return false;
}

Workspace.prototype.mousedownHandler = function(e) {
    var isRightMB;
    e = e || window.event;

    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2; 

    if (isRightMB)
        this.mousedownHandlerR(e);
    else
        this.mousedownHandlerL(e);
}

Workspace.prototype.mousedownHandlerR = function(e) {

    switch (this.mode) {

        case ModeEnum.IDLE:
            this.setFocus(null);
            this.isValid = false;
            break;

        case ModeEnum.PLACE:
            BM.clearActive();
            this.toBePlaced = null;
            this.noBlockGhost = true;
            this.setFocus(null);
            this.isValid = false;
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.DRAG:
            this.setFocus(null);
            this.isValid = false;
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.WIRE:
            this.setFocus(null);
            this.noWireGhost = true;
            this.isValid = false;
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.DELETE:
            break;

    }

}

Workspace.prototype.mousedownHandlerL = function(e) {

    var mouse = this.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;

    switch (this.mode) {

        case ModeEnum.IDLE:
            var miss = true;
            for (var i=this.blockList.length-1; i>=0; i--) {
                if (this.blockList[i].contains(mx, my)) {
                    miss = false;
                    this.setFocus(this.blockList[i]);
                    this.dragoffx = mx - this.focusedBlock.x;
                    this.dragoffy = my - this.focusedBlock.y;
                    BE.setFocus(this.focusedBlock);
                    this.mode = ModeEnum.DRAG;
                    this.isValid = false;
                }
                else {
                    for (var j=this.blockList[i].getActivePorts().length-1; j>=0; j--) {
                        if (this.blockList[i].getActivePorts()[j].contains(mx, my)) {
                            miss = false;
                            this.setFocus(this.blockList[i].getActivePorts()[j]);
                            BE.clearFocus();
                            this.mode = ModeEnum.WIRE;
                            this.isValid = false;
                        }
                    }
                }
            }
            if (miss) {
                this.setFocus(null);
                this.isValid = false;
            }
            break;

        case ModeEnum.PLACE:
            this.addBlock(mx, my, this.toBePlaced);
            this.focusedBlock = this.blockList[this.blockList.length-1];
            BE.setFocus(this.focusedBlock);
            BM.clearActive();
            this.noBlockGhost = true;
            this.toBePlaced = null;
            this.isValid = false;
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.DRAG:
            break;

        case ModeEnum.WIRE:
            break;

        case ModeEnum.DELETE:
            break;

    }

}

Workspace.prototype.mousemoveHandler = function(e) {

    var mouse = this.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;

    console.log(this.mode);

    switch (this.mode) {

        case ModeEnum.IDLE:
            break;

        case ModeEnum.PLACE:
            this.ghostBlockX = mx;
            this.ghostBlockY = my;
            this.isValid = false;
            break;

        case ModeEnum.DRAG:
            this.focusedBlock.x = mx - this.dragoffx;
            this.focusedBlock.y = my - this.dragoffy;
            this.focusedBlock.updatePorts();
            this.isValid = false;
            break;

        case ModeEnum.WIRE:
            this.noWireGhost = false;
            this.ghostWireX = mx;
            this.ghostWireY = my;
            this.isValid = false;
            break;

        case ModeEnum.DELETE:
            break;

    }
}

Workspace.prototype.mouseupHandler = function(e) {
    var mouse = this.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;

    switch (this.mode) {

        case ModeEnum.IDLE:
            break;

        case ModeEnum.PLACE:
            break;

        case ModeEnum.DRAG:
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.WIRE:
            var endPort = null;
            for (var i=this.blockList.length-1; i>=0; i--) {
                for (var j=this.blockList[i].getActivePorts().length-1; j>=0; j--) {
                    if (this.blockList[i].getActivePorts()[j].contains(mx, my)) {
                        endPort = this.blockList[i].getActivePorts()[j];
                        this.addWire(this.focusedPort, endPort);
                        break;
                    }
                }
                if (endPort != null) {
                    break;
                }
            }
            this.noWireGhost = true;
            this.setFocus(null);
            this.isValid = false;
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.DELETE:
            break;

    }
}

Workspace.prototype.dblclickHandler = function(e) {
    e.preventDefault();
    return false;
}

Workspace.prototype.mouseleaveHandler = function(e) {
    switch (this.mode) {

        case ModeEnum.IDLE:
            break;

        case ModeEnum.PLACE:
            this.noBlockGhost = true;
            this.isValid = false;
            break;

        case ModeEnum.DRAG:
            this.setFocus(null);
            this.isValid = false;
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.WIRE:
            this.setFocus(null);
            this.noWireGhost = true;
            this.isValid = false;
            this.mode = ModeEnum.IDLE;
            break;

        case ModeEnum.DELETE:
            break;

    }
}

Workspace.prototype.mouseenterHandler = function(e) {

    switch (this.mode) {

        case ModeEnum.IDLE:
            if (this.toBePlaced != null) {
                this.noBlockGhost = false;
                this.isValid = false;
                this.mode = ModeEnum.PLACE;
            }
            break;

        case ModeEnum.PLACE:
            this.noBlockGhost = false;
            this.isValid = false;
            break;

        case ModeEnum.DRAG:
            break;

        case ModeEnum.WIRE:
            break;

        case ModeEnum.DELETE:
            break;

    }
}

Workspace.prototype.contextmenuHandler = function(e) {
    e.preventDefault();
    return false;
}

// TODO study this function closer
// Creates an object with x and y defined,
// set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky,
// we have to worry about padding and borders
Workspace.prototype.getMouse = function(e) {
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
  
    // We return a simple javascript object (a hash) with x and y defined
    return {x: mx, y: my};
}
