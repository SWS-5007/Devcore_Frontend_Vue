<template>
  <external-layout>
    <v-btn icon class="back-btn animated fadeIn" @click="previous" v-if="!form.busy">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <input type="text" class="focus-placeholder" ref="focus" autofocus />
    <v-container fill-height style="padding:0" class="animated slideInRight faster">
      <v-form class="w-100 fill-height">
        <v-stepper
          v-model="step"
          :show-arrows="false"
          :light="true"
          class
          style="margin-top:150px;box-shadow:none;padding:0"
          hide-delimiters
          :continuous="false"
        >
          <v-stepper-content :step="0">
            <v-form @submit.prevent="sendInstructions" class="w-100">
              <v-row class="w-100 px-5" justify="center" no-gutters>
                <v-col cols="12">
                  <v-text-field
                    ref="username"
                    @blur="focusLost"
                    :disabled="form.busy"
                    name="username"
                    class="large"
                    v-model="form.username"
                    v-validate="'required|email'"
                    :error="$validateState('username', form)"
                    :error-messages="$displayError('username', form)"
                    aria-autocomplete="new-username"
                    :placeholder="$t('Your email')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    x-large
                    block
                    color="primary"
                    class="mb-4 mx-0 px-0 text-uppercase"
                    :disabled="vErrors.any() || form.busy"
                    :loading="form.busy"
                    rounded
                    @click="sendInstructions"
                  >
                    {{ $t(nextBtnTxt) }}&nbsp;&nbsp;
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-col>
                <!-- <v-col cols="12">
                <div class="text-center">
                  <a @click.prevent="next" href="#" class="text-sm">{{ $t('I have a code') }}</a>
                </div>
                </v-col>-->
                <v-col cols="12">
                  <div class="text-center mt-4">
                    <router-link :to="{name:'login'}" class="text-sm">{{ $t('Login') }}</router-link>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-content>
          <v-stepper-content :step="1">
            <v-form @submit.prevent="sendInstructions" class="w-100">
              <v-row class="w-100 px-5" justify="center" no-gutters>
                <!-- <v-col cols="12">
                <p>
                  <small>{{ $t('Please check your email inbox, we just sent you an email with a PIN to reset your password.') }}</small>
                </p>
                </v-col>-->
                <v-col cols="12">
                  <v-text-field
                    ref="code"
                    @blur="focusLost"
                    :disabled="form.busy"
                    name="code"
                    type="code"
                    class="large"
                    color="primary"
                    v-model="form.code"
                    v-validate="'required|length:6'"
                    :error="$validateState('code', form)"
                    :error-messages="$displayError('code', form)"
                    :placeholder="$t('Received code')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <p v-if="showResend" class="text-center">
                    <small>
                      {{ $t("Didn't get the email?") }}
                      <a
                        href
                        @click.prevent="resend"
                      >{{ $t('Try again') }}</a>
                    </small>
                  </p>
                  <v-btn
                    x-large
                    block
                    :disabled="form.busy || vErrors.any()"
                    :loading="form.busy"
                    color="primary"
                    class="mb-4 mx-0 px-0 text-uppercase"
                    rounded
                    @click="verify"
                  >
                    {{ $t(nextBtnTxt) }}&nbsp;&nbsp;
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-content>
        </v-stepper>
      </v-form>
    </v-container>
  </external-layout>
</template>
<script>
import GQLForm from "@/lib/gqlform";

export default {
  data: () => ({
    error: "",
    step: 0,
    sent: false,
    showResend: false,
    haveCode: false,
    // Create a new form instance
    form: new GQLForm({
      username: "",
      code: null
    })
  }),
  mounted() {
    setTimeout(() => {
      this.$refs["username"].focus();
      const items = document.querySelectorAll(".slider .wrapper .item");
      for (const i in items) {
        if (items[i] && items[i].style) {
          items[i].style.width = this.$refs["slider"].clientWidth + "px";
        }
      }
    }, 1);
  },
  computed: {
    nextBtnTxt: {
      get: function() {
        return this.step < 1 ? "Next" : "Reset password";
      }
    }
  },
  methods: {
    focusLost() {
      try {
        this.$refs["focus"].focus();
        //eslint-disable-next-line
      } catch {}
    },
    focusStep() {
      // let field = this.step === 0 ? "email" : "password";
      // setTimeout(() => {
      //   this.$refs[field].focus();
      // }, 300);
    },
    previous() {
      if (this.step === 0) {
        this.$router.push({
          name: "login"
        });
      } else {
        this.step--;
        this.stepChange(this.step);
      }
    },
    async next() {
      if (this.step === 0) {
        this.step++;
        this.stepChange(this.step);
      }
    },
    stepChange(step) {
      setTimeout(() => {
        if (step > 0) {
          this.$refs["code"].focus();
        } else {
          this.$refs["username"].focus();
        }
      }, 100);
    },
    async verify() {
      try {
        await this.$validator.validate("code");
        if (this.vErrors.any()) {
          this.$refs["code"].focus();
          return;
        }
        this.$validator.reset();
        await this.$store.dispatch("auth/resetPassword", this.form);

        //await this.$router.replace("/");
        window.location.reload();
      } catch (ex) {
        if (ex.code === "TOKEN_EXPIRED") {
          this.resend();
        }
      } finally {
        //this.$validator.reset();
      }
    },
    resend() {
      this.$validator.reset();
      this.previous();
    },
    async sendInstructions() {
      try {
        await this.$validator.validate("username");
        if (this.vErrors.any()) {
          this.$refs["username"].focus();
          return;
        }
        this.$validator.reset();
        this.form.fields.code = null;
        this.showResend = false;
        await this.$store.dispatch("auth/requestResetPassword", this.form);
        this.next();
        this.sent = true;
        setTimeout(() => {
          this.showResend = true;
        }, 30000);
      } catch (ex) {
        console.log(ex)
      } finally {
        this.$validator.reset();
      }
    }
  }
};
</script>