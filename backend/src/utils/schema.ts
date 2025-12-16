import z from "zod";

export const signupSchema = z.object({
  name: z.string("Name is required"),
  email: z
    .string("Email is required")
    .email({ message: "Invalid email format" }),
  password: z
    .string("Password is required")
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(50, { message: "Maximum password length is 50" }),
});

export const signinSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
  password: z
    .string("Password is reuired")
    .min(6, "Password must be atleast 6 characters long")
    .max(50, "Maximum password length is 50"),
});
