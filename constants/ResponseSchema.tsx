import { Type } from "@google/genai";

export const AgentConfigResponseSchema = {
    type: Type.OBJECT,
    properties: {
        status: {
            type: Type.STRING,
            enum: ["needs_clarification", "ready"],
        },
        clarificationQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    type: {
                        type: Type.STRING,
                        enum: [
                            "single_select",
                            "multi_select",
                            "text",
                            "number",
                            "date",
                            "time",
                        ],
                    },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    allowCustom: { type: Type.BOOLEAN },
                    customPlaceholder: { type: Type.STRING },
                    required: { type: Type.BOOLEAN },
                },
                required: ["id", "question", "type"],
            },
        },
        config: {
            type: Type.OBJECT,
            properties: {
                name: {
                    type: Type.STRING,
                    description: "Short and descriptive agent name",
                },
                description: {
                    type: Type.STRING,
                    description: "High-level summary of what the agent does",
                },
                instructions: {
                    type: Type.STRING,
                    description: "Comprehensive system instructions and guidelines for agent execution",
                },
                skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "2-5 short human-readable skills in Title Case (max 2-3 words each)",
                },
                tools: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        enum: [
                            "google_search",
                            "serp_search",
                            "browserbase",
                            "gmail",
                            "slack",
                            "googlecalendar",
                            "notion",
                            "whatsapp",
                            "github",
                        ],
                    },
                    description: "List of selected tools needed for execution",
                },
                schedule: {
                    type: Type.STRING,
                    description: "Execution schedule (e.g. manual, daily, weekly, cron). Defaults to manual/on-demand if not specified",
                },
                outputDestination: {
                    type: Type.STRING,
                    description: "Destination where the output will be sent. Defaults to in_app if not specified",
                },
            },
            required: ["name", "description", "instructions", "skills", "tools"],
        },
    },
    required: ["status"],
};

export interface ClarificationQuestion {
    id: string;
    question: string;
    type: "single_select" | "multi_select" | "text" | "number" | "date" | "time";
    options?: string[];
    allowCustom?: boolean;
    customPlaceholder?: string;
    required?: boolean;
}

export interface AgentConfig {
    name: string;
    description: string;
    instructions: string;
    skills: string[];
    tools: string[];
    schedule?: string;
    outputDestination?: string;
}

export interface AgentConfigResponse {
    status: "needs_clarification" | "ready";
    clarificationQuestions?: ClarificationQuestion[];
    config?: AgentConfig;
}
