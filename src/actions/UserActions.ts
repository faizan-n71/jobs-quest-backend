import { RegisterSchema } from "@lib/schemas";
import { z } from "zod";
import { prisma } from "@lib/prisma";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@lib/constants";
import type { User } from "@prisma/client";
import { ActionResponse, SimpleActionResponse } from "global";

export const createUser = async (
  data: z.infer<typeof RegisterSchema>
): Promise<ActionResponse<User>> => {
  try {
    const user = await prisma.user.create({
      data,
    });

    if (!user) {
      return { message: ERROR_MESSAGES.USER.Creation, successful: true };
    }
    return {
      message: SUCCESS_MESSAGES.USER.Registered,
      successful: true,
      data: user,
    };
  } catch (err) {
    console.log(`ERROR: ACTION: CREATE_USER: ${err}`);
    return { message: ERROR_MESSAGES.Default, successful: false };
  }
};

export const getUserById = async ({
  userId,
  unprotected,
}: {
  userId: string;
  unprotected?: boolean;
}): Promise<SimpleActionResponse<User>> => {
  try {
    const found = await prisma.user.findUnique({ where: { id: userId } });
    if (!found) {
      return null;
    }
    if (!unprotected) {
      found.password = "";
    }

    return found;
  } catch (err) {
    console.log(`ERROR: ACTION: GET_USER_ID: ${err}`);
    return null;
  }
};

export const getUserByEmail = async ({
  email,
  unprotected,
}: {
  email: string;
  unprotected?: boolean;
}): Promise<SimpleActionResponse<User>> => {
  try {
    const found = await prisma.user.findUnique({ where: { email } });
    if (!found) {
      return null;
    }
    if (!unprotected) {
      found.password = "";
    }

    return found;
  } catch (err) {
    console.log(`ERROR: ACTION: GET_USER_EMAIL: ${err}`);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    return prisma.user.findMany();
  } catch (err) {
    return null;
  }
};
