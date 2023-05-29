<template>
	<div>
		<b-spinner style="color: lightgray"></b-spinner>
	</div>
</template>
<script>
	import GQLForm from "@/lib/gqlform";
	import { blockUi, unblockUi } from "@/lib/utils";
	import { mapGetters } from "vuex";

	export default {
		data: () => ({
			exists: ''
		}),
		computed: {
			...mapGetters({
				shareLink: "app/shared",
				user: "auth/user",
			}),
		},
		async mounted() {

			if( typeof this.shareLink.id === "undefined" ){
				await this.$router.replace("/");
			}

			const form = new GQLForm({
				id: this.shareLink.id
			});
			try {
				blockUi();
				const response = await this.$store.dispatch('shareLink/shareProjectByLinkId', form)

				if (response.data.shareProjectByLinkId) {
					console.log( 'Exist link' );
				} else {
					console.log( 'Invalid link' );
				}

				this.$store.dispatch("app/shared", "")
				await this.$router.replace("/");
				unblockUi();
			} catch (e) {
				console.log(e);
			}
		}
	}
</script>
