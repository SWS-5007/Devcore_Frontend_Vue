import BaseModel from "./base.model";
import Reply from "./reply.model";

export default class ReplyPaginatedModel extends BaseModel {
  
  
  pageInfo = null;

  get pageInfo() {
    return this.pageInfo;
  }

  deserialize(input) {
    if (input.pageInfo) {
      this.pageInfo = input.pageInfo;
    }

    if (input.edges) {
      input.edges = input.edges.map(edge => {
        if(!edge.node)return;
        return new Reply().deserialize(edge.node);
      });
    }
    Object.assign(this, input);
    return this;
  }
}
