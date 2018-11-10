function WorkspaceModel(canvas) {
    // init code

    this.isValid = false;
    this.isDragging =
    this.content = []; // Edges + vertices
    this.focusedBlock = null; // The block currently focused in the editor
    this.dragoffx = 0;
    this.dragoffy = 0; //related to mouse events somehow
}
