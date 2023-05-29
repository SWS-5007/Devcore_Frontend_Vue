import Vue from "vue";
import VueRouter from "vue-router";
import Settings from "../views/Settings.vue";
import Score from "../views/Score.vue";
import guest from "@/middlewares/guest";
import auth from "@/middlewares/auth";
Vue.use(VueRouter);

const routes = [
  {
    path: "/projects",
    name: "projects",
    component: () =>
      import(/* webpackChunkName: "projects" */ "../views/projects/Index.vue"),
    meta: {
      middleware: [auth]
    },
    children: [
      {
        path: ":id/details",
        name: "project-details",
        component: () =>
          import(
            /* webpackChunkName: "projects" */ "../views/projects/Details.vue"
          )
      },
      {
        path: ":id/ideas/:tab",
        name: "project-ideas",
        component: () =>
          import(
            /* webpackChunkName: "projects" */ "../views/projects/IdeasDialog.vue"
          )
      },
      {
        path: ":id/ideas/:tab/:ideaId?",
        name: "project-ideas-idea",
        component: () =>
          import(
            /* webpackChunkName: "projects" */ "../views/projects/IdeasContentDialog.vue"
          )
      },
      {
        path: ":id/evaluate",
        name: "project-evaluate",
        component: () =>
          import(
            /* webpackChunkName: "projects" */ "../views/projects/EvaluateDialog.vue"
          )
      },
      {
        path: ":id/share-idea/:ideaId?",
        name: "project-share-idea",
        component: () =>
          import(
            /* webpackChunkName: "projects" */ "../views/projects/ShareIdeaDialog.vue"
          )
      },
      {
        path: ":id/report-issue/:issueId?",
        name: "project-report-issue",
        component: () =>
          import(
            /* webpackChunkName: "projects" */ "../views/projects/ReportIssueDialog.vue"
          )

      },
      {
        path: ":id/invite-user",
        name: "invite-user",
        component: () =>
          import(
            /* webpackChunkName: "projects" */ "../views/projects/InviteUser.vue"
          )
      },
    ]
  },
  {
    path: "/settings",
    name: "settings",
    //component: Settings,
    component: () =>
      import(/* webpackChunkName: "home" */ "../views/Settings.vue"),
    meta: {
      middleware: [auth]
    }
  },
  {
    path: "/score",
    name: "score",
    component: () =>
      import(/* webpackChunkName: "home" */ "../views/Score.vue"),
    meta: {
      middleware: [auth]
    }
  },
  {
    path: "/home",
    name: "home",
    component: () => import(/* webpackChunkName: "home" */ "../views/Login.vue"),
    meta: {
      middleware: [guest]
    }
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue"),
    meta: {
      middleware: [guest]
    }
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/ForgotPassword.vue"),
    meta: {
      middleware: [guest]
    }
  },
  {
    path: "*",
    redirect: "/projects",
    middleware: [auth]
  },
  {
    path: '/share/:urlHash',
    name: 'share',
    meta: {
      middleware: [auth],
      layout: "external-layout"
    },
    component: () =>
      import(/* webpackChunkName: "profile" */ "@/views/ShareLink"),
  },  
];

const router = new VueRouter({
  mode: "hash",
  base: "/mobile/",
  routes
});

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

export default router;
