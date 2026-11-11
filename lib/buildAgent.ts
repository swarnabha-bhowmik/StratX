import { CreatedAgent } from "@/components/custom/Agents/CreateAgent"
import { getOrCreateAgentSession } from "./agentSession"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import { generateText, stepCountIs } from "ai"
import { browserbaseTool } from "./browserbaseTool"
import { createWhatsAppTool } from "./whatsappTool"
import { getWhatsAppInstanceName } from "./evolution"

const getModelChain = () => {
    const chain: { name: string; model: any }[] = []

    if (process.env.GEMINI_API_KEY) {
        const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
        chain.push({ name: "Gemini 3.5 Flash", model: google("gemini-3.5-flash") })
        chain.push({ name: "Gemini 3.5 Flash-Lite", model: google("gemini-3.5-flash-lite") })
        chain.push({ name: "Gemini 3.8 Flash", model: google("gemini-3.8-flash") })
    }

    if (process.env.GROQ_API_KEY) {
        const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
        chain.push({ name: "Groq Llama 3.3 70B", model: groq("llama-3.3-70b-versatile") })
    }

    if (chain.length === 0) {
        // Fallback default google provider if keys are loaded via default environment
        const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
        chain.push({ name: "Gemini 3.5 Flash", model: google("gemini-3.5-flash") })
    }

    return chain
}

export const buildAgent = async (agentConfig: CreatedAgent, userEmail: string) => {
    let composioTools: any = {}
    const instanceName = getWhatsAppInstanceName(userEmail);
    const whatsappTool = createWhatsAppTool(instanceName);

    try {
        const session = await getOrCreateAgentSession(agentConfig, userEmail)
        if (session && typeof session.tools === "function") {
            composioTools = (await session.tools()) || {}
        }
    } catch (err: any) {
        console.warn("[buildAgent] Failed to load Composio session tools:", err?.message || err)
    }

    // Normalizing composio tools into a key-value ToolSet dictionary
    const composioToolsMap: Record<string, any> =
        composioTools && typeof composioTools === "object" && !Array.isArray(composioTools)
            ? composioTools
            : Array.isArray(composioTools)
                ? Object.fromEntries(
                    composioTools.map((t: any, idx: number) => [
                        t.name || t.slug || `tool_${idx}`,
                        t,
                    ])
                )
                : {}

    // Combine Composio tools and Browserbase tool into a valid ToolSet object
    const tools: Record<string, any> = {
        ...composioToolsMap,
        browserbase: browserbaseTool,
        browserbase_tool: browserbaseTool,
        sendWhatsapp: whatsappTool,
        send_whatsapp: whatsappTool,
        sendWhatsAppMessage: whatsappTool,
    }

    const skillsString = Array.isArray(agentConfig?.skills)
        ? agentConfig.skills.join(", ")
        : typeof agentConfig?.skills === "string"
            ? agentConfig.skills
            : ""

    const instructions = `
        Agent Role:
        ${agentConfig?.description || ""},
        Instructions:
        ${agentConfig?.instructions || ""},
        Primary Objective:
        ${agentConfig?.objective || ""},
        Skills:
        ${skillsString},
        Required Output Format:
        ${agentConfig?.outputFormat || ""}
        
        Use only the available tools when needed.
        Do not claim that an action succeeded unless the tool result confirms that.
        Ask for confirmation before destructive or high-risk actions.`.trim()

    return {
        name: agentConfig?.name || "Agent",
        instructions,
        tools,

        run: async (prompt: string | any) => {
            const promptText =
                typeof prompt === "string"
                    ? prompt.trim()
                    : Array.isArray(prompt)
                        ? prompt
                            .map((m: any) =>
                                typeof m === "string"
                                    ? m
                                    : `${m.role || "user"}: ${m.content || ""}`
                            )
                            .join("\n")
                            .trim()
                        : String(prompt || "").trim()

            const finalPrompt = promptText || agentConfig?.objective || "Execute agent task."
            const models = getModelChain()
            let lastError: any = null

            for (const { name, model } of models) {
                try {
                    const res = await generateText({
                        model,
                        system: instructions,
                        prompt: finalPrompt,
                        tools,
                        maxRetries: 0,
                        stopWhen: stepCountIs(10),
                    })

                    console.log(`[buildAgent] Successfully generated output using ${name}`)
                    return res.text
                } catch (err: any) {
                    console.warn(`[buildAgent] ${name} unavailable (${err?.message || err}). Cascading to next model...`)
                    lastError = err
                }
            }
            throw new Error(`All models failed: ${lastError?.message || lastError}`)
        },
    }
}

export const run = async (agent: any, prompt: string | any) => {
    if (!agent || typeof agent.run !== "function") {
        throw new Error("Invalid agent instance: agent.run is not a function")
    }

    const finalOutput = await agent.run(prompt)
    return {
        finalOutput,
    }
}

