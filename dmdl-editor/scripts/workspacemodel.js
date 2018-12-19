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

    this.isValid = false;
    this.isDragging = false;
    this.blockList = [];
    this.focusedBlock = null; // The block currently focused in the editor
    this.dragoffx = 0;
    this.dragoffy = 0; // Offset between top-left block corner and mouseclick

    this.toBePlaced = null // The block to be placed, if any
    this.noGhost = true;
    this.ghostX = 0;
    this.ghostY = 0;
    this.ghostH = 30; // TODO replace H and W with proper block sizes
    this.ghostW = 45;

    this.wireList = [];
    this.selectedPort = null;
    this.isWiring = false;
    this.wireStartX;
    this.wireStartY;

    var state = this;
    canvas.addEventListener('selectstart', function(e) {state.selectstartHandler(e)}, false);
    canvas.addEventListener('mousedown', function(e) {state.mousedownHandler(e)}, true);
    canvas.addEventListener('mousemove', function(e) {state.mousemoveHandler(e)}, true);
    canvas.addEventListener('mouseup', function(e) {state.mouseupHandler(e)}, true);
    canvas.addEventListener('dblclick', function(e) {state.dblclickHandler(e)}, false);
    canvas.addEventListener('mouseleave', function(e) {state.mouseleaveHandler(e)}, true);
    canvas.addEventListener('mouseenter', function(e) {state.mouseenterHandler(e)}, true);
    canvas.addEventListener('contextmenu', function(e) {state.contextmenuHandler(e)}, false);

    /*
     * Some  drawing options!
     */
    this.selectionColor = '#00CC00';
    this.selectionWidth = 2;  
    this.interval = 30;
    this.d = 10;
    setInterval(function() { state.draw(); }, state.interval);
}

/*
 * Adds a block to the workspace
 */
Workspace.prototype.addBlock = function(x, y) {
    //TODO instatiate proper block class based on toBePlaced
    var block = new blockMap[this.toBePlaced](x, y);
    this.blockList.push(block);
    this.isValid = false;
    this.toBePlaced = null;
}

Workspace.prototype.addWire = function(startPort, endPort) {
    var wire = new Wire(startPort, endPort);
    this.wireList.push(wire);
    this.isValid = false;
    this.focusedPort = null;
    this.wireStartX = null;
    this.wireStartY = null;
    this.isWiring = false;
}

/*
 * Clears the current action being performed.
 */
Workspace.prototype.clearAction = function() {
    // TODO elaborate?
    // TODO handle cancelling of wiring
    this.focusedPort = null;
    this.wireStartX = null;
    this.wireStartY = null;
    this.toBePlaced = null;
}

/*
 * Sets what type of block will be placed
 */
Workspace.prototype.setToBePlaced = function(newBlock) {
    this.toBePlaced = newBlock;
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

        if (this.toBePlaced && !this.noGhost) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.ghostX,
                           this.ghostY,
                           this.ghostW,
                           this.ghostH);
        }
        // TODO draw connections

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

    // If we are currently placing and left mouse was clicked we place the
    // block and then return
    if (this.toBePlaced && !isRightMB) {
        var mouse = this.getMouse(e);
        this.addBlock(mouse.x, mouse.y);
        this.focusedBlock = this.blockList[this.blockList.length-1];
        BE.setFocus(this.focusedBlock);
        this.isValid = false;
        return;
    }
    else {
        var mouse = this.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var blocks = this.blockList;
        var l = blocks.length;

        for (var i=l-1; i>=0; i--) {
            var block = blocks[i];
            if (block.contains(mx, my)) {
                var focus = block;
                this.dragoffx = mx - focus.x;
                this.dragoffy = my - focus.y;
                this.isDragging = true;
                this.isWiring = false;
                this.focusedPort = null;
                this.focusedBlock = focus;
                BE.setFocus(this.focusedBlock);
                this.isValid = false;
                return;
            }
            else {
                var lp = block.getActivePorts().length;
                var ports = block.getActivePorts();
                for (var j=lp-1; j>=0; j--) {
                    var port = ports[j];
                    if (port.contains(mx, my)) {
                        if (this.isWiring) {
                            this.addWire(this.focusedPort, port);
                            return;
                        }
                        else {
                            var focus = port;
                            this.isDragging = false;
                            this.isWiring = true;
                            this.focusedBlock = null; // TODO setMode function to handle state? Enumeration of action?
                            BE.clearFocus();
                            this.focusedPort = port;
                            this.wireStartX = port.x;
                            this.wireStartY = port.y;
                            this.isValid = false;
                        }
                        return;
                    }
                }
            }
        }

        if (this.focusedBlock || this.focusedPort) {
            this.focusedBlock = null;
            this.focusedPort = null;
            this.wireStartX = null;
            this.wireStartY = null;
            BE.clearFocus();
            this.isValid = false;
        }
    }
    BM.clearActive();
    this.clearAction();
}

Workspace.prototype.mousemoveHandler = function(e) {
    var mouse = this.getMouse(e);
    if (this.toBePlaced) {
        this.ghostX = mouse.x;
        this.ghostY = mouse.y;
        this.isValid = false;
    }
    else if (this.isDragging) {
        //drag object by offset, not by left corner (x, y)
        this.focusedBlock.x = mouse.x - this.dragoffx;
        this.focusedBlock.y = mouse.y - this.dragoffy;
        this.focusedBlock.updatePorts();
        this.isValid = false;
    }
}

Workspace.prototype.mouseupHandler = function(e) {
    this.isDragging = false;
}

Workspace.prototype.dblclickHandler = function(e) {
    e.preventDefault();
    return false;
}

Workspace.prototype.mouseleaveHandler = function(e) {
    this.noGhost = true;
}

Workspace.prototype.mouseenterHandler = function(e) {
    this.noGhost = false;
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
