<template>
  <div class="stepper-step animated faster" :class="slideDirection">
      <user-selector
      :user="user"
      :form="form"
      @selectedInput="form.anonymous = $event"
    ></user-selector>
    <div class="header" style="background:#fff">
      <div class="sub-title" style="font-size:.625rem;color:#666">{{ project.process.title }}</div>
      <div class="title">{{ project.name }}</div>
    </div>
    <div class="content d-flex flex-column" style="overflow:auto;" @keyup="validate">
      <div class="body selection-value">
        <div class="flex-grow-0 mb-3">
          <unit-selector :units="units" v-model="currentUnit" class="danger" @change="changeUnits" />
        </div>
        <div class="flex-grow-0 mb-3">
          <div
            class="value"
            :class="{
            'has-value': form.moneyValue!==0,
            'positive': form.moneyValue>0,
            'negative': form.moneyValue<0,
          }"
            v-if="currentUnit==='MONEY'"
          >-{{ Math.abs(form.moneyValue) / 100 | numberFormat("0,0.00") }}</div>
          <div
            class="value"
            :class="{
            'has-value': form.timeValue!==0,
            'positive': form.timeValue>0,
            'negative': form.timeValue<0,
          }"
            v-if="currentUnit==='TIME'"
          >-{{ this.hours}}:{{this.minutes| numberFormat("00")}}</div>
            <div
          class="unit-name"
        >{{ currentUnit==='MONEY'?user.company.currency.name:$t('HOURS') + ' ' + ((form.timeUnit==='TOTAL')?$t('in total'):$t('a ' + form.timeUnit.toLowerCase())) }}</div>
        </div>
        <div class="flex-grow-0 mb-3">
          <div class="value-selector">
            <div style="font-size: 1.5rem;">
              <scroll-picker-group class="flex" v-if="currentUnit==='TIME'" :key="'time' + intent">
                <scroll-picker
                  @input="changeTime"
                  v-model="hours"
                  :key="'hours' + intent"
                  :options="hourOptions"
                ></scroll-picker>
                <scroll-picker
                  @input="changeTime"
                  v-model="minutes"
                  :options="minuteOptions"
                  :key="'minutes' + intent"
                ></scroll-picker>
              </scroll-picker-group>
              <scroll-picker-group
                class="flex"
                v-if="currentUnit==='MONEY'"
                :key="'money' + intent"
              >
                <scroll-picker
                  @input="changeMoney"
                  v-model="ten_thousands"
                  :options="tenThousandsOptions"
                  :key="'ten_thousands' + intent"
                ></scroll-picker>
                <scroll-picker
                  @input="changeMoney"
                  v-model="thousands"
                  :options="thousandsOptions"
                  :key="'thousands' + intent"
                ></scroll-picker>
                <scroll-picker
                  @input="changeMoney"
                  v-model="hundreds"
                  :options="hundredsOptions"
                  :key="'hundreds' + intent"
                ></scroll-picker>
              </scroll-picker-group>
            </div>

            <input type="hidden" v-validate="'required'" v-model="hasValue" name="value" />
          </div>
        </div>
        <div class="flex-grow-0" style="height:1.5rem">
          <unit-selector
            :units="dimensions"
            v-model="form.timeUnit"
            class="light danger"
            :class="{
            'has-value': form.timeValue!==0,
            'positive': form.timeValue>0,
            'negative': form.timeValue<0,
            }"
            v-if="currentUnit==='TIME'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UserSelector from "@/views/projects/UserSelector.vue";
import { mapGetters } from "vuex";

export default {
  components: { UserSelector },
  title: "Loss",
  props: {
    project: {
      required: true,
      type: Object
    },
    issue: {
      required: true,
      type: Object
    },
    form: {
      required: true,
      type: Object
    },
    slideDirection: {
      required: false
    }
  },
  data: () => ({
    intent: null,
    hours: 0,
    currentUnit: "TIME",
    minutes: 0,
    hundreds: 0,
    thousands: 0,
    ten_thousands: 0,
    factor: -1,
    factorOptions: [
      {
        value: 1,
        name: "Gain"
      },
      {
        value: -1,
        name: "Loss"
      }
    ],
    hourOptions: [...new Array(160)].map((e, i) => {
      return {
        value: i,
        name: i
      };
    }),
    minuteOptions: [...new Array(4)].map((e, i) => {
      return {
        value: i * 15,
        name: i * 15
      };
    }),
    hundredsOptions: [...new Array(10)].map((e, i) => {
      return {
        value: i * 100,
        name: i
      };
    }),
    thousandsOptions: [...new Array(10)].map((e, i) => {
      return {
        value: i * 1000,
        name: i
      };
    }),
    tenThousandsOptions: [...new Array(10)].map((e, i) => {
      return {
        value: i * 10000,
        name: i
      };
    }),
    units: [
      {
        value: "TIME",
        label: "TIME",
        cssClass: {}
      },
      {
        value: "MONEY",
        label: "MONEY",
        cssClass: {}
      }
    ],
    dimensions: [
  /*     {
        value: "WEEK",
        label: "WEEK"
      },
      {
        value: "MONTH",
        label: "MONTH"
      }, */
      {
        value: "TOTAL",
        label: "TOTAL"
      }
    ]
  }),
  computed: {
    ...mapGetters({
      user: "auth/user"
    }),
    hasValue: {
      get: function() {
        return this.form.moneyValue !== 0 || this.form.timeValue !== 0;
      }
    },
    max: {
      get: function() {
        if (this.form.estimatedCosts < 1001) {
          return 1100;
        }
        if (this.form.estimatedCosts < 10001) {
          return 10100;
        }
        return 100000;
      }
    },
    step: {
      get: function() {
        if (this.form.estimatedCosts < 10000) {
          return 100;
        }
        return 1000;
      }
    }
  },
  mounted() {
    this.intent = new Date().getUTCMilliseconds();
    this.validate();

    if (this.form.moneyValue !== 0) {
      this.currentUnit = "MONEY";
      let moneyRest = Math.abs(this.form.moneyValue / 100);
      this.ten_thousands = Math.floor(moneyRest / 10000) * 10000;
      if (this.ten_thousands > 90000) {
        this.ten_thousands = 90000;
      }
      this.thousands =
        Math.floor((moneyRest - this.ten_thousands) / 1000) * 1000;
      if (this.thousands > 9000) {
        this.thousands = 9000;
      }
      this.hundreds = Math.floor(
        moneyRest - this.ten_thousands - this.thousands
      );
    }
    if (this.form.timeValue !== 0) {
      this.currentUnit = "TIME";
      let timeRest = Math.abs(this.form.timeValue / 100);
      this.hours = Math.floor(timeRest);
      if (this.hours > 159) {
        this.hours = 159;
      }
      this.minutes = (timeRest - this.hours) * 60;
    }
    this.checkUnitsClass();
    setTimeout(() => {
      this.validate();
    });
  },
  methods: {
    validate() {
      this.hasValue;
      setTimeout(() => {
        this.$validator.validateAll();
        this.$emit("validate", !this.vErrors.any());
      }, 100);
    },
    resetUnits(units) {
      if (units === "MONEY") {
        this.form.moneyValue = 0;
        this.changeMoney();
        this.validate();
      } else {
        this.form.timeValue = 0;
        this.changeTime();
        this.validate();
      }
    },
    checkUnitsClass() {
      this.units.find(v => v.value === "TIME").cssClass = {
        negative: this.form.timeValue < 0,
        positive: this.form.timeValue > 0,
        "has-value": this.form.timeValue !== 0
      };
      this.units.find(v => v.value === "MONEY").cssClass = {
        negative: this.form.moneyValue < 0,
        positive: this.form.moneyValue > 0,
        "has-value": this.form.moneyValue !== 0
      };
    },
    changeFactor() {
      this.changeTime();
      this.changeMoney();
      // if (this.form.unit === "TIME") {
      //   this.changeTime();
      // } else {
      //   this.changeMoney();
      // }
    },
    changeUnits(units) {
      this.currentUnit = units;
    },
    changeMoney() {
      this.form.moneyValue =
        this.factor *
        Math.abs((this.ten_thousands + this.thousands + this.hundreds) * 100);
      this.checkUnitsClass();
      this.validate();
    },
    changeTime() {
      this.form.timeValue =
        this.factor *
        Math.abs(Math.floor((this.hours + this.minutes / 60) * 100));
      this.checkUnitsClass();
      this.validate();
    }
  }
};
</script>