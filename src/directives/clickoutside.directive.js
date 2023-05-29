import Vue from 'vue'

const listeners = ['click', 'ontouchstart', 'dblclick', 'contextmenu'];

Vue.directive('click-outside', {
    bind: function(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
            // here I check that click was outside the el and his childrens
            if (!(el == event.target || el.contains(event.target))) {
                event.stopPropagation();
                // and if it did, call method provided in attribute value
                vnode.context[binding.expression](event);
            }
        };
        listeners.forEach(evt => {
            document.body.addEventListener(evt, el.clickOutsideEvent)
        })

    },
    unbind: function(el) {
        listeners.forEach(evt => {
            document.body.removeEventListener(evt, el.clickOutsideEvent)
        })
    },
});