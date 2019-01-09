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

    this.addCurrentBlockConfigs();
}

BlockEditor.prototype.addPortCheckboxes = function() {

    for (var i=0; i<this.currentBlock.portList.length; i++) {
        var newDiv = document.createElement('div');
        var newCheckBox = document.createElement('input');
        var newLabel = document.createElement('label');

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

BlockEditor.prototype.addCurrentBlockConfigs = function() {

    var block = this.currentBlock;

    for (var i=0; i<block.configList.length; i++) {
        var configType = block.configInfo[block.configList[i]].split(':')[0];
        var configParams = block.configInfo[block.configList[i]].split(':')[1]
        switch (configType) {
            case 'check':
                this.addCheck(block.configList[i], configParams);
                break;
            case 'radio':
                this.addRadio(block.configList[i], configParams);
                break;
            case 'slider':
                this.addSlider(block.configList[i], configParams);
                break;
            case 'entry':
                this.addEntry(block.configList[i], configParams);
                break;
        }
    }

}

BlockEditor.prototype.addCheck = function(label, params) {
    var checkboxState = false;
    if (params.split(';')[1] === 'true')
        checkboxState = true;


    var newDiv = document.createElement('div');
    var newCheckBox = document.createElement('input');
    var newLabel = document.createElement('label');

    newCheckBox.type = 'checkbox';
    newCheckBox.id = label; 
    newCheckBox.checked = checkboxState;
    newCheckBox.name = newCheckBox.id;
    newLabel.htmlFor = newCheckBox.id;
    newLabel.innerHTML = label;

    var stateBE = this; //closure
    var cfgLabel = label;
    newCheckBox.addEventListener(
        'click',
        function() {
            var checkboxState = (this.checked ? 'true' : 'false');
            var cfg = stateBE.currentBlock.configInfo[cfgLabel].split(';');
            cfg[1] = checkboxState;
            cfg = cfg.join(';');
            stateBE.currentBlock.configInfo[cfgLabel] = cfg;
        });
    newDiv.appendChild(newCheckBox);
    newDiv.appendChild(newLabel);
    this.editor.appendChild(newDiv);
}

BlockEditor.prototype.addRadio = function(label, params) {
}

BlockEditor.prototype.addSlider = function(label, params) {

    var newDiv = document.createElement('div');
    var newSlider = document.createElement('input');
    var newIndicator = document.createElement('p');

    var values = params.split(':');
    var currentValue = params.split(';')[1];
    var minmax = params.split(';')[0].split(',');

    newSlider.type = 'range';
    newSlider.id = label + ' [slider]'; 
    newSlider.name = newSlider.id;
    newSlider.min = minmax[0];
    newSlider.max = minmax[1];
    newSlider.defaultValue = currentValue;
    newIndicator.innerHTML = label + ': ' + currentValue;
    newIndicator.id = label + ' [indicator]';

    var stateBE = this; //closure
    var cfgLabel = label;

    newSlider.addEventListener(
        'input',
        function() {
            var indicator = document.getElementById(cfgLabel + ' [indicator]');
            indicator.innerHTML = cfgLabel + ': ' + this.value;
            var cfg = stateBE.currentBlock.configInfo[cfgLabel].split(';');
            cfg[1] = this.value;
            cfg = cfg.join(';');
            stateBE.currentBlock.configInfo[cfgLabel] = cfg;
        });
    newDiv.appendChild(newIndicator);
    newDiv.appendChild(newSlider);
    this.editor.appendChild(newDiv);
}

BlockEditor.prototype.addEntry = function(label, params) {
}

BlockEditor.prototype.clearFocus = function() {
    this.setFocus(null);
    this.editor.innerHTML = "";
}
