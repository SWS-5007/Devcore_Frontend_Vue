export default class ServerResponse {
    data = null;
    original = {};
    message = null;
    details = null;
    code = 'OK';
    statusCode = 200;
    constructor(source) {
        if (source) {
            this.parse(source);
        }
    }

    fromGraphQLErrors(graphQLErrors) {
        this.statusCode = 500;
        this.code = "Server error";
        if (graphQLErrors && graphQLErrors[0]) {
            const error = graphQLErrors[0];
            this.statusCode = error.extensions && error.extensions.status ? error.extensions.status : this.statusCode;
            this.code = error.extensions && error.extensions.statusMessage ? error.extensions.statusMessage : this.code;
            this.message = error.message || this.code;
            this.details = error.extensions || error.details;
            //Object.assign(this, graphQLErrors[0])
        }
        return this;
    }

    fromNetworkError(networkError) {
        this.original = networkError;
        if (networkError.result) {
            this.message = networkError.message + ((networkError.result) ? ' ' + networkError.result.message : '');
            this.statusCode = networkError.statusCode;
            if (networkError.result.errors) {
                this.details = networkError.result.errors.map(e => {
                    return e;
                })
            }
        } else {
            this.message = networkError.message;
            this.statusCode = 500;
        }
    }

    parse(response) {
        if (response.graphQLErrors && response.graphQLErrors[0]) {
            this.fromGraphQLErrors(response.graphQLErrors);
        } else if (response.networkError) {
            this.fromNetworkError(response.networkError);
        } else {
            Object.assign(this, response);

        }
        if (response.data) {
            this.data = response.data;
            response.original = response;
        }


        if (response.extensions && response.extensions._metadata) {
            this.message = response.extensions._metadata.message || this.message;
        }

    }
}