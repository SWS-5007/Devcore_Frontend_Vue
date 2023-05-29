<template>
  <div
    class="custom-select"
    :class="{expanded:dataExpanded, valid:value}"
    v-click-outside="clickOutside"
  >
    <div @click="toggle">
      <slot name="display">
        <div class="display">
          <div class="label">
            <slot name="label"></slot>
          </div>
          <div class="value">{{ value?getItemLabel(getItem(value)): $t(placeholder) }}</div>
          <div class="check">
            <i class="mdi mdi-check"></i>
          </div>
        </div>
      </slot>
    </div>
    <div class="selector">
      <ul class="options">
        <li
          class="option-item"
          v-for="item in options"
          :key="getItemKey(item)"
          @click="toggleItem(item, $event)"
          :class="{selected:isItemSelected(item)}"
        >{{ getItemLabel(item) }}</li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  name: "custom-select",
  $_veeValidate: {
    name() {
      return this.name;
    },
    value() {
      return this.dataValue;
    }
  },
  props: {
    name: {
      required: false
    },
    expanded: {
      required: false
    },
    placeholder: {
      required: false,
      default: () => "Select one"
    },
    value: {
      required: false
    },
    options: {
      type: Array,
      default: () => []
    },
    getItemValue: {
      type: Function,
      default: item => {
        return item.value;
      }
    },
    getItemLabel: {
      type: Function,
      default: item => {
        return item ? item.label : "";
      }
    },
    autoClose: {
      type: Boolean,
      default: () => true
    },
    mode: {
      type: String,
      default: () => "single"
    },
    allowNull: {
      type: Boolean,
      default: () => false
    }
  },
  data: () => ({
    dataValue: null,
    dataExpanded: false
  }),
  mounted() {
    this.dataValue = this.value;
    //this.dataExpanded = this.expanded;
  },
  methods: {
    getItemKey(item) {
      return this.getItemValue(item) + "_" + this.getItemLabel(item);
    },
    isItemSelected(item) {
      return this.getItemValue(item) === this.value;
    },
    getItem(value) {
      return this.options.find(o => this.getItemValue(o) === value);
    },
    toggleItem(item, event) {
      if (this.isItemSelected(item) && this.allowNull) {
        this.dataValue = null;
      } else {
        this.dataValue = this.getItemValue(item);
      }
      this.$emit("input", this.dataValue, event);
      if (this.dataValue != this.value) {
        this.$emit("change", this.dataValue, event);
      }
      if (this.autoClose) {
        this.close();
      }
    },
    toggle() {
      if (this.dataExpanded) {
        this.close();
      } else {
        this.open();
      }
    },
    open() {
      this.dataExpanded = true;
      this.$emit("open");
    },
    close() {
      this.dataExpanded = false;
      this.$emit("close");
    },
    clickOutside() {
      if (this.dataExpanded) {
        //this.close();
      }
    }
  }
};
</script>