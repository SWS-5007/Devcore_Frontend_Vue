import Vue from 'vue'

Vue.directive('autoresize', {
    // When the bound element is inserted into the DOM...
    inserted(el, binding) {
        // If directive has bound value
        if (binding.value !== undefined && !binding.value) {
            return;
        }
        el.style.height = "auto";
        el.style.height = el.scrollHeight + 'px';
        el.addEventListener("keyup", () => {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + 'px';
        })
    },
    update(el, binding) {
        // If directive has bound value
        if (binding.value !== undefined && !binding.value) {
            return;
        }
        el.style.height = "auto";
        el.style.height = el.scrollHeight + 'px';
    }
});