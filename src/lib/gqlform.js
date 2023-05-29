import {
    showMessageFromResponse
} from "./utils";
import {
    ServerResponse
} from "../models";


export default class GQLForm {
    static apolloClients;

    _fields = {};
    _busy = false;
    _errors = {
        details: null
    };
    _varInputName = 'input';
    _hasChanges = false;
    _showMessage = true;
    _context = {};

    constructor(fields = {}, varInputName = 'input') {
        this._fields = fields;

        Object.keys(fields).map(f => {
            if (f in this === false) {
                Object.defineProperty(this, f, {
                    get: () => {
                        return this._fields[f];
                    },
                    set: (value) => {
                        this._fields[f] = value;
                    }
                })
            }
        });
        this._busy = false;
        this._varInputName = varInputName;

    }

    client(name = 'defaultClient') {
        return GQLForm.apolloClients[name];
    }

    set fields(fields) {
        this._fields = fields;
        return this;
    }

    get fields() {
        return this._fields;
    }

    get busy() {
        return this._busy;
    }

    set busy(busy = false) {
        this._busy = busy;
        return this;
    }

    set errors(errors = {}) {
        this._errors = errors;
        return errors;
    }

    get errors() {
        return this._errors;
    }

    set showMessage(value) {
        this._showMessage = value;
    }

    get showMessage() {
        return this._showMessage;
    }

    get context() {
        return this._context;
    }

    set context(value) {
        this._context = value;
    }

    async mutate(obj, config = {}) {
        config = config || {};
        if (undefined === config.inputVar) {
            config.inputVar = this._varInputName;
        }
        try {
            this._errors = null;
            this.busy = true;
            obj.variables = obj.variables || {};
            if (config.inputVar) {
                Object.assign(obj.variables, {
                    [config.inputVar]: this.fields
                });
            } else {
                Object.assign(obj.variables, this.fields);
            }
            const response = await this.client(config.clientName).mutate(obj);
            if (response.data) {
                const ret = new ServerResponse(response);
                if (config.onSuccess) {
                    return config.onSuccess(response);
                } else {
                    if (config.onSuccess === undefined && this.showMessage) {
                        ret.message = ret.message || 'Data saved succesfully!';
                        showMessageFromResponse(ret);
                    }
                }
            } else {
                throw response;
            }
            return response;
        } catch (ex) {
            const response = new ServerResponse(ex);
            if (config.onError) {
                config.onError(response);
            } else {
                if (response.statusCode === 401) {
                    window.location.reload();
                }
                if (config.onError === undefined && this.showMessage) {
                    showMessageFromResponse(response)
                }
            }
            this._errors = { ...response
            };
            throw response;
        } finally {
            this.busy = false;
        }

    }


    get hasErrors() {
        return this._errors && this._errors.details && this._errors.details.validation;
    }

    hasError(key) {
        const has = this.hasErrors && this._errors.details && this._errors.details.validation[key] && this._errors.details.validation[key].length > 0;
        return has;
    }

    getError(key) {
        if (this.hasErrors && this._errors.details && this._errors.details.validation[key]) {
            const message = Array.isArray(this._errors.details.validation[key]) ? this._errors.details.validation[key][0] : this._errors.details.validation[key];
            if (message) {

                const ret = {
                    message: message,

                };
                return ret;
            }
        }
        return null;
    }

    clearError(key) {
        if (this.hasErrors && this._errors.statusCode === 400 && this._errors.details[key]) {
            delete this._errors.details[key];
        }
    }

    get changes() {
        return this._hasChanges;
    }

    set changes(value) {
        this._hasChanges = value;

    }

    unsetChanges() {
        this._hasChanges = false;
    }

}