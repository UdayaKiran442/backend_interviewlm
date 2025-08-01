import { Hono } from "hono";
import companyRoute from "./company.route";
import jobRoute from "./job.route";
import candidateRoute from "./candidate.route";
import serviceRoute from "./service.route";
import applicationsRoute from "./applicatons.route";
import screeningRoute from "./screening.route";
import roundRouter from "./round.router";
import hrRoute from "./hr.route";

const v1Router = new Hono();

v1Router.route('/company', companyRoute)
v1Router.route('/job', jobRoute)
v1Router.route('/candidate', candidateRoute)
v1Router.route('/service', serviceRoute)
v1Router.route('/applications', applicationsRoute)
v1Router.route('/screening', screeningRoute)
v1Router.route('/round', roundRouter)
v1Router.route('/hr', hrRoute)

export default v1Router;