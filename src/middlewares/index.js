import router from '../router'
import store from '../store'

async function middlewarePipeline(context, middleware, index) {
    const nextMiddleware = middleware[index]

    if (!nextMiddleware) {
        return context.next
    }

    return async () => {
        const nextPipeline = await middlewarePipeline(
            context, middleware, index + 1
        )

        await nextMiddleware({ ...context,
            next: nextPipeline
        })

    }
}

router.beforeEach(async (to, from, next) => {
    if (!to.meta.middleware) {
        return next()
    }
    const middleware = to.meta.middleware

    const context = {

        to,
        from,
        next,
        store
    }
    let result = await middleware[0]({
        ...context,
        next: await middlewarePipeline(context, middleware, 1)
    })


    return result;
})