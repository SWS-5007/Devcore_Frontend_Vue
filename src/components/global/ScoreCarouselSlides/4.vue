<template>
  <div class="score-card-score-philanthropist">
    <span style="margin-right: 20px">{{ getPhilantropistData }}</span>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters({
      user: "auth/user",
      projectsAll: "project/all",
    }),
    getPhilantropistData() {
      const getUserIdeaCountFromProject = (project) => {
        let _userIds = [];
        if (
          project.userIdeas &&
          project.userIdeas.length > 0 &&
          project.usersCount > 0
        ) {
          let authoredProjectIdeas = project.userIdeas.filter(
            (x) => x.idea.author && x.idea.author.id === this.user.id
          );
          if (authoredProjectIdeas.length > 0) {
            project.users.forEach((user) => _userIds.push(user.id));
          }
        }
        return _userIds;
      };

      let userIds = [];
      this.projectsAll.forEach((project) => {
        userIds.push(getUserIdeaCountFromProject(project));
      });
      return [...new Set(userIds.flat())].length;
    },
  },
};
</script>
<style scoped>
.score-card-score-philanthropist {
  display: flex;
  color: #000;
  font-size: 40px;
  font-weight: 700;
  height: 100%;
  width: 200px;
  align-items: center;
  justify-content: center;
}
</style>