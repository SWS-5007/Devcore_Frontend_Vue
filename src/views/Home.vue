<template>
  <external-layout>
    <div class="home">
      <slideshow :query="query" />
    </div>
  </external-layout>
</template>

<script>
import SlideShow from "@/components/slideshow/Index";
import { mapGetters } from "vuex";
export default {
  name: "SlideShow",
  components: {
   // slideshow: SlideShow,
  },

  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  data() {
    return {
      query: null,
    };
  },
  async mounted() {
    this.query = this.$route.query;
  },
};
</script>
