import { ApolloLink, Observable } from "apollo-link";
// eslint-disable-next-line
import Echo from "laravel-echo";
import config from "./config";
import store from "../../store/index";
//Pusher.logToConsole = true;
class EchoLink extends ApolloLink {
  constructor() {
    super();
    this.subscriptions = [];
    this.wsAuthEndpoint = config.wsAuthEndpoint;
    this.wsConfig = {
      //wsHost: config.wsEndpoint,
      //wsHost: window.location.hostname,
      forceTls: process.env.NODE_ENV !== "development",
      wsHost: config.wsEndpoint,
      wsPort: config.wsPort,
      wssPort: config.wsPort,
      encrypted: false,
      key: "devcore-pusher-app-key"
    };
  }
  closeEcho() {
    if (this.echo) {
      try {
        this.echo.disconnect();
      } catch (ex) {
        console.log(ex);
      }
    }
  }

  initEcho() {
    try {
      this.echo = new Echo({
        ...this.wsConfig,
        ...{
          broadcaster: "pusher",
          cluster: "us",
          authEndpoint: this.wsAuthEndpoint,
          disableStats: true,
          enabledTransports: ["ws", "wss"],
          auth: {
            headers: {
              Authorization: store.getters["auth/access_token"]
                ? `Bearer ${store.getters["auth/access_token"]}`
                : null
            }
          }
        }
      });


      this.echo.connector.pusher.config.auth.headers[
        "Authorization"
      ] = `Bearer ${store.getters["auth/access_token"]}`;
      window.Echo = this.echo;
    } catch (ex) {
      console.error(ex);
    }
  }

  request(operation, forward) {
    return new Observable(observer => {
      // Check the result of the operation
      forward(operation).subscribe({
        next: data => {
          // If the operation has the subscription extension, it's a subscription
          const subscriptionChannel = this._getChannel(data, operation);
          if (subscriptionChannel && this.echo) {
            this._createSubscription(subscriptionChannel, observer);
          } else {
            // No subscription found in the response, pipe data through
            observer.next(data);
            observer.complete();
          }
        }
      });
    });
}


_getChannel(data, operation) {
    return !!data.extensions &&
        !!data.extensions.lighthouse_subscriptions &&
        !!data.extensions.lighthouse_subscriptions.channels ?
        data.extensions.lighthouse_subscriptions.channels[operation.operationName] :
        null;
}

_createSubscription(subscriptionChannel, observer) {
    const privateChannelName = subscriptionChannel.split('private-').pop();

    if (!this.subscriptions.find(s => s.channel === subscriptionChannel)) {
        this.subscriptions.push({
            channel: subscriptionChannel,
            observer: observer,
        });
    }

    this.echo
      .private(privateChannelName)
      .listen(".lighthouse-subscription", payload => {
        if (!payload.more || observer._subscription._state === "closed") {
          this._leaveSubscription(subscriptionChannel, observer);
          return;
        }
        const result = payload.result;
        if (result) {
            observer.next({
                data: result.data,
                extensions: result.extensions,
            });
        }
    });
}

_leaveSubscription(channel, observer) {
    const subscription = this.subscriptions.find(s => s.channel === channel);
    this.echo.leave(channel);
    observer.complete();
    this.subscriptions = this.subscriptions.slice(this.subscriptions.indexOf(subscription), 1);
}
}

export default EchoLink;
