import coursesRoutes from "./courses.js";
import usersRoutes from "./users.js";
import rootRoutes from "./root.js";

const routes = [
  usersRoutes,
  coursesRoutes,
  rootRoutes,
];

export default async (app) => routes.forEach((route) => route(app));