function BlockEditor(editor) {
    this.editor = editor;
    this.currentBlock = null;
}

BlockEditor.prototype.setFocus = function(focus) {
    this.editor.innerHTML = '';
    this.currentBlock = focus;
    if (focus === null)
        return;

    var header = document.createElement('h2');
    header.innerHTML = focus.uniqueID;
    this.editor.appendChild(header);
    
    this.addPortCheckboxes();

    //this.addBlockSpecificCheckboxes(this.currentBlock);
    //this.addBlockSpecificRadiobuttons
    
}

BlockEditor.prototype.addPortCheckboxes = function() {

    for (var i=0; i<this.currentBlock.portList.length; i++) {
        var newDiv = document.createElement('div');
        var newCheckBox = document.createElement('input');
        var newLabel = document.createElement('LABEL');

        newCheckBox.type = 'checkbox';
        newCheckBox.id = 'check' + this.currentBlock.portList[i].type; 
        newCheckBox.checked = true;
        if (this.currentBlock.portList[i].state == 'disabled')
            newCheckBox.checked = false;
        newCheckBox.name = newCheckBox.id;
        newLabel.htmlFor = newCheckBox.id;
        newLabel.innerHTML = this.currentBlock.portList[i].type;
        if (this.currentBlock.portList[i].state == 'mandatory')    
            newCheckBox.disabled = true;
        else {
            var stateBE = this; //closure
            newCheckBox.addEventListener(
                'click',
                function() {
                    var p = this.id.replace('check', '');
                    var port = stateBE.currentBlock.getPort(p);
                    port.setState(this.checked ? 'enabled' : 'disabled');
                    stateBE.currentBlock.updatePorts();
                });
        }
        newDiv.appendChild(newCheckBox);
        newDiv.appendChild(newLabel);
        this.editor.appendChild(newDiv);
    }
}

BlockEditor.prototype.clearFocus = function() {
    this.setFocus(null);
    this.editor.innerHTML = "";
}
