import {
  createUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
} from "@actions/UserActions";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@lib/constants";
import { LoginSchema, RegisterSchema, UpdateUserSchema } from "@lib/schemas";
import { formatZodError, getCurrentUser } from "@lib/utils";
import type { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = await req.body;

  if (!username) {
    return res.status(400).json({ message: "Username Is Required" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email Is Required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password Is Required" });
  }

  try {
    const userData = { username, email, password };

    const validated = RegisterSchema.safeParse(userData);

    if (!validated.success) {
      return res.status(400).json({
        message: formatZodError(validated) || ERROR_MESSAGES.InvalidInput,
      });
    }

    const exisitng = await getAllUsers();

    exisitng &&
      exisitng.forEach((user) => {
        if (userData.username === user.username) {
          return res
            .status(400)
            .json({ message: ERROR_MESSAGES.USER.UsernameExists });
        }
        if (userData.email === user.email) {
          return res
            .status(400)
            .json({ message: ERROR_MESSAGES.USER.EmailExists });
        }
      });

    const response = await createUser(userData);

    return res
      .status(response.successful ? 201 : 500)
      .json({ message: response.message, user: response.data });
  } catch (err) {
    console.log(`ERROR: CONTROLLER_REGISTER: ${err}`);

    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const login = async (req: Request, res: Response) => {
  const { user: existingUser } = await getCurrentUser(req);

  if (existingUser) {
    return res.status(200).json({
      message: SUCCESS_MESSAGES.USER.AlreadyLoggedIn,
      user: existingUser,
    });
  }

  const { email, password } = await req.body;

  const userData = { email, password };

  if (!email) {
    return res.status(400).json({ message: "Email Is Required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password Is Required" });
  }
  try {
    const validated = LoginSchema.safeParse(userData);

    if (!validated.success) {
      return res.status(400).json({
        message:
          validated.error?.errors[0]?.message || ERROR_MESSAGES.InvalidInput,
      });
    }

    const existingUser = await getUserByEmail({ email, unprotected: true });

    if (!existingUser) {
      return res.status(404).json({
        message: ERROR_MESSAGES.USER.NotExists,
      });
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
      },
      process.env.JWT_SECRET!
    );

    return res
      .status(200)
      .cookie("auth-token", token, {
        expires: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      })
      .json({ message: SUCCESS_MESSAGES.USER.LoggedIn });
  } catch (err) {
    console.log(`ERROR: CONTROLLER_LOGIN: ${err}`);

    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const logout = (req: Request, res: Response) => {
  return res
    .status(200)
    .clearCookie("auth-token")
    .json({ message: SUCCESS_MESSAGES.USER.LoggedOut });
};

export const getUser = async (req: Request, res: Response) => {
  const { user, status, message } = await getCurrentUser(req);
  return res.status(status).json({ user, message });
};

export const checkAuthState = async (req: Request, res: Response) => {
  const { status, message, user } = await getCurrentUser(req);
  return res.status(status).json({
    isLoggedIn: !!user,
    message,
  });
};
