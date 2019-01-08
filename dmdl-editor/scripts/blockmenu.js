function BlockMenu(menu) {
    this.menu = menu;
    this.elements = menu.getElementsByTagName('a');

    var state = this;
    for (var i = 0; i < state.elements.length; i++) {
         // Don't add event listener to the head of the menu
        if (state.elements[i].className === 'menuHead')
            continue;

        state.elements[i].addEventListener('click',
            function(e) {
                var current = state.menu.getElementsByClassName('active')[0];
                if (current)
                    current.className = current.className.replace('active', '');
                this.className += 'active';
                WS.toBePlaced = this.innerHTML;
            });
    }

    var exportBtn = document.getElementById("exportBtn");
    exportBtn.addEventListener('click',
        function(e) {
            var filename = prompt("Please enter a filename", "Untitled");
            if (filename === null || filename === undefined)
                filename = "Untitled";
            Net.exportXML(filename);
        });
}

BlockMenu.prototype.clearActive = function() {
    for (var i=0; i<this.elements.length; i++) {
        if (this.elements[i].className === 'menuHead')
            continue;
        this.elements[i].className = '';
    }
}
