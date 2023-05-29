import BaseModel from "./base.model";
import UserModel from "./user.model";

export default class SessionModel extends BaseModel {
    constructor(user = null, token = null, expires = null, refresh_token = null, token_type = null) {
        super();
        this.user = user;
        this.access_token = token;
        this.expires_in = expires;
        this.token_type = token_type;
        this.refresh_token = refresh_token;
    }

    deserialize(input) {
        if (input.user) {
            input.user = new UserModel().deserialize(input.user);
        }
        Object.assign(this, input);
        return this;
    }
}