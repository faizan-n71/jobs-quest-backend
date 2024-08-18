import { updateUserAccount } from "@controllers/UserController";
import { Router } from "express";

const userRouter = Router();

userRouter.patch("/update/:id", updateUserAccount);


export default userRouter;
