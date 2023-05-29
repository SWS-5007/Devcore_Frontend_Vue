import BaseModel from "./base.model";
import IdeaModel from "./idea.model";
import IssueModel from "./issue.model";
import IdeaIssueModel from "./ideaissue.model";

export default class ContributionsModel extends BaseModel {
  ideas = [];
  issues = [];
  problems = [];
  improvements = [];

  deserialize(input) {

    if (input.ideas) {
      input.ideas = input.ideas.map(r => {
        return new IdeaModel().deserialize(r);
      });
    }

    if (input.issues) {
      input.issues = input.issues.map(r => {
        return new IssueModel().deserialize(r);
      });
    }

    if (input.problems) {
      input.problems = input.problems.map(o =>
        new IdeaIssueModel().deserialize(o)
      );
    }

    if (input.improvements) {
      input.improvements = input.improvements.map(o =>
        new IdeaIssueModel().deserialize(o)
      );
    }
    return super.deserialize(input);
  }
}
