<template>
    <v-card class="d-flex flex-column share-idea-form">
    <v-toolbar
      color="white"
      height="85"
      elevation="0"
      class="border border-0 border-bottom-1"
    >
      <v-toolbar-title class="card-header">
        <div class="left-tools">
          <v-btn icon @click="close">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </div>
        <h4 class="title">{{ $t("Invite") + " " + $t("User") }}</h4>
      </v-toolbar-title>			
    </v-toolbar>
  <v-form 
  class="d-flex flex-column flex-grow-1"
  style="color: #111; border-radius: 0 0 5px 5px; overflow: hidden"
  @submit.prevent="save" @keyup="$validator.validateAll()">
		<v-container fluid class="mt-0 overflow-y-auto animated slideInRight faster">
      <v-row>
        <v-col cols="12" class="px-0 py-0">
          <h4 class="text-center my-4 block-title"><span>{{ $t('Personal Details') }}</span></h4>
        </v-col>
        <v-col cols="12" class="px-0 py-0">
          <v-text-field
          id="email"
          :disabled="form.busy"
          v-model="form.email"
          :label="$t('Email')"
          type="email"
          class="inline inner"
          name="email"
          @input="changeValue"
          :error="$validateState('email', form)"
          :error-messages="$displayError('email', form)"
          v-validate="'required|email'"
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="px-0 py-0">
          <v-text-field
          id="firstName"
          :disabled="form.busy"
          v-model="form.firstName"
          :label="$t('First name')"
          type="text"
          class="inline inner"
          name="firstName"
          @input="changeValue"
          :error="$validateState('firstName', form)"
          :error-messages="$displayError('firstName', form)"
          v-validate="'required|min:2'"
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="px-0 py-0">
          <v-text-field
          id="lastName"
          :disabled="form.busy"
          v-model="form.lastName"
          :label="$t('Last name')"
          class="inline inner"
          type="text"
          name="lastName"
          @input="changeValue"
          :error="$validateState('lastName', form)"
          :error-messages="$displayError('lastName', form)"
          v-validate="'required|min:2'"
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="px-0 py-0">
          <v-text-field
          id="phoneNumber"
          :disabled="form.busy"
          v-model="form.phone"
          :label="$t('Phone')"
          class="inline inner"
          type="text"
          name="phone"
          @input="changeValue"
          v-validate="'phone_validation'"
          :error="$validateState('phone', form)"
          :error-messages="$displayError('phone', form)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="px-0 py-0">
          <h4 class="text-center my-4 block-title"> <span>{{ $t('companyRole') }}</span></h4>
        </v-col>
        <v-col cols="12" class="px-0 py-0">
          <v-select
          v-model="form.companyRoleId"
          v-validate="'required'"
          data-vv-name="companyRole"
          name="companyRole"
          @change="changeRole"
          :placeholder="$t('Select Role')"
          :items="getAssignableRoles"
          class="px-4"
          :error="$validateState('companyRole', form)"
          :error-messages="$displayError('companyRole', form)"
          ></v-select>
        </v-col>
        <v-divider />
        <v-col cols="12" class="px-0 py-0">
          <h4 class="text-center my-4 block-title"> <span>{{ $t('Access') }}</span></h4>
        </v-col>
        <v-col cols="12" class="px-0 py-0" v-if="project">
          <project-instructions
            :project="project"
          ></project-instructions>
        </v-col>
        <v-col cols="12" class="px-0 py-2">
          <div class="text-danger text-center">{{ $t("You are sharing these company data to this user") }}</div>
        </v-col>
        <v-col cols="12" class="px-0 py-2">
          <div v-if="formSubmit" class="text-center">
            {{ $t("Successfully sent") }}
          </div>
        </v-col>
      </v-row>
      </v-container>
    <v-card-actions class="px-0 py-0 overflow-hidden">
      <v-btn
          elevation="0"
          class="text-uppercase"
          tile
          block
          color="primary"
          :loading="form.busy"
          :disabled="vErrors.any() || form.busy"
          x-large
          @click="save"
          >{{ $t("Invite") }}</v-btn
          >
    </v-card-actions>
  </v-form>
  </v-card>

</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import Instructions from "./Instructions";
import EventBus from "@/lib/eventbus";
	export default {
		components: {
			"project-instructions": Instructions,
		},		
		props: {
			project: {
				required: true,
				type: Object,
				default: null
			},
		},
		data: () => ({
			formSubmit: false,
			form: {},
		}),
		computed: {
			...mapGetters({
				user: "auth/user",
				// serverConfig: "app/serverConfig",
				companyRoles: "companyRole/all",
			}),
			getAssignableRoles() {
				const items = [];
				this.companyRoles.forEach((element) => {
					items.push({
						text: element.name,
						value: element.id,
					});
				});
				return items;
			},
		},
		methods: {
      async changeValue(e) {
        const abc = await this.$validator.validateAll({silent: true});
        console.log(abc);
      },
			async changeRole(e) {
				EventBus.$emit("invite/changerole", e);
        const abc = await this.$validator.validateAll({silent: true});
        console.log(abc);
			},
			initForm() {
				this.form = new GQLForm({
					email: '',
					firstName: '',
					lastName: '',
					phone: '',
					companyRoleId: '',
					projectId: null
				});
			},
			async save() {
				this.formSubmit = false;
				try {
					await this.$validator.validateAll();
					if (!this.vErrors.any()) {
						
						this.form.projectId = this.project.id;
						this.formSubmit = await this.$store.dispatch("user/invite", this.form);

						this.close();
						this.initForm();
						await this.$router.replace("/");
					}
				} catch (ex) {
					console.error(ex.message);
				}
			},
			close() {
				this.$emit("close");
			},
		},
		async mounted() {
			this.initForm();
			await this.$store.dispatch("companyRole/findAll");
      // await this.$validator.validateAll();
		},
	};
</script>

<style scoped lang="scss">
	@media screen and (min-width: 650px) {
		.user_profile_page {
			display: flex;
			min-width: 650px;
			width: 50%;
			flex-direction: column;
			margin: auto;
		}
	}

h4.block-title {
   width: 100%; 
   color: #4294d0;
   text-align: center; 
   border-bottom: 1px solid #ddd; 
   line-height: 0.1em;
   margin: 10px 0 20px; 
} 

h4.block-title span { 
    background:#ffffff; 
    padding:0 10px; 
}
.v-dialog.v-dialog--fullscreen .dialog-container>.v-card .v-card__text {
  padding: 15px 10px
}
</style>