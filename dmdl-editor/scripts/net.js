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

    for (var i=0; i<Net.netList.length; i++) {
        for (var j=0; j<Net.netList[i].wireList.length; j++) {
            if (Net.isInSameNet(Net.netList[i].wireList[j], wire)) {
                Net.netList[i].addWire(wire);
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

    Net.handleMergedNets();
}

Net.isInSameNet = function(w1, w2) {
    if (w1.startPort === w2.startPort) {
        return true;
    }

    if (w1.endPort === w2.startPort) {
        return true;
    }

    if (w1.startPort === w2.endPort) {
        return true;
    }

    if (w1.endPort === w2.endPort) {
        return true;
    }

    return false;
}

Net.createNewNet = function(wire) {
    var net = new Net();
    net.addWire(wire);
    Net.netList.push(net);
}

Net.handleMergedNets = function() {
    for (var i=0; i<Net.netList.length; i++) {
        for (var j=i+1; j<Net.netList.length; j++) {
            if (Net.isConnected(Net.netList[i], Net.netList[j]))
                Net.mergeNets(i, j);
        }
    }
}

Net.isConnected = function(net1, net2) {
    if (net1 === net2)
        return false;

    for (var i=0; i<net1.wireList.length; i++) {
        for (var j=0; j<net2.wireList.length; j++) {
            if (Net.isInSameNet(net1.wireList[i], net2.wireList[j]))
                return true;
        }
    }

    return false;
}

Net.mergeNets = function(i, j) {
    var index1;
    var index2;

    if (i < j) {
        index1 = i;
        index2 = j;
    }

    else if (i > j) {
        index1 = j;
        index2 = i;
    }

    else { // i == j, should never happen
        alert("Netlist error");
    }

    Net.netList[index1].wireList = Net.netList[index1].wireList.concat(Net.netList[index2].wireList);
    Net.netList.splice(index2, 1);
}

Net.exportXML = function(filename) {
    var blockList = [];

    for (var i=0; i<Net.netList.length; i++) {
        for (var j=0; j<Net.netList[i].wireList.length; j++) {
            var uid = Net.netList[i].wireList[j].startPort.parentBlock.uniqueID;
            var csvEntry = Net.netList[i].wireList[j].startPort.type + ',';
            csvEntry += Net.netList[i].wireList[j].startPort.mode + ',';
            csvEntry += Net.netList[i].uniqueID + ';';
            if (blockList[uid] === undefined)
                blockList[uid] = csvEntry;
            else if (blockList[uid].indexOf(csvEntry) === -1)
                blockList[uid] += csvEntry;

            uid = Net.netList[i].wireList[j].endPort.parentBlock.uniqueID;
            csvEntry = Net.netList[i].wireList[j].endPort.type + ',';
            csvEntry += Net.netList[i].wireList[j].endPort.mode + ',';
            csvEntry += Net.netList[i].uniqueID + ';';
            if (blockList[uid] === undefined)
                blockList[uid] = csvEntry;
            else if (blockList[uid].indexOf(csvEntry) === -1)
                blockList[uid] += csvEntry;

        }
    }

    Net.writeToXMLFile(blockList, filename);
}

Net.writeToXMLFile = function(blockList, filename) {
    var xmlString = "";
    for (var uid in blockList) {
        xmlString += "<block>" + "\n";
        xmlString += "\t" + "<blockUID>" + uid + "</blockUID>" + "\n";
        var portList = blockList[uid].split(";");
        for (var i=0; i<portList.length-1; i++) {
            var portData = portList[i].split(",");
            xmlString += "\t" + "<port>" + "\n";
            xmlString += "\t\t" + "<porttype>" + portData[0] + "</porttype>" + "\n";
            xmlString += "\t\t" + "<portmode>" + portData[1] + "</portmode>" + "\n";
            xmlString += "\t\t" + "<net>" + "\n";
            xmlString += "\t\t\t" + "<netUID>" + portData[2] + "</netUID>" + "\n";
            xmlString += "\t\t" + "</net>" + "\n";
            xmlString += "\t" + "</port>" + "\n";
        }
        xmlString += "</block>" + "\n";
    }
}
