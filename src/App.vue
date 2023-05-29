<style>
@import "./assets/css/app.css";
@import "./assets/css/project.css";
@import "./assets/css/milestone-icons.css";
@import "./assets/css/material-design-icons.css";
</style>
<template>
  <v-app>
    <router-view />
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Alert!</v-card-title>

        <v-card-text>
          {{ alertMsg }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="danger"
            class="mx-3"
            rounded
            outlined
            text
            @click="ignoreAlert()"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            class="mx-3 text-uppercase"
            rounded
            outlined
            text
            @click="viewDetail()"
          >
            View
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- <vue-snotify /> -->
  </v-app>
</template>

<script>
import { loadApp } from "@/lib/utils";
import EventBus from "@/lib/eventbus";

//import gql from "graphql-tag";
export default {
  name: "App",
  async mounted() {
    

  
    var that = this;
    document.onreadystatechange = () => {
  
      if (document.readyState == "complete" && FirebasePlugin != null) {
        FirebasePlugin.getToken(
          function (fcmToken) {
            console.log("Device Token # " + fcmToken);
            that.$store.dispatch("app/setDeviceToken", fcmToken);
          },
          function (error) {
            console.log(error);
          }
        );

        FirebasePlugin.onMessageReceived(
          async function (message) {
            console.log("Message type: " + message.messageType);
            if (message.messageType === "notification") {
              console.log("Notification message received");
              if (message.tap) {
                if (message.etype == "1") {
                  if (that.$router.currentRoute.name != "projects") {
                    console.log("1 - No Project View");
                    that.pushToDetails({ id: message.pid });
                  } else {
                    console.log("1 - Update Child Component");
                    that.updateChildComponent({ id: message.pid });
                  }
                } else if (message.etype == "2") {
                  console.log("app");

                  await that.$store.dispatch("project/findAll", {
                    force: true,
                  });
                  if (that.$router.currentRoute.name != "projects") {
                    that.$router.push({
                      name: "projects",
                      params: { id: message.pid, type: "push" },
                    });
                  } else {
                    that.updateChildComponent({ id: message.pid });
                  }
                }
                console.log("Tapped in " + message.tap);
              }
            }
            console.dir(message);
          },
          function (error) {
            console.log(error);
          }
        );
      }
    };

    await loadApp();
  },
  methods: {
    openAlert(msg, notifyObj) {
      this.alertMsg = msg;
      this.dialog = true;
      this.notifyObj = notifyObj;
    },
    ignoreAlert() {
      this.dialog = false;
      this.alertMsg = "";
      this.notifyObj = null;
    },
    viewDetail() {
      this.dialog = false;
      if (this.notifyObj != null) {
        if (this.$router.currentRoute.name != "projects") {
          this.$router.push({
            name: "projects",
            params: { id: this.notifyObj.pid, type: "push" },
          });
        } else {
          EventBus.$emit("notify/Projects", { pid: this.notifyObj.pid });
        }
      }
    },
    updateChildComponent(input) {
      setTimeout(() => {
        EventBus.$emit("notify/Projects", { pid: input.id });
      }, 1500);
    },
    pushToDetails(input) {
      var that = this;
      setTimeout(() => {
        that.$router.push({
          name: "project-details",
          params: { id: input.id, type: "push" },
        });
      }, 2000);
    },
  },

  data: () => ({
    dialog: false,
    alertMsg: "",
    notifyObj: null,
  }),
};
</script>
