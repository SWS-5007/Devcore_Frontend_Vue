import BaseModel from "./base.model";
import CompanyModel from "./company.model";
import CompanyRoleModel from "./companyrole.model";
import RoleModel from "./role.model";
import PermissionModel from "./permission.model";
import { imageResolver } from "../lib/utils";

export default class UserModel extends BaseModel {
  avatar = null;
  avatarUrl = null;

  getAvatarUrl(size = "0x0") {
    if (this.avatarUrl) {
      return imageResolver(this.avatarUrl, size);
    }
    return null;
  }

  get initials() {
   
    const firstName = this.firstName ? this.firstName[0] : "";
    const lastName =  this.lastName ?  this.lastName[0] : "";
    return (firstName + lastName).toUpperCase();
  }

  get fullName() {
    return this.firstName + (this.lastName ? " " + this.lastName : "");
  }

  get role() {
    return this.roles ? this.roles[0] : null;
  }

  can(permissions = null, entity = null) {
    if (!permissions) {
      return true;
    }

    if (entity && entity._metadata && entity._metadata.permissions) {
      return entity._metadata.permissions.find(p => p === permissions) !== null;
    }

    //return true;
    this.permissions = this.permissions || [];
    const permission = this.permissions.find(p => p.name === permissions);
    return undefined !== permission && null !== permission;
  }

  deserialize(input) {
    if (input.company) {
      input.company = new CompanyModel().deserialize(input.company);
    }
    if (input.companyRole) {
      input.companyRole = new CompanyRoleModel().deserialize(input.companyRole);
    }
    if (input.roles) {
      input.roles = input.roles.map(r => {
        return new RoleModel().deserialize(r);
      });
    }
    if (input.permissions) {
      input.permissions = input.permissions.map(p => {
        return new PermissionModel().deserialize(p);
      });
    }
    return super.deserialize(input);
  }
}
