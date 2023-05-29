import BaseModel from "./base.model";
import IdeaModel from "./idea.model";

export default class ProjectIdeaModel extends BaseModel {
  deserialize(input) {
    if (input.idea) {
      input.idea = new IdeaModel().deserialize(input.idea);
    }

    Object.assign(this, input);
    return this;
  }
}
