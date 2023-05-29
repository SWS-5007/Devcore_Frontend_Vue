import BaseModel from "./base.model";
import UserModel from "./user.model";
export default class ExperienceModel extends BaseModel {

    deserialize(input) {
      if(input.user){
        input.user.updatedAt = new Date().getTime();
        input.user = new UserModel().deserialize(input.user);
      }
        return super.deserialize(input);
    }
}
