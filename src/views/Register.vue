<template>
	<v-container
		style="padding: 0; margin-top: 100px; box-shadow: none; padding: 0; max-height:70vh; overflow-y:auto;"
		class="animated slideInRight faster">
		<v-form @submit.prevent="save" class="w-100">
			<v-row class="w-100 px-5" justify="center" no-gutters>
				<v-col cols="12">
					<v-text-field
					ref="firstName"
					:disabled="form.busy"
					name="firstName"
					class="large"
					v-model.trim="form.firstName"
					v-validate="'required'"
					:error="$validateState('firstName', form)"
					:error-messages="$displayError('firstName', form)"
					:placeholder="$t('First Name')"
					></v-text-field>
				</v-col>
			</v-row>
			<v-row class="w-100 px-5" justify="center" no-gutters>
				<v-col cols="12">
					<v-text-field
					ref="lastName"
					:disabled="form.busy"
					name="lastName"
					class="large"
					v-model.trim="form.lastName"
					v-validate="'required'"
					:error="$validateState('lastName', form)"
					:error-messages="$displayError('lastName', form)"
					:placeholder="$t('Last Name')"
					></v-text-field>
				</v-col>
			</v-row>
			<v-row class="w-100 px-5" justify="center" no-gutters>
				<v-col cols="12">
					<v-text-field
					ref="phone"
					:disabled="form.busy"
					name="phone"
					class="large"
					v-model.trim="form.phone"
					:error="$validateState('phone', form)"
					:error-messages="$displayError('phone', form)"
					:placeholder="$t('Mobile No.')"
					></v-text-field>
				</v-col>
			</v-row>
			<v-row class="w-100 px-5" justify="center" no-gutters>
				<v-col cols="12">
					<v-text-field
					ref="email"
					:disabled="form.busy"
					name="email"
					class="large"
					v-model.trim="form.email"
					v-validate="'required|email'"
					:error="$validateState('email', form)"
					:error-messages="$displayError('email', form)"
					:placeholder="$t('Your email')"
					></v-text-field>
				</v-col>
			</v-row>
			<v-row class="w-100 px-5" justify="center" no-gutters>
				<v-col cols="12">
					<v-text-field
					ref="password"
					type="password"
					:disabled="form.busy"
					name="password"
					class="large"
					v-model.trim="form.password"
					v-validate="'required|min:6'"
					:error="$validateState('password', form)"
					:error-messages="$displayError('password', form)"
					:placeholder="$t('Password')"
					></v-text-field>
				</v-col>
			</v-row>
			<v-row class="w-100 px-5" justify="center" no-gutters>
				<v-col cols="12">
					<v-text-field
					ref="passwordConfirmation"
					type="password"
					:disabled="form.busy"
					name="passwordConfirmation"
					class="large"
					v-model.trim="passwordConfirmation"
					v-validate="{
                        min: 6,
                        confirmed: 'password',
                      }"				
					:error="$validateState('passwordConfirmation', form)"
					:error-messages="$displayError('passwordConfirmation', form)"
					:placeholder="$t('Confirm Password')"
					></v-text-field>
				</v-col>
			</v-row>
			<v-row class="w-100 px-5" justify="center" no-gutters>
				<v-col cols="12">
					<v-btn
						x-large
						block
						color="primary"
						class="mb-4 mx-0 px-0 text-uppercase"
						rounded
						type="submit"
						>
						{{ $t('Register') }}
					</v-btn>
				</v-col>
			</v-row>

			<div class="text-center">
				Already have an account? <a style="cursor:pointer;text-decoration:underline;" @click="showLogin">Login</a>
			</div>
		</v-form>
	</v-container>
</template>
<script>
	import { mapGetters } from "vuex";
	import GQLForm from "@/lib/gqlform";
	import { blockUi, unblockUi } from "@/lib/utils";

	export default {
		props: {
			callback: null,
		},
		data: () => ({
			form: new GQLForm({
				firstName: null,
				lastName: null,
				email: null,
				phone: null,
				password: null,
				companyRoleId: null,
				companyId: null,
				projectId: null,
			}),
			passwordConfirmation: "",
		}),
		computed: {
			...mapGetters({
				shareLink: "app/shared"
			}),
		},
		async mounted() {
			this.form.companyRoleId = this.shareLink.companyRoleId
			this.form.companyId = this.shareLink.companyId
			this.form.projectId = this.shareLink.projectId
		},
		methods: {
			initForm() {
				this.form = new GQLForm({
					firstName: null,
					lastName: null,
					email: null,
					phone: null,
					password: "",
				});
			},
			showLogin: function () {
				this.callback();
			},
			save: async function () {
				await this.$validator.validateAll();
				if (!this.vErrors.any()) {
					await this.$validator.reset();
					await this.$store.dispatch("user/register", this.form);

// Login
					const loginForm = new GQLForm({
						username: this.form.email,
						password: this.form.password,
						remember: false,
					});

					try {
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
							this.$store.getters["app/intented_route"] || defaultRoute
							);
					} catch (ex) {
						if (ex.code && ex.code === "MUST_VERIFY_EMAIL") {
							await this.$router.push({
								name: "send-email-verification",
								query: { email: this.form.username },
							});
						}
					} finally {
						unblockUi();
					}
					this.$emit("input", this.input);
					this.$emit("done");
				}
			}
		}
	}
</script>
