var header = document.getElementById("block-menu");
var elements = header.getElementsByTagName("a");

for (var i = 0; i < elements.length; i++) {
    if (elements[i].className == "menu-head") // Don't add event listener to the head of the menu
        continue;

    elements[i].addEventListener("click",
    function() {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace("active", "");
        this.className += " active";
    });
}
