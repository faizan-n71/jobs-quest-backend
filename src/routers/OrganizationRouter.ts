import { createOrganization, deleteOrganization, getOrganization, updateOrganization, getAllOrganizations, getCurrentUserOrganization } from "@controllers/OrganizationController";
import { Router } from "express";

const organizationRouter = Router();

organizationRouter.post('/create', createOrganization);
organizationRouter.get('/get/all', getAllOrganizations);
organizationRouter.get('/get/my', getCurrentUserOrganization);
organizationRouter.get('/get/:id', getOrganization);
organizationRouter.patch('/update/:id', updateOrganization);
organizationRouter.delete('/delete/:id', deleteOrganization);

export default organizationRouter;
