export default async ({
    store,
    next
}) => {
    let session = null;

    if (!store.getters['auth/checked']) {
        return next();
    }

    try {
        session = await store.dispatch('auth/getSession');
    } catch (ex) {
        console.log(ex);
    }
    if (session) {
        return next({
            name: 'projects'
        })
    }

    return next();
}