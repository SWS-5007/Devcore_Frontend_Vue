import router from "../router";

export default async ({ store, next, to }) => {
  let session = null;
  // always save the intented route
  await store.dispatch("app/setIntentedRoute", to);

  if (!store.getters["auth/checked"]) {
    return;
  }

  try {
    session = await store.dispatch("auth/getSession");
  } catch (ex) {
    console.log(ex);
  }
  if (!session) {
    return next({
      name: "login"
    });
   
  } else if (!session.user) {
    await router.replace(
      {
        name: "projects",
        query: {
          i: new Date().getTime()
        }
      },
      () => {},
      () => {}
    );
    return;
  } else {
    if (!session.user.mustChangePassword && to.name === "change-password") {
      await router.replace(
        {
          name: "projects"
        },
        () => {},
        () => {}
      );
      return;
    } 
    else if (to.meta.permissions) {
      const permissions = to.meta.permissions;
      if (session.user.can(permissions)) {
        return next();
      } else {
        await router.replace(
          {
            name: "projects",
            query: {
              i: new Date().getTime()
            }
          },
          () => {},
          () => {}
        );
        return;
      }
    }
  }
  return next();
};
