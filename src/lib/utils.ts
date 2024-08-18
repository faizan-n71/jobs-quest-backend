import { Request } from "express";
import { SafeParseError } from "zod";
import jwt, { JwtPayload } from "jsonwebtoken";
import { GetUserResponse } from "global";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";
import { getUserById } from "@actions/UserActions";

export const formatZodError = (validated: SafeParseError<any>) => {
  const errors = validated.error.errors;
  if (errors && errors.length > 0) {
    return `${capitalizeFieldNames(errors[0].path.toString())} ${
      errors[0].message
    }`;
  }
  return null;
};

const capitalizeFieldNames = (str: string) => {
  const regex = /(?=[A-Z])/;
  const splitted = str.split(regex);
  const capitalized = splitted.map(
    (singleStr) => singleStr.charAt(0).toUpperCase() + singleStr.substring(1)
  );
  return capitalized.join(" ");
};

export const getCurrentUser = async (
  req: Request
): Promise<GetUserResponse> => {
  const token = req.cookies?.["auth-token"];
  if (!token) {
    return { message: ERROR_MESSAGES.USER.NoToken, user: null, status: 400 };
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    return {
      message: ERROR_MESSAGES.USER.IncorrectToken,
      user: null,
      status: 400,
    };
  }
  const { id } = decoded;
  const user = await getUserById({ userId: id });

  if (!user) {
    return {
      message: ERROR_MESSAGES.USER.NotExists,
      user: null,
      status: 404,
    };
  }

  return {
    message: SUCCESS_MESSAGES.USER.Retrieval,
    user: user,
    status: 200,
  };
};
