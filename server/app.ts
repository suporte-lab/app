import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { authRoute } from "./routes/auth";
import { municipalitiesRoute } from "./routes/municipalities";
import { categoriesRoute } from "./routes/categories";
import { projectsRoute } from "./routes/projects";
import { surveysRoute } from "./routes/surveys";
import { researchsRoute } from "./routes/research";

export type AppEnv = {
  Variables: {
    user: { id: string; nickname: string };
  };
};

const app = new Hono<AppEnv>();

app.use("*", logger());

const apiRoutes = app
  .basePath("/api")
  .route("/auth", authRoute)
  .route("/municipalities", municipalitiesRoute)
  .route("/projects", projectsRoute)
  .route("/categories", categoriesRoute)
  .route("/surveys", surveysRoute)
  .route("/researchs", researchsRoute);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist" }));

export default app;
export type ApiRoutes = typeof apiRoutes;
