import type { User } from "@prisma/client";

declare interface ActionResponse<T = undefined> {
  successful: boolean;
  message: string;
  data?: T;
}

declare type SimpleActionResponse<T> = Promise<T | null>;

declare interface GetUserResponse {
  user: User | null;
  message: string;
  status: number;
}
