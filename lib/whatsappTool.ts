import { tool } from "ai";
import { z } from "zod";
import { sendWhatsAppMessage } from "./evolution";

export const createWhatsAppTool = (instanceName: string) =>
    tool({
    description: "Send a WhatsApp message to a specific phone number.",
    inputSchema: z.object({
        recipientNumber: z
        .string()
        .describe("The recipient phone number including international country code without '+' or spaces, e.g., '14155552671'"),
        message: z.string().describe("The message content to send"),
    }),
    async execute({ recipientNumber, message }) {
        try {
        const result = await sendWhatsAppMessage({
            instanceName,
            recipientNumber,
            text: message,
        });
        return {
            status: "SUCCESS",
            messageId: result?.key?.id,
            sentTo: recipientNumber,
        };
        } catch (e: any) {
        return {
            status: "ERROR",
            error: e instanceof Error ? e.message : String(e),
        };
        }
    },
    });