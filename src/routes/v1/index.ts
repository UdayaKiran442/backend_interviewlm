import { Hono } from "hono";
import companyRoute from "./company.route";
import jobRoute from "./job.route";
import candidateRoute from "./candidate.route";
import serviceRoute from "./service.route";
import applicationsRoute from "./applicatons.route";

const v1Router = new Hono();

v1Router.route('/company', companyRoute)
v1Router.route('/job', jobRoute)
v1Router.route('/candidate', candidateRoute)
v1Router.route('/service', serviceRoute)
v1Router.route('/applications', applicationsRoute)

export default v1Router;