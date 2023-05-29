import BaseModel from "./base.model";

export default class ResourceModel extends BaseModel {
  
    get downloadUrl() {
        return this.url;
    }
}