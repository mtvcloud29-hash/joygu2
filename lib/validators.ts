import { z } from "zod";

export const signupSchema = z.object({ name: z.string().min(2, "Please enter your name"), email: z.string().email("Enter a valid email"), password: z.string().min(8, "Use at least 8 characters") });
export const loginSchema = z.object({ email: z.string().email("Enter a valid email"), password: z.string().min(1, "Enter your password") });
export const orderSchema = z.object({ email: z.string().email(), name: z.string().min(2), phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"), address: z.string().min(10), city: z.string().min(2), state: z.string().min(2), pincode: z.string().regex(/^\d{6}$/, "Enter a valid PIN code"), paymentMethod: z.enum(["COD", "RAZORPAY"]), items: z.array(z.object({ productId: z.string(), slug: z.string(), quantity: z.number().int().positive() })).min(1), couponCode: z.string().trim().max(30).optional() });
export const contactSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), subject: z.string().min(3), message: z.string().min(20).max(5000) });
