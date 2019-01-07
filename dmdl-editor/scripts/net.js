function Net() {
    this.uniqueID = "net_" + Net.netCount;
    Net.netCount++;
    Net.netList.push(this);

    this.portList = [];
}

Net.netCount = 0;
Net.netList = [];

Net.prototype.addWire = function(wire) {
    this.portList.push(wire.startPort);
    this.portList.push(wire.endPort);
}

Net.exportXML = function() {

}
