import store from "../store";
import router from "../router";
import ServerResponse from "../models/response.model";
import EventBus from "@/lib/eventbus";
import GQLForm from "@/lib/gqlform";
let loadingCount = 0;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

export function addClass(el, className) {
    el.classList.add(className);
}

export function removeClass(el, className) {
    el.classList.remove(className);
}

export function toggleClass(el, className) {
    if (el.classList.contains(className)) {
        removeClass(el, className);
    } else {
        addClass(el, className);
    }
}

export function scrollLeftToElement(el) {
    document.getElementById("main").scrollLeft = el.offsetLeft;
}

export function scrollTopToElement(el) {
    document.getElementById("main").scrollLeft = el.offsetTop;
}

export function blockUi() {
    loadingCount++;
    checkIfNeedBlock();
}

export function unblockUi() {
    loadingCount--;
    checkIfNeedBlock();
}

export function checkIfNeedBlock() {
    if (loadingCount < 0) {
        loadingCount = 0;
    }

    if (loadingCount > 0) {
        removeClass(document.body, "loaded");
    } else {
        addClass(document.body, "loaded");
    }
}

export function imageResolver(imageUrl, size) {
    if (!imageUrl) {
        return "";
    }
    return imageUrl
    .replace("/0x0/", "/" + size + "/")
    .replace("//", "/")
    .replace(":/", "://");
}

export function showGraphqlErrorFromResponse(networkError) {
    const ex = new ServerResponse();
    ex.message = networkError.message;
    ex.code = networkError.statusCode;
    console.log(ex);
    showMessageFromResponse(ex);
}

export function showMessageFromResponse(response) {
    const message = response.message;
    const status = response.statusCode;

    if (status > 300) {
        window.vm.$snotify.error(window.vm.$t(message));
    } else {
        window.vm.$snotify.success(window.vm.$t(message));
    }
}

export function processGraphQLErrors(graphQLErrors) {
    if (graphQLErrors) {
        const raw = graphQLErrors[0];
        if (raw) {
            const error = new ServerResponse();
            error.original = raw;
            error.validation = raw.message.error;
            error.message = raw.message.message;
            error.code = raw.message.statusCode;
            return error;
        }
    }
    return null;
}

export function queryToPromise(
    query,
    options = {
        onLoading: null,
        onChangeStatus: null,
        unsubscribe: true
    }
    ) {
    return new Promise((resolve, reject) => {
        try {
            const subscription = query.subscribe(o => {
                if (options.onChangeStatus) {
                    options.onChangeStatus(o);
                }
                if (o.loading && options.onLoading) {
                    options.onLoading({
                        result: o,
                        subscription: subscription
                    });
                } else if (!o.loading) {
                    resolve({
                        result: o,
                        subscription: subscription
                    });
                    if (options.unsubscribe) {
                        subscription.unsubscribe();
                    }
                }
            });
        } catch (ex) {
            console.log(ex);
            reject(ex);
        }
    });
}

export function setLang(lang) {
    window.vm.$i18n.locale = lang || window.vm.$i18n.locale;
}

export async function loadApp() {

    if (window.location.hash.includes('share') !== false){
        let sharedHash = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)

        const form = new GQLForm({
            urlHash: sharedHash
        });
        const shareLink = await store.dispatch("shareLink/getShareLinkByHash", form);
        if( typeof shareLink.id !== "undefined" ){
            store.dispatch("app/shared", shareLink)
        } else {
            store.dispatch("app/shared", "")
        }        
    }

    EventBus.$on("auth/LOGIN", async () => {
        try {
            setLang(store.getters["auth/user"].lang);

            await store.dispatch("app/load");

            store.dispatch("app/asyncLoad");

//eslint-disable-next-line
        } catch (e) {
            console.log(e)
        }
    });

    const requested =
    "/loading" !== window.location.hash
    ? window.location.hash + window.location.search
    : "/projects";
    blockUi();
//router.replace('/loading', () => { }, () => { });
// init the session store
    try {
        await store.dispatch("app/init");

//set lang
//window.vm.$i18n.locale = store.getters['app/defaultLang'] || window.vm.$i18n.locale;

        try {
            const result = await store.dispatch("auth/getSession");
        } catch (e) {
            console.log(e);
        }




        try {
            if (store.getters["auth/user"]) {
// if (store.getters["process/current"]) {
//     await store.dispatch("process/findById", {
//         id: store.getters["process/current"].process.id
//     })
// }
            } else {
                router
                .replace({
                    name: "home"
                })
                .catch(() => {});
            }
//eslint-disable-next-line
        } catch (ex) {
            router
            .replace({
                name: "login"
            })
            .catch(() => {});
        }
    } catch (ex) {
        console.log(ex);
        router
        .replace({
            name: "login"
        })
        .catch(() => {});
    } finally {
        if (store.getters["auth/user"]) {
            router
            .replace({
                path: requested
            })
            .catch(() => {});
//window.location.href = requested;
        } else {
            router
            .replace({
                name: "home"
            })
            .catch(() => {});
        }
// make the router ready
        console.log("App loaded!");
        store.dispatch("app/loaded");

        unblockUi();
    }
}
