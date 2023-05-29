<template>
  <external-layout>
    <v-btn icon class="back-btn animated fadeIn" @click="previous" v-if="!form.busy && step === 2">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <input type="text" class="focus-placeholder" ref="focus" autofocus />
    <v-container style="padding: 0" class="animated slideInRight faster">
      <v-form @submit.prevent="login" class="w-100 fill-height" v-if="!showRegister">
        <v-stepper v-model="step" :show-arrows="false" :light="true" height="100%" class="stepper"
          style="margin-top: 150px; box-shadow: none; padding: 0" hide-delimiters :continuous="false">
          <v-stepper-content :step="1">
            <v-row class="w-100 px-5" justify="center" no-gutters>
              <v-col cols="12">
                <v-text-field ref="username" :disabled="form.busy" name="username" class="large"
                  v-model.trim="form.username" v-validate="'required|email'" :error="$validateState('username', form)"
                  :error-messages="$displayError('username', form)" aria-autocomplete="new-username"
                  :placeholder="$t('Your email')"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-btn x-large block color="primary" class="mb-4 mx-0 px-0 text-uppercase" rounded @click="next">
                  {{ $t(nextBtnTxt) }}&nbsp;&nbsp;
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>
          <v-stepper-content :step="2">
            <v-row class="w-100 px-5" justify="center" no-gutters>
              <v-col cols="12">
                <v-text-field ref="password" @blur="focusLost" :disabled="form.busy" name="password" class="large"
                  color="primary" v-model="form.password" v-validate="'required|min:4'"
                  :type="showPassword ? 'text' : 'password'" :error="$validateState('password', form)"
                  :error-messages="$displayError('password', form)" @click:append="() => (showPassword = !showPassword)"
                  aria-autocomplete="new-password" :placeholder="$t('Your password')"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-btn x-large block :disabled="form.busy || vErrors.any()" :loading="form.busy" color="primary"
                  class="mb-4 mx-0 px-0 text-uppercase" rounded @click="next">
                  {{ $t(nextBtnTxt) }}&nbsp;&nbsp;
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>
        </v-stepper>
        <div class="text-center mb-2" v-if="shareLink">
          New to DevCore?
          <a style="cursor: pointer; text-decoration: underline" @click="toggleRegister">Register</a>
        </div>
        <div class="text-center">
          <router-link :to="{ name: 'forgot-password' }" class="text-sm">{{
            $t("Forgot your password?")
          }}</router-link>
        </div>
      </v-form>

      <div class="" v-if="showRegister && shareLink">
        <register-form :callback="toggleRegister" />
      </div>
    </v-container>
  </external-layout>
</template>

<script>
import GQLForm from "@/lib/gqlform";
import { mapGetters } from "vuex";
import Register from "./Register";

export default {
  data: () => ({
    error: "",
    disable: false,
    step: 1,
    showPassword: false,
    showRegister: false,
    // Create a new form instance
    form: new GQLForm({
      username: "",
      password: "",
      remember: true,
    }),
  }),
  components: {
    "register-form": Register,
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      shareLink: "app/shared",
    }),
    nextBtnTxt: {
      get: function () {
        return this.step < 2 ? "Next" : "Login";
      },
    },
  },

  beforeDestroy() {
    document.removeEventListener("keypress", this.nextOnEnter);
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener("keypress", this.nextOnEnter);
    });

    this.$nextTick(() => {
      setTimeout(() => {
        this.$refs.username.$refs.input.focus();
      });
    });
  },
  methods: {
    nextOnEnter(event) {
      if (event.keyCode === 13) {
        this.next();
      }
    },
    previous() {
      if (this.step === 1) {
        this.$router.push({
          name: "home",
        });
      } else {
        this.step--;
        this.stepChange(this.step);
      }
    },
    async next() {
      if (this.step === 1) {
        await this.$validator.validate("username");
        if (!this.vErrors.any()) {
          this.step++;
          this.stepChange(this.step);
        } else {
          this.$refs["username"].focus();
        }
      } else {
        await this.$validator.validate("password");
        if (!this.vErrors.any()) {
          this.login();
        } else {
          this.$refs["password"].focus();
        }
      }
    },
    stepChange(step) {
      try {
        setTimeout(() => {
          if (step > 0 && !this.disable) {
            this.$refs["password"].focus();
          } else {
            this.$refs["username"].focus();
          }
        }, 100);
      } catch (e) {
        console.log(e);
      }
    },
    focusLost() {
      try {
        this.$refs["focus"].focus();
      } catch (e) {
        console.log(e);
      }
    },
    async login() {
      try {
        this.error = "";
        await this.$store.dispatch("auth/login", this.form);
        var dts = this.$store.getters["app/deviceToken"];
        if (dts != null) {
          await this.$store.dispatch(
            "app/updateDeviceToken",
            new GQLForm({
              id: this.user.id,
              deviceToken: dts,
              type: "android",
            })
          );
        }
        this.disable = true;

        await this.$router.replace(
          this.$store.getters["app/intented_route"] || "/"
        );
      } catch (ex) {
        if (ex && ex.code && ex.code === "MUST_VERIFY_EMAIL") {
          await this.$router.push({
            name: "send-email-verification",
            query: { email: this.form.username },
          });
        } else {
          if (ex && ex.message) {
            const key = "username";
            const field = this.$validator.fields.find({
              name: key,
              scope: this.$options.scope,
            });

            if (field) {
              this.$validator.errors.add({
                id: field.id,
                field: key,
                msg: ex.message,
                scope: this.$options.scope,
              });

              field.setFlags({
                invalid: true,
                valid: false,
                validated: true,
              });
            }
          }
        }
        this.previous();
      }
    },
    toggleRegister: function () {
      this.showRegister = !this.showRegister;
    },
  },
};
</script>

<style lang="scss">
@media screen and (min-width: 650px) {
  .container {
    display: flex;
    min-width: 650px;
    width: 50%;
    flex-direction: column;
    margin: auto;
  }
}
</style>
