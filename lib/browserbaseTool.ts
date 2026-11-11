import Browserbase from "@browserbasehq/sdk";
import { tool } from "ai";
import { z } from "zod";

async function research(task: string) {
    const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY });

    const { runId } = await bb.agents.runs.create({
        agentId: process.env.BROWSERBASE_AGENT_ID,
        task: task,
        browserSettings: { proxies: true },
    });

    const deadline = Date.now() + 4 * 60 * 1000;
    const terminal = ["COMPLETED", "FAILED", "STOPPED", "TIMED_OUT"];

    while (Date.now() < deadline) {
        const run = await bb.agents.runs.retrieve(runId);

        if (terminal.includes(run.status)) {
            if (run.status !== "COMPLETED") {
                throw new Error(`Browser run finished with status: ${run.status}`);
            }
            return { runId, status: run.status, result: run.result };
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Browser ran out of time");
}

export const browserbaseTool = tool({
    description: "Use this tool when the user asks to browse or search the web, compare current product prices, check current availability, or verify some information from websites. This is a read-only browser tool.",
    inputSchema: z.object({
        task: z.string().min(10).describe("The complete live web search task to perform"),
    }),
    async execute({ task }) {
        try
        {
            const res = await research(task);
            return res;
        }
        catch (e: any)
        {
            return {
                status: "ERROR",
                error: e instanceof Error ? e.message : String(e),
            };
        }
    },
});