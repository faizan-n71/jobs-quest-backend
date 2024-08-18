import { string, z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(4, "Must Be Minimum 4 Characters"),
  email: z.string().email("Invalid Email Input"),
  password: z.string().min(8, "Minimum 8 Characters Password Is Required"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid Email Input"),
  password: z.string().min(8, "Minimum 8 Characters Password Is Required"),
});

export const UpdateUserSchema = z.object({
  username: z.optional(z.string().min(4, "Must Be Minimum 4 Characters")),
  bio: z.optional(
    z.string().min(20, "Minimum 20 Characters Required").max(500)
  ),
  description: z.optional(
    z.string().min(40, "Minimum 40 Characters Required").max(1500)
  ),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(4, "Must Be Minimum 4 Characters"),
  averagePayRange: z.union([z.number(), z.array(z.number())]),
  totalEmployees: z.number(),
  description: z.string().min(40, "Must Be Minimum 40 Characters"),
  location: z.string().min(1, "Must Be Specified"),
});

export const UpdateOrganizationSchema = z.object({
  name: z.optional(z.string().min(4, "Must Be Minimum 4 Characters")),
  averagePayRange: z.optional(z.union([z.number(), z.array(z.number())])),
  totalEmployees: z.optional(z.number()),
  description: z.optional(z.string().min(40, "Must Be Minimum 40 Characters")),
  location: z.optional(z.string().min(1, "Must Be Specified")),
});

export const CreateJobSchema = z.object({
  title: z.string().min(4, "Must Be Minimum Four Characters"),
  smallDescription: z
    .string()
    .min(50, "Must Be Minimum 50 Characters")
    .max(500, "Maximum 500 Characters Are Allowed"),
  description: z
    .string()
    .min(50, "Must Be Minimum 50 Characters")
    .max(15000, "Maximum 150000 Characters Are Allowed"),
  averagePayRange: z.union([z.number(), z.array(z.number())]),
  averageTime: z.array(
    z.string().refine((dateString: string) => {
      return !isNaN(new Date(dateString).getTime());
    })
  ),
  location: z.string(),
});

export const UpdateJobSchema = z.object({
  title: z.optional(z.string().min(4, "Must Be Minimum Four Characters")),
  smallDescription: z.optional(
    z
      .string()
      .min(50, "Must Be Minimum 50 Characters")
      .max(500, "Maximum 500 Characters Are Allowed")
  ),
  description: z.optional(
    z
      .string()
      .min(50, "Must Be Minimum 50 Characters")
      .max(15000, "Maximum 150000 Characters Are Allowed")
  ),
  averagePayRange: z.optional(z.union([z.number(), z.array(z.number())])),
  averageTime: z.optional(z.array(z.date())),
  location: z.optional(z.string()),
});

export const ApplyForJobSchema = z.object({
  proposal: z.string().min(500, "Should Be At Least 100 Characters").max(15000, "Maximum 15000 Characters Are Allowed"),
})
