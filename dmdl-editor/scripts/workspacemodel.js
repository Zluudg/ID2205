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

    this.selectedPort = null;
    this.isWiring = false;
    this.wireStartX;
    this.wireStartY;

    // JavaScript closure TODO find out more
    var state = this;    

    // Event listener that prevents text selection by double clicking
    canvas.addEventListener(
        'selectstart',
        function(e) {
            e.preventDefault();
            return false;
        },
        false);

    // Event listener for mousedown events
    canvas.addEventListener(
        'mousedown',
        function(e) {
            var isRightMB;
            e = e || window.event;

            if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                isRightMB = e.which == 3; 
            else if ("button" in e)  // IE, Opera 
                isRightMB = e.button == 2; 

            if (state.toBePlaced && !isRightMB) {
                var mouse = state.getMouse(e);
                state.addBlock(mouse.x, mouse.y);
                state.focusedBlock = state.blockList[state.blockList.length-1];
                BE.setFocus(state.focusedBlock);
                state.isValid = false;
                return;
            }
            else {
                var mouse = state.getMouse(e);
                var mx = mouse.x;
                var my = mouse.y;
                var blocks = state.blockList;
                var l = blocks.length;

                for (var i = l-1; i >= 0; i--) {
                    if (blocks[i].contains(mx, my)) {
                        var focus = blocks[i];
                        state.dragoffx = mx - focus.x;
                        state.dragoffy = my - focus.y;
                        state.isDragging = true;
                        state.focusedBlock = focus;
                        BE.setFocus(state.focusedBlock);
                        state.isValid = false;
                        return;
                    }
                }

                if (state.focusedBlock) {
                    state.focusedBlock = null;
                    BE.clearFocus();
                    state.isValid = false;
                }
            }
            BM.clearActive();
            state.clearAction();
        },
        true);

    // Event listener for mousemove events    
    canvas.addEventListener(
        'mousemove',
        function(e) {
            var mouse = state.getMouse(e);
            if (state.toBePlaced) {
                state.ghostX = mouse.x;
                state.ghostY = mouse.y;
                //TODO H and W of block to be placed
                state.isValid = false;
            }
            else if (state.isDragging) {
                //drag object by offset, not by left corner (x, y)
                state.focusedBlock.x = mouse.x - state.dragoffx;
                state.focusedBlock.y = mouse.y - state.dragoffy;
                state.focusedBlock.updatePorts();
                state.isValid = false;
            }
        },
        true);

    // Event listener for mouseup events
    canvas.addEventListener(
        'mouseup',
        function(e) {
            state.isDragging = false;
        },
        true);

    // Event listener for doubleclick events
    canvas.addEventListener(
        'dblclick',
        function(e) {
            // TODO think of something to use doubleclick for
        },
        true);

    // Event listener for mouseout events
    canvas.addEventListener(
        'mouseleave',
        function(e) {
            state.noGhost = true;
        },
        true);

    // Event listener for mousein events
    canvas.addEventListener(
        'mouseenter',
        function(e) {
            state.noGhost = false;
        },
        true);

    // Disable contextmenu (rightclick) events
    canvas.addEventListener('contextmenu', event => event.preventDefault());

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

/*
 * Clears the current action being performed.
 */
Workspace.prototype.clearAction = function() {
    // TODO elaborate?
    // TODO handle cancelling of wiring
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
        this.clear();
        var l = blocks.length;

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
