import Vue from 'vue'

Vue.directive('autoselect', {
    // When the bound element is inserted into the DOM...
    inserted(el, binding) {
        // If directive has bound value
        if (binding.value !== undefined && !binding.value) {
            return;
        }
        el.addEventListener("focus", () => {
            el.select();
        })
    }
});