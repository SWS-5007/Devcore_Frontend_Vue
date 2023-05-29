import BaseModel from "./base.model";
import ProjectIdeaModel from "./projectidea.model";

export default class ProjectModel extends BaseModel {
  ideas = [];
  userIdeas = [];
  issues = [];
  users = [];
  tools = [];
  stages = [];

  getStage(stageId) {
    return this.stages.find(o => o.processStageId === stageId);
  }

  get hasPendingEvaluations() {
    return (
      this.pendingEvaluations &&
      this.pendingEvaluations.filter(o => o.status === "PENDING").length > 0
    );
  }

  get hasUserPendingEvaluations() {
    return (
      this.userPendingEvaluations && this.userPendingEvaluations.length > 0
    );
  }

  get usersCount() {
    return this.users.length;
  }

  get currentStage() {
    return this.stages.reduce(function(prev, current) {
      return prev.dOrder > current.dOrder ? prev : current;
    });
  }

  get activeIdeaCount() {
    const stagesActive = this.stages
      .filter(s => s.status == "STARTED" || s.status == "EVALUATIONS_PENDING")
      .map(ss => ss.id);

    const projIdeasCount = this.userIdeas.filter(
      i => stagesActive.indexOf(i.stageId) >= 0
    ).length;
    return projIdeasCount;
  }

  get userPendingEvaluationsCount() {
    return this.userPendingEvaluationRecords.filter(o => o.status === "PENDING")
      .length;
  }

  get userPendingEvaluationRecords() {
    let allRecords = [];
    if (this.hasUserPendingEvaluations) {
      this.userPendingEvaluations
        .filter(u => u.status === "OPEN")
        .map(i => {
          i.userRecords.map(r => {
            allRecords.push(r);
          });
        });
    }
    return allRecords;
  }

  deserialize(input) {
    if (input.ideas) {
      input.ideas = input.ideas.map(i => {
        return new ProjectIdeaModel().deserialize(i);
      });
    }


    if (input.userIdeas) {
      input.userIdeas = input.userIdeas.map(i => {
        return new ProjectIdeaModel().deserialize(i);
      });
    }

    return super.deserialize(input);
  }
}
