<template>
  <div
    class="evaluate-idea"
    :class="{ complete: record.status === 'COMPLETED' }"
  >
    <div class="header">
      <div class="submit-status">
        <v-icon>mdi-check</v-icon>
      </div>

      <small class="supertitle">{{ idea.parent.title }}</small>
      <h4 class="title">{{ idea.title }}</h4>
      <div class="description">{{ idea.description }}</div>
    </div>
    <div
      class="body selection-value"
      v-if="form"
      :class="{ 'has-value': form.moneyValue !== 0 || form.timeValue !== 0 }"
    >
      <div class="flex-grow-0 mb-3">
        <unit-selector
          :units="units"
          v-model="currentUnit"
          class
          @change="changeUnits"
        />
      </div>
      <div class="flex-grow-0 mb-3">
        <div
          class="value"
          v-if="currentUnit === 'MONEY'"
          :class="{
            'has-value': form.moneyValue !== 0,
            positive: form.moneyValue > 0,
            negative: form.moneyValue < 0,
          }"
        >
          {{ (form.moneyValue / 100) | numberFormat("0,0.00") }}
        </div>
        <div
          class="value"
          :class="{
            'has-value': form.timeValue !== 0,
            positive: form.timeValue > 0,
            negative: form.timeValue < 0,
          }"
          v-if="currentUnit === 'TIME'"
        >
          {{ this.timeFactor === -1 ? "-" : "" }}{{ this.hours }}:{{
            this.minutes | numberFormat("00")
          }}
        </div>
        <div class="unit-name">
          {{
            currentUnit === "MONEY"
              ? user.company.currency.name
              : $t("HOURS") +
                " " +
                (form.timeUnit === "TOTAL"
                  ? $t("in total")
                  : $t("a " + form.timeUnit.toLowerCase()))
          }}
        </div>
      </div>
      <div class="flex-grow-0 mb-3">
        <div class="value-selector">
          <div style="font-size: 1.5rem">
            <scroll-picker-group
              class="flex"
              v-if="currentUnit === 'TIME'"
              :key="'time' + idea.id"
            >
              <scroll-picker
                @input="changeFactor"
                v-model="timeFactor"
                :options="factorOptions"
                :reduce="(option) => $t(option)"
                :key="'factorOptions' + idea.id"
              ></scroll-picker>
              <scroll-picker
                @input="changeTime"
                v-model="hours"
                :key="'hours' + idea.id"
                :options="hourOptions"
              ></scroll-picker>
              <scroll-picker
                @input="changeTime"
                v-model="minutes"
                :options="minuteOptions"
                :key="'minutes' + idea.id"
              ></scroll-picker>
            </scroll-picker-group>
            <scroll-picker-group class="flex" v-else :key="'money' + idea.id">
              <scroll-picker
                @input="changeFactor"
                v-model="moneyFactor"
                :options="factorOptions"
                :key="'factorOptions' + idea.id"
              ></scroll-picker>
              <scroll-picker
                @input="changeMoney"
                v-model="ten_thousands"
                :options="tenThousandsOptions"
                :key="'ten_thousands' + idea.id"
              ></scroll-picker>
              <scroll-picker
                @input="changeMoney"
                v-model="thousands"
                :options="thousandsOptions"
                :key="'thousands' + idea.id"
              ></scroll-picker>
              <scroll-picker
                @input="changeMoney"
                v-model="hundreds"
                :options="hundredsOptions"
                :key="'hundreds' + idea.id"
              ></scroll-picker>
            </scroll-picker-group>
          </div>
        </div>
      </div>
      <div class="flex-grow-0" style="height: 1.5rem">
        <unit-selector
          :units="dimensions"
          v-model="form.timeUnit"
          :class="{
            'has-value': form.timeValue !== 0,
            positive: form.timeValue > 0,
            negative: form.timeValue < 0,
          }"
          class="light"
          v-if="currentUnit === 'TIME'"
        />
      </div>
    </div>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import { mapGetters } from "vuex";
export default {
  props: {
    evaluationInstance: {
      required: true,
      type: Object,
    },
    project: {
      required: true,
      type: Object,
    },
    record: {
      required: true,
      type: Object,
    },
    idea: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    hours: 0,
    minutes: 0,
    hundreds: 0,
    thousands: 0,
    ten_thousands: 0,
    moneyFactor: 1,
    timeFactor: 1,
    form: null,
    currentUnit: "TIME",
    factorOptions: [
      {
        value: 1,
        name: "Gain",
      },
      {
        value: -1,
        name: "Loss",
      },
    ],
    hourOptions: [...new Array(160)].map((e, i) => {
      return {
        value: i,
        name: i,
      };
    }),
    minuteOptions: [...new Array(4)].map((e, i) => {
      return {
        value: i * 15,
        name: i * 15,
      };
    }),
    hundredsOptions: [...new Array(10)].map((e, i) => {
      return {
        value: i * 100,
        name: i,
      };
    }),
    thousandsOptions: [...new Array(10)].map((e, i) => {
      return {
        value: i * 1000,
        name: i,
      };
    }),
    tenThousandsOptions: [...new Array(10)].map((e, i) => {
      return {
        value: i * 10000,
        name: i,
      };
    }),
    units: [
      {
        value: "TIME",
        label: "TIME",
        cssClass: {},
      },
      {
        value: "MONEY",
        label: "MONEY",
        cssClass: {},
      },
    ],
    dimensions: [
      {
        value: "WEEK",
        label: "WEEK",
      },
      {
        value: "MONTH",
        label: "MONTH",
      },
      {
        value: "TOTAL",
        label: "TOTAL",
      },
    ],
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  mounted() {
    this.factorOptions.map((option) => (option.name = this.$t(option.name)));
    this.form = new GQLForm({
      id: this.record.id,
      moneyUnit: this.record.moneyUnit,
      moneyValue: this.record.moneyValue,
      timeUnit: this.record.timeUnit,
      timeValue: this.record.timeValue,
      skipped: this.record.status === "SKIPPED",
    });
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
      this.moneyFactor = this.form.moneyValue < 0 ? -1 : 1;
    }
    if (this.form.timeValue !== 0) {
      this.currentUnit = "TIME";
      let timeRest = Math.abs(this.form.timeValue / 100);
      this.hours = Math.floor(timeRest);
      if (this.hours > 159) {
        this.hours = 159;
      }
      this.minutes = (timeRest - this.hours) * 60;
      this.timeFactor = this.form.timeValue < 0 ? -1 : 1;
    }
    this.checkUnitsClass();
    setTimeout(() => {
      this.validate();
    }, 100);
  },
  methods: {
    validate() {
      setTimeout(async () => {
        await this.$validator.validateAll();
        this.$emit("validate", !this.vErrors.any() && this.form.value !== 0);
      }, 100);
    },
    resetUnits(units) {
      if (units === "MONEY") {
        this.form.value = 0;
        this.changeMoney();
        this.validate();
      } else {
        this.form.value = 0;
        this.changeTime();
        this.validate();
      }
    },
    changeFactor() {
      if (this.currentUnit === "TIME") {
        this.changeTime();
      } else {
        this.changeMoney();
      }
    },
    changeUnits(units) {
      this.currentUnit = units;
    },
    checkUnitsClass() {
      this.units.find((v) => v.value === "TIME").cssClass = {
        negative: this.form.timeValue < 0,
        positive: this.form.timeValue > 0,
        "has-value": this.form.timeValue !== 0,
      };
      this.units.find((v) => v.value === "MONEY").cssClass = {
        negative: this.form.moneyValue < 0,
        positive: this.form.moneyValue > 0,
        "has-value": this.form.moneyValue !== 0,
      };
    },
    changeMoney() {
      this.form.moneyValue =
        this.moneyFactor *
        Math.abs((this.ten_thousands + this.thousands + this.hundreds) * 100);
      this.checkUnitsClass();
      this.validate();
    },
    changeTime() {
      this.form.timeValue =
        this.timeFactor *
        Math.abs(Math.floor((this.hours + this.minutes / 60) * 100));
      this.checkUnitsClass();
      this.validate();
    },
    async skip() {
      this.record.status = "SKIPPED";
      this.form.skipped = true;
      await this.$store.dispatch("project/evaluateIdea", {
        form: this.form,
        project: this.project,
        record: this.record,
      });
    },
    hasHoursOrMoneyEvaluated(record) {
      return record.timeValue > 0 || record.moneyValue > 0;
    },
    async save() {
      this.record.unit = this.form.unit;
      this.record.dimension = this.form.dimension;
      this.record.value = this.form.value;
      this.form.skipped = !this.hasHoursOrMoneyEvaluated(this.form);
      try {
        await this.$store.dispatch("project/evaluateIdea", {
          form: this.form,
          project: this.project,
          record: this.record,
        });
      } catch (e) {
        console.error(e);
      } finally {
        const quest = this.user.company.experienceQuests.find(
          (x) => x.title == "Evaluate"
        );
        const expForm = new GQLForm({
          userId: this.user.id,
          questId: quest.id,
        });
        await this.$store.dispatch("experience/update", expForm);
      }
    },
  },
};
</script>