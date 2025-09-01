import { Hono } from "hono";
import { cors } from "hono/cors";

import { ActiveConfig } from "./utils/config.utils";
import v1Router from "./routes/v1";
import testRouter from "./routes/test/test.route";

const app = new Hono();

app.get("/", (c) => {
	return c.text(`Hello Hono ${ActiveConfig.ENV}`);
});

// cors
app.use(
	"/*",
	cors({
		origin: ["http://localhost:3001"],
	}),
);
// v1 router
app.route("/v1", v1Router);
app.route("/test", testRouter);

export default app;
