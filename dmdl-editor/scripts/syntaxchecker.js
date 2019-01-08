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

    return syntaxError;
}

SyntaxChecker.checkOpenPorts = function() {
    var syntaxError = false;

    return syntaxError;
}
