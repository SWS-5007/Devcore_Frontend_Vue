import Vue from 'vue';
import numeral from 'numeral';

Vue.filter("numberFormat", function(value, format) {
    return numeral(Number(value)).format(format); // displaying other groupings/separators is possible, look at the docs
});