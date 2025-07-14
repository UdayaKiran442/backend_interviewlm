import { Hono } from "hono";
import companyRoute from "./company.route";
import jobRoute from "./job.route";

const v1Router = new Hono();

v1Router.route('/company', companyRoute)
v1Router.route('/job', jobRoute)


export default v1Router;