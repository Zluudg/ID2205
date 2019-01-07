function Net() {
    this.uniqueID = "net_" + Net.netCount;
    Net.netCount++;

    this.wireList = [];
}

Net.prototype.addWire = function(wire) {
    this.wireList.push(wire);
}

/*
 * ################################################################################################
 * ######################################### Static Stuff #########################################
 * ################################################################################################
 */

Net.netCount = 0;
Net.netList = [];

Net.addWireToNet = function(wire) {
    var foundNet = false;

    for (var n=0; n<Net.netList.length-1; n++) {
        for (var w=0; w<n.wireList.length-1; w++) {
            if (Net.isSameNet(w, wire)) {
                n.addWire(wire);
                foundNet = true;
                break;
            }
        }
        if (foundNet)
            break;
    }

    if (!foundNet) {
        Net.createNewNet(wire);
    }
}

Net.isSameNet = function(w1, w2) {
    if (w1.startPort == w2.startPort) {
        return true;
    }

    if (w1.endPort == w2.startPort) {
        return true;
    }

    if (w1.startPort == w2.endPort) {
        return true;
    }

    if (w1.endPort == w2.endPort) {
        return true;
    }

    return false;
}

Net.createNewNet = function(wire) {
    var net = new Net();
    net.addWire(wire);
    Net.netList.push(net);
}

Net.exportXML = function() {

}
