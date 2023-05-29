export default class BaseModel {

    serialize() {
        return this;
    }

    deserialize(input) {
        return Object.assign(this, input);
    }


    can(args) {
        if (this._permissions) {
            return this._permissions.indexOf(args) > -1;
        }
    }
}