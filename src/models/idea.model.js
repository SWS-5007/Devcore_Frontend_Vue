import BaseModel from "./base.model";
import UserModel from "./user.model";
import ResourceModel from "./resource.model";

export default class IdeaModel extends BaseModel {
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

    get stageId() {
        return this.parentStructure.stageId;
    }

    set stageId(value) {
        this.parentStructure.stageId = value;
    }

    get operationId() {
        return this.parentStructure.operationId;
    }
    set operationId(value) {
        this.parentStructure.operationId = value;
    }

    get phaseId() {
        return this.parentStructure.phaseId;
    }

    set phaseId(value) {
        this.parentStructure.phaseId = value;
    }

    get parentStructure() {
        if (!this._parentStructure) {
            this._parentStructure = {};
            this._parentStructure.processId = this.processId;
            if (this.parent) {
                if (this.parent.__typename === 'ProcessPhase') {
                    this._parentStructure.stageId = this.parent.operation.stageId;
                    this._parentStructure.operationId = this.parent.operation.id;
                    this._parentStructure.phaseId = this.parent.id;
                } else if (this.parent.__typename === 'ProcessOperation') {
                    this._parentStructure.stageId = this.parent.stageId;
                    this._parentStructure.operationId = this.parent.id;
                } else {
                    this._parentStructure.stageId = this.parent.id;
                }
            }
        }
        return this._parentStructure;
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