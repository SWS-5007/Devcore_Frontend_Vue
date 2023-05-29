<template>
  <v-app-bar app color="white" flat :hide-on-scroll="false" class="app-bar">
    <div class="content">
      <div class="menuBtn">
        <v-btn icon @click="openMenu">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>

      <div class="title">
        <h3 class="username">{{ $t("hi", { name: user.firstName }) }}</h3>
        <small>{{ $tc("you.project.count", getUserProjects.length) }}</small>
      </div>

      <animation-transition :animation-in-type="AnimationType.ZOOMIN" :animation-out-type="AnimationType.ZOOMOUT">
        <div class="Menu" v-if="menuVisable">
          <div class="clandeploy-logo">
            <img slot="reference" :src="clandeploy" alt="" />
          </div>
          <div style="padding: 0 16px;">
            <div class="Menu_Item_Group">
              <div class="Menu_Item">
                <v-btn icon>
                  <v-icon>mdi-share-variant-outline</v-icon>
                </v-btn>
                <span class="Menu_title">{{ $t("Share Idea") }}</span>
              </div>
              <div class="Menu_Item">
                <v-btn icon>
                  <v-icon>mdi-alert-outline</v-icon>
                </v-btn>
                <span class="Menu_title">{{ $t("Report Issue") }}</span>
              </div>
              <div class="Menu_Item">
                <v-btn icon>
                  <v-icon>mdi-email-newsletter</v-icon>
                </v-btn>
                <span class="Menu_title">{{ $t("Invite User") }}</span>
              </div>
            </div>
            <v-btn class="CloseMenuBtn" @click="closeMenu">{{ $t("Close Menu") }}</v-btn>
          </div>
        </div>
      </animation-transition>

      <!-- <div class="avatar">
        <router-link :to="{ name: 'settings' }">
          <v-avatar
            :color="user.getAvatarUrl('50x50') ? 'transparent' : 'primary'"
            class="border-primary"
            size="32"
          >
            <img
              :src="user.getAvatarUrl('50x50')"
              height="22"
              v-if="user.getAvatarUrl('50x50')"
            />
            <span class="white--text" style="font-size: 0.9rem" v-else>{{
              user.initials
            }}</span>
          </v-avatar>
        </router-link>
      </div> -->
    </div>
  </v-app-bar>
</template>
<script>
import { mapGetters } from "vuex";
import clandeploy from "@/assets/img/clandeploy.svg";
// Load on demand
import { AnimationVueTransition, AnimationVueTransitionType } from 'vue-animation'

export default {
  components: {
    [AnimationVueTransition.name]: AnimationVueTransition,
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      projects: "project/all",
      showBack: "app/show_back",
    }),
    getUserProjects: {
      get: function () {
        const projects = [...this.projects].sort((a, b) => {
          if (a.hasUserPendingEvaluations && !b.hasUserPendingEvaluations) {
            return -1;
          }
          if (b.hasUserPendingEvaluations && !a.hasUserPendingEvaluations) {
            return 1;
          }
          return a.name > b.name ? 1 : -1;
        });

        return projects.filter((project) => project.activeIdeaCount > 0);
      },
    },
  },
  data() {
    return {
      randomNumber: null,
      menuVisable: false,
      clandeploy,
      AnimationType: AnimationVueTransitionType,
    };
  },

  mounted() {
    document.body.classList.add("has-app-bar");
  },
  beforeDestroy() {
    document.body.classList.remove("has-app-bar");
  },
  methods: {
    goBack() {
      this.$router.replace({
        name: "projects",
      });
    },
    closeMenu() {
      this.menuVisable = false;
    },
    openMenu() {
      this.menuVisable = true;
    }
  },
};
</script>