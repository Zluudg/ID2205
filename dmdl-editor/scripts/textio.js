function TextIO() {
}

TextIO.output = function(msg) {
    alert(msg);
}

TextIO.input = function(msg) {
    var userInput = prompt(msg);
    return userInput;
}
