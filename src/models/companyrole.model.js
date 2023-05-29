import BaseModel from "./base.model";
import UserModel from "./user.model";
import CompanyModel from "./company.model";
import { imageResolver } from "../lib/utils";

export default class CompanyRoleModel extends BaseModel {
  name = null;
  usersCount = 0;

  getAvatarUrl(size = "0x0") {
    if (this.avatarUrl) {
      return imageResolver(this.avatarUrl, size);
    }
    return null;
  }

  deserialize(input) {
    if (input.users) {
      input.users = input.users.map(u => {
        return new UserModel().deserialize(u);
      });
    }
    if (input.company) {
      input.company = new CompanyModel().deserialize(input.company);
    }
    Object.assign(this, input);

    return this;
  }
}
