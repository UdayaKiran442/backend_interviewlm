import { Hono } from "hono";
import companyRoute from "./company.route";
import jobRoute from "./job.route";
import candidateRoute from "./candidate.route";
import serviceRoute from "./service.route";

const v1Router = new Hono();

v1Router.route('/company', companyRoute)
v1Router.route('/job', jobRoute)
v1Router.route('/candidate', candidateRoute)
v1Router.route('/service', serviceRoute)

export default v1Router;