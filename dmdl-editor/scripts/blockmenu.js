function BlockMenu(menu) {
    this.menu = menu;
    this.elements = menu.getElementsByTagName('a');

    var state = this;
    for (var i = 0; i < state.elements.length; i++) {
         // Don't add event listener to the head of the menu
        if (state.elements[i].className == 'menuHead')
            continue;

        state.elements[i].addEventListener('click',
            function() {
                var current = state.menu.getElementsByClassName('active')[0];
                current.className = current.className.replace('active', '');
                this.className += 'active';
            });
    }
}
