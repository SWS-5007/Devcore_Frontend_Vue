import BaseModel from "./base.model";

export default class ReplyModel extends BaseModel {
  deserialize(input) {
      Object.assign(this, input);
      return this;
  }
}
