import { Hono } from "hono";
import companyRoute from "./company.route";
import jobRoute from "./job.route";
import candidateRoute from "./candidate.route";

const v1Router = new Hono();

v1Router.route('/company', companyRoute)
v1Router.route('/job', jobRoute)
v1Router.route('/candidate', candidateRoute)


export default v1Router;