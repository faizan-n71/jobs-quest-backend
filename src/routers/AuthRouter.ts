import { checkAuthState, getUser, login, logout, register } from "@controllers/AuthController";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/get", getUser);
authRouter.get("/check", checkAuthState);

export default authRouter;
