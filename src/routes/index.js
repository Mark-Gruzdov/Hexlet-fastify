import coursesRoutes from "./courses.js";
import usersRoutes from "./users.js";
import rootRoutes from "./root.js";

async function routes(app) {
  Promise.all([app.register(coursesRoutes), 
    app.register(usersRoutes),
    app.register(rootRoutes)]);
};

export default routes;