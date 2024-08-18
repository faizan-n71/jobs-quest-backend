import "module-alias/register";

import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import authRouter from "@routers/AuthRouter";
import userRouter from "@routers/UserRouter";
import organizationRouter from "@routers/OrganizationRouter";
import jobsRouter from "@routers/JobsRouter";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(
  (
    err: SyntaxError | Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      err instanceof SyntaxError &&
      "status" in err &&
      err.status === 400 &&
      "body" in err
    ) {
      return res.status(400).send({ status: 400, message: err.message });
    }
    next();
  }
);
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/organizations", organizationRouter);
app.use("/jobs", jobsRouter);

app.get("/", (req, res) => {
  res.send("Server Is Healthy And Running");
});

app.listen(PORT, () => {
  console.log(`Server Running On http://localhost:${PORT}`);
});
