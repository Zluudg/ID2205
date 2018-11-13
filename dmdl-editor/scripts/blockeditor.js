function BlockEditor(editor) {
    this.editor = editor;
    this.currentBlock = null;
}

BlockEditor.prototype.setFocus = function(focus) {
    this.currentBlock = focus;
    if (this.currentBlock) {
        this.editor.innerHTML = "<p>" + this.currentBlock.blockName + "</p>";
    }
}

BlockEditor.prototype.clearFocus = function() {
    // TODO elaborate?
    this.setFocus(null);
    this.editor.innerHTML = "";
}
