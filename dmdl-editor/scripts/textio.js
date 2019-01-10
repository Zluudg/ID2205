function TextIO() {
}

TextIO.output = function(msg) {
    alert(msg);
}

TextIO.input = function(msg, defaultVal) {
    var userInput = prompt(msg, defaultVal);
    return userInput;
}
