import { getUserById } from "@actions/UserActions";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@lib/constants";
import { UpdateUserSchema } from "@lib/schemas";
import { formatZodError, getCurrentUser } from "@lib/utils";
import type { Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const updateUserAccount = async (req: Request, res: Response) => {
  const { username, bio, description } = req.body;
  const { id: userId } = req.params as { id: string };

  const updateData = { username, bio, description };

  const validated = UpdateUserSchema.safeParse(updateData);

  if (!validated.success) {
    return res.status(400).json({
      message:
        formatZodError(validated) || ERROR_MESSAGES.USER.UpdateInvalidData,
    });
  }

  try {
    const {user} = await getCurrentUser(req);

    if (!user) {
      return res.status(400).json({ message: ERROR_MESSAGES.USER.NotExists });
    }

    if (user.id !== userId) {
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: { ...updateData },
    });

    return res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.USER.UpdatedAccount, user: updatedUser });
  } catch (err) {
    console.log("ERROR: ACTION: UPDATE_USER", err);
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};
