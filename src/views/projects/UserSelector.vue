<template>
  <div class="anonymous">
    <div class="flex flex-row">
      <div class="sub-title" style="font-size: 0.625rem; color: #666">
        {{ $t("User") }}
      </div>
      <div class="anonymous_title" v-if="!form.anonymous">
        {{ user.firstName }} {{ user.lastName }}
      </div>
      <div class="anonymous_title" v-else>{{ $t("Anonymous") }}</div>
    </div>
    <div
      class="anonymous__toggle-selector"
      :class="`form__type--${form.type}--${checked}`"
      @click="checked = !checked"
    >
      <div class="sub-title displayHideLabel">
        {{ form.anonymous ?  $t("HideName") : $t("ShowName") }}
      </div>
      <div class="check">
        <i class="mdi mdi-check"></i>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data: () => ({
    checked: false,
  }),
  props: {
    form: {
      required: true,
      type: Object,
    },
  },
  watch: {
    checked: function (newVal) {
      this.$emit("selectedInput", newVal);
    },
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
};
</script>
<style scoped>
.displayHideLabel {
  font-size: 0.625rem;
  color: #666;
  font-size: 0.625rem;
  margin-right: 15px;
  display: flex;
  color: rgb(102, 102, 102);
  cursor:pointer;
}
.anonymous__toggle-selector {
  min-width: 105px;
  align-self: center;
}
.anonymous_title {
  color: #000;
  font-size: 1.2em !important;
  line-height: 1em !important;
  font-weight: 700;
}

.anonymous {
  background: #fff;
  max-height: 65px;
  -webkit-box-flex: 0;
  -ms-flex-positive: 0;
  flex-grow: 0;
  position: relative;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.anonymous__toggle-selector .check {
  top: 50%;
  border-radius: 50%;
  position: absolute;
  right: 20px;
  width: 24px;
  height: 24px;
  text-align: center;
  color: #fff;
  line-height: 24px;
  margin-top: -12px;
  font-size: 14px;
  display: block;
  cursor: pointer;
}

.form__type--ISSUE--false > .check,
.form__type--PROBLEM--false > .check {
  background-color: #d0424d;
}
.form__type--ISSUE--true > .check,
.form__type--PROBLEM--true > .check {
  background-color: #fff;
  border: 1px solid #d0424d;
}

.form__type--PROCESS--false > .check,
.form__type--IMPROVEMENT--false > .check {
  background-color: #4294d0;
}

.form__type--PROCESS--true > .check,
.form__type--IMPROVEMENT--true > .check {
  background-color: #fff;
  border: 1px solid #4294d0;
}

.anonymous__toggle-selector.valid .display .check {
  display: block;
}
</style>
