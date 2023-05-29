<template>
  <div class="stepper">
    <v-btn icon class="back-btn animated fadeIn" @click="previous">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <input type="text" class="focus-placeholder" ref="focus" autofocus />
    <v-stepper v-model="value">
      <v-stepper-items>
        <slot />
      </v-stepper-items>
    </v-stepper>
  </div>
</template>
<script>
export default {
  name: "stepper",
  props: {
    value: {
      required: false,
      default: () => 0
    }
  },
  data: () => ({
    dataStep: 0
  }),
  computed: {
    step: {
      get() {
        return this.dataStep;
      },
      set(value) {
        this.dataStep = value;
      }
    }
  },
  mounted() {
    this.step = this.value;
  },
  methods: {
    previous() {
      this.$refs["focus"].focus();
      if (this.step > 0) {
        this.step = this.step - 1;
      }
      this.$emit("previous", this.step);
      this.$emit("change", this.step);
    },
    next() {
      this.$refs["focus"].focus();
      this.step = this.step + 1;
      this.$emit("next", this.step);
      this.$emit("change", this.step);
    }
  }
};
</script>