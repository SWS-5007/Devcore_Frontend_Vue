import BaseModel from "./base.model";
import UserModel from "./user.model";
import CompanyModel from "./company.model";
import PermissionModel from "./permission.model";

export default class RoleModel extends BaseModel {
    name = null;
    usersCount = 0;

    //table details reactive property
    _showDetails = false;

    deserialize(input) {
        if (input.users) {
            input.users = input.users.map(u => {
                return new UserModel().deserialize(u);
            });
        }
        if (input.company) {
            input.company = new CompanyModel().deserialize(input.company);
        }
        if (input.permissions) {
            input.permissions = input.permissions.map(p => {
                return new PermissionModel().deserialize(p);
            })
        }
        Object.assign(this, input);
        return this;
    }
}