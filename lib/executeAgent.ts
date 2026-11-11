import { CreatedAgent } from "@/components/custom/Agents/CreateAgent"
import { buildAgent, run } from "./buildAgent"

export const executeAgent = async (agentConfig: CreatedAgent, userEmail: string, input: any) => {
    const status = agentConfig?.status?.toLowerCase()
    // Only reject if explicitly archived or deleted
    if (status === "archived" || status === "deleted") {
        throw new Error("Agent is archived or deleted!")
    }

    const agent = await buildAgent(agentConfig, userEmail)
    const promptInput = typeof input === "string" ? input.trim() : input
    const res = await run(agent, promptInput || agentConfig?.objective)

    return {
        finalOutput: res?.finalOutput
    }
}
