function SyntaxChecker() {}

SyntaxChecker.checkSyntax = function() {

    var msg = '';

    if (SyntaxChecker.checkLooseWires())
        msg += 'Loose wires found!' + '\n';

    if (SyntaxChecker.checkOpenPorts())
        msg += 'Open mandatory ports found!' + '\n';

    return msg;
}

SyntaxChecker.checkLooseWires = function() {
    var syntaxError = false;

    for (var i=0; i<WS.wireList.length; i++) {
        if (WS.wireList[i].startPort.state === "disabled")
            syntaxError = true;

        if (WS.wireList[i].endPort.state === "disabled")
            syntaxError = true;

    }

    return syntaxError;
}

SyntaxChecker.checkOpenPorts = function() {
    var syntaxError = false;

    return syntaxError;
}
