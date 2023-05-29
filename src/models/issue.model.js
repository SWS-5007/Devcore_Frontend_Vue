import BaseModel from "./base.model";
import UserModel from "./user.model";
import ResourceModel from "./resource.model";

export default class IssueModel extends BaseModel {
    files = [];

    get hasFile() {
        return this.files && this.files.length > 0;
    }

    get file() {
        return this.files[0];
    }

    set file(value) {
        if (value) {
            this.files[0] = value;
        } else {
            delete this.files[0];
        }
    }

    deserialize(input) {

        if (input.author) {
            input.author = new UserModel().deserialize(input.author);
        }

        if (input.files) {
            input.files = input.files.map(f => {
                return new ResourceModel().deserialize(f);
            })
        }

        Object.assign(this, input);
        return this;
    }

}