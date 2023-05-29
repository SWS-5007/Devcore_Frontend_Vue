import Vue from 'vue'

Vue.directive('autofocus', {
    // When the bound element is inserted into the DOM...
    inserted(el, binding) {
        // If directive has bound value
        if (binding.value !== undefined && !binding.value) {
            return;
        }
        // Focus the element
        el.focus();
        if (binding.value) {
            el.select();
            el.addEventListener("focus", () => {
                el.select();
            })
        }
    }
});