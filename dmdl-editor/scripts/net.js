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
        alert('Netlist error, if you see this error please contact the site admin!');
    }

    Net.netList[index1].wireList = Net.netList[index1].wireList.concat(Net.netList[index2].wireList);
    Net.netList.splice(index2, 1);
}

Net.exportXML = function(filename) {
    var msg = SyntaxChecker.checkSyntax();
    if (msg !== '') {
        var denial = 'Design contains errors, no export will be done.' + '\n';
        denial += 'See list of errors below.' + '\n\n\n';
        TextIO.output(denial + msg);
        return;
    }

    var blockList = [];

    for (var i=0; i<Net.netList.length; i++) {
        for (var j=0; j<Net.netList[i].wireList.length; j++) {
            var name = Net.netList[i].wireList[j].startPort.parentBlock.blockName;
            var uid = Net.netList[i].wireList[j].startPort.parentBlock.uniqueID;
            var block = name + ':' + uid;
            var csvEntry = Net.netList[i].wireList[j].startPort.type + ',';
            csvEntry += Net.netList[i].wireList[j].startPort.mode + ',';
            csvEntry += Net.netList[i].uniqueID + ';';
            if (blockList[block] === undefined)
                blockList[block] = csvEntry;
            else if (blockList[block].indexOf(csvEntry) === -1)
                blockList[block] += csvEntry;

            name = Net.netList[i].wireList[j].endPort.parentBlock.blockName;
            uid = Net.netList[i].wireList[j].endPort.parentBlock.uniqueID;
            block = name + ':' + uid;
            csvEntry = Net.netList[i].wireList[j].endPort.type + ',';
            csvEntry += Net.netList[i].wireList[j].endPort.mode + ',';
            csvEntry += Net.netList[i].uniqueID + ';';
            if (blockList[block] === undefined)
                blockList[block] = csvEntry;
            else if (blockList[block].indexOf(csvEntry) === -1)
                blockList[block] += csvEntry;

        }
    }
    Net.writeToXMLFile(blockList, filename);
}

Net.writeToXMLFile = function(blockList, filename) {
    var xmlString = '<?xml version="1.0" encoding="UTF-8"?>' + '\n';
    xmlString += '<MACprotocol>' + '\n';
    for (var block in blockList) {
        console.log(block);
        var blockData = block.split(':');
        xmlString += '\t' + '<block>' + '\n';
        xmlString += '\t\t' + '<blocktype>' + blockData[0] + '</blocktype>' + '\n';
        xmlString += '\t\t' + '<blockUID>' + blockData[1] + '</blockUID>' + '\n';
        var portList = blockList[block].split(';');
        for (var i=0; i<portList.length-1; i++) {
            var portData = portList[i].split(',');
            xmlString += '\t\t' + '<port>' + '\n';
            xmlString += '\t\t\t' + '<porttype>' + portData[0] + '</porttype>' + '\n';
            xmlString += '\t\t\t' + '<portmode>' + portData[1] + '</portmode>' + '\n';
            xmlString += '\t\t\t' + '<net>' + '\n';
            xmlString += '\t\t\t\t' + '<netUID>' + portData[2] + '</netUID>' + '\n';
            xmlString += '\t\t\t' + '</net>' + '\n';
            xmlString += '\t\t' + '</port>' + '\n';
        }
        xmlString += '\t' + '</block>' + '\n';
    }
    xmlString += '</MACprotocol>'

    if (filename.indexOf('.xml') === -1)
        filename += '.xml';
    var tmp = document.createElement('a');
    tmp.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xmlString));
    tmp.setAttribute('download', filename);

    tmp.style.display = 'none';
    document.body.appendChild(tmp);

    tmp.click();

    document.body.removeChild(tmp);
}
