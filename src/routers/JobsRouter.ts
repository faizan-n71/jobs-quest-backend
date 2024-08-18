import {
  applyForJob,
  createJob,
  deleteJob,
  getAllJobs,
  getAppliedJobs,
  getJob,
  getJobsByOrganization,
  updateJob,
} from "@controllers/JobsController";
import { Router } from "express";

const jobsRouter = Router();

jobsRouter.post("/create", createJob);
jobsRouter.patch("/update/:id", updateJob);
jobsRouter.delete("/delete/:id", deleteJob);
jobsRouter.post("/apply/:id", applyForJob);
jobsRouter.get("/get/all", getAllJobs);
jobsRouter.get("/get/organization/:organizationId", getJobsByOrganization);
jobsRouter.get("/get/applied", getAppliedJobs);
jobsRouter.get("/get/:id", getJob);

export default jobsRouter;
