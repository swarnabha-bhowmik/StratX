import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { users, tools } from "./schema";

// ==========================================
// User Schemas
// ==========================================
export const insertUserSchema = createInsertSchema(users, {
    email: (schema) => schema.email("Please enter a valid email address"),
});
export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = createUpdateSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// ==========================================
// Tool Schemas
// ==========================================
export const insertToolSchema = createInsertSchema(tools, {
    slug: (schema) => schema.min(1, "Slug is required"),
    name: (schema) => schema.min(1, "Tool name is required"),
});
export const selectToolSchema = createSelectSchema(tools);
export const updateToolSchema = createUpdateSchema(tools);

export type InsertTool = z.infer<typeof insertToolSchema>;
export type SelectTool = z.infer<typeof selectToolSchema>;
export type UpdateTool = z.infer<typeof updateToolSchema>;

// ==========================================
// API Request Validation Schemas
// ==========================================
export const configureAgentRequestSchema = z.object({
    prompt: z.string().trim().min(1, "Prompt is required"),
    timezone: z.string().optional(),
});

export const checkoutRequestSchema = z.object({
    priceId: z.string().min(1, "Price ID is required"),
});

export const sendEmailRequestSchema = z.object({
    to: z.string().email("Invalid recipient email").or(z.array(z.string().email())),
    subject: z.string().min(1, "Subject is required"),
    html: z.string().optional(),
});
