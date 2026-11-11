"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowUp, Plus, BriefcaseBusiness, Mail, Search, Loader2, Loader2Icon, type LucideIcon, } from "lucide-react"
import { Button } from "../../ui/button"
import { quickSuggestions, templates } from "@/constants"
import axios from "axios"
import AgentQuestions from "./AgentQuestions"
import AgentCard from "./AgentCard"

const iconMap: Record<string, LucideIcon> = {
    BriefcaseBusiness,
    Mail,
    Search,
}

type AgentConfigResponse = {
    status: 'needs_clarification' | 'ready',
    clarificationQuestions?: ClarificationQuestion[],
    config: any
}

export type ClarificationQuestion = {
    id: string,
    question: string,
    type: "single_select" | "multi_select" | "text" | "number" | "date" | "time",
    options?: string[],
    allowCustom?: boolean,
    customPlaceholder?: string,
    required?: boolean
}

export type AgentSchedule = {
    type: "once" | "recurring" | "manual"
    frequency?: "hourly" | "daily" | "weekly" | "monthly"
    time?: string
    timezone?: string
}

export type CreatedAgent = {
    id: number,
    userEmail: string,
    agentId: string,
    name: string,
    agentImg: string,
    description: string,
    instructions: string,
    objective: string,
    tools: any,
    skills: string[],
    schedule: AgentSchedule,
    outputFormat: string,
    status: string,
    composioSessionId?: string,
    createdAt: string,
}

const CreateAgent = () => {
    const searchParams = useSearchParams();
    const [prompt, setPrompt] = useState('');
    const [configResult, setConfigResult] = useState<AgentConfigResponse|null>(null);
    const [loading, setLoading] = useState(false);
    const [createdAgent, setCreatedAgent] = useState<CreatedAgent|null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const queryPrompt = searchParams.get("prompt");
        if (queryPrompt && !prompt) {
            setPrompt(queryPrompt);
        }
    }, [searchParams, prompt]);

    const getTimezone = () => {return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}

    const onSubmit = async() => {
        if (!prompt.trim()) return;
        setLoading(true);
        setErrorMessage(null);
        try {
            const res = await axios.post("/api/agent/configure", { prompt: prompt, timezone: getTimezone() });
            setConfigResult(res.data);
            setCreatedAgent(res.data);
        } catch (error: any) {
            console.error("Error generating agent:", error);
            setErrorMessage(error?.response?.data?.error || "Failed to generate agent configuration. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const handleClarificationSubmit = async (answers: Record<string, any>) => {
        setLoading(true);
        setErrorMessage(null);
        const clarificationSummary = Object.entries(answers)
            .map(([qId, ans]) => {
                const questionObj = configResult?.clarificationQuestions?.find((q) => q.id === qId);
                const questionTitle = questionObj?.question || qId;
                const formattedAnswer = Array.isArray(ans) ? ans.join(", ") : String(ans);
                return `- ${questionTitle}: ${formattedAnswer}`;
            })
            .join("\n");

        const updatedPrompt = `${prompt}\n\nClarifications and Preferences:\n${clarificationSummary}`;
        try
        {
            const res = await axios.post("/api/agent/configure", { prompt: updatedPrompt });
            setConfigResult(res.data);
            setCreatedAgent(res.data);
        }
        catch (error: any)
        {
            console.error("Error submitting clarifications:", error);
            setErrorMessage(error?.response?.data?.error || "Failed to submit clarifications. Please try again.");
        }
        finally
        {
            setLoading(false);
        }
    }

    return (
        <div className = "mt-5">
            <div>
                <h2 className = "text-2xl font-semibold tracking-tight">Create new Agent</h2>
                <p className = "text-sm mt-1 text-muted-foreground">
                    Ask what type of agent you want to create, Type your goal, task or workflow
                </p>
            </div>
            <div className = "w-full border rounded-2xl bg-background p-3 mt-3 shadow-lg shadow-purple-100 hover:shadow-purple-200">
                <textarea 
                    placeholder = "Describe the agent you want to create..." 
                    className = "min-h-[90px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    value = {prompt}
                    onChange = {(e) => setPrompt(e.target.value)}
                />
                <div className = "flex justify-between items-center">
                    <div>
                        <Button variant = {'ghost'} size = {'icon'}>
                            <Plus />
                        </Button>
                    </div>
                    <Button disabled = {loading} onClick = {onSubmit} size = {'icon'} className = {'h-9 w-9 rounded-full bg-purple-600'}>
                        {loading ? <Loader2 className = "animate-spin" /> : <ArrowUp />}
                    </Button>
                </div>
            </div>
            <div className = "mt-3 flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                    <Button 
                        key = {index} 
                        variant = {'outline'} 
                        onClick = {() => { setPrompt(suggestion.prompt); setErrorMessage(null); }} 
                        className = "hover:text-purple-700 hover:bg-purple-200 hover:border-purple-700"
                    >
                        {suggestion.label}
                    </Button>
                ))}
            </div>

            {errorMessage && (
                <div className = "mt-4 p-4 border border-red-200 bg-red-50 text-red-800 rounded-xl text-sm flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <Button variant = "ghost" size = "sm" onClick = {() => setErrorMessage(null)} className = "text-red-800 hover:bg-red-100">
                        Dismiss
                    </Button>
                </div>
            )}

            {loading ?
                <div className = "flex gap-2 items-center p-5 mt-7 border rounded-xl shadow">
                    <Loader2Icon className = "animate-spin" />
                    <h2>Generating Agent Config...</h2>
                </div>
            : !configResult &&
                <div className = "mt-10">
                    <h2 className = "flex text-lg justify-between items-center font-semibold">
                        Get Started
                        <span className = "text-sm font-medium">View All</span>
                    </h2>
                    <div className = "mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {templates.map((template, index) => {
                            const Icon = iconMap[template.icon]
                            return (
                                <div 
                                    key = {index} 
                                    className = {`border rounded-2xl p-6 transition-all cursor-pointer min-h-[190px] flex flex-col justify-between hover:shadow-lg ${template.border} ${template.glow}`}
                                    onClick = {() => { setPrompt(template.description); setErrorMessage(null); }}
                                >
                                    <div>
                                        <div className = {`w-12 h-12 rounded-xl flex items-center justify-center ${template.iconBg}`}>
                                            {Icon && <Icon className = {`h-6 w-6 ${template.iconColor}`} />}
                                        </div>
                                        <h3 className = "font-semibold mt-4 text-base tracking-tight">{template.title}</h3>
                                        <p className = "text-sm text-muted-foreground mt-2 leading-relaxed">{template.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            }
            {configResult && (
                <div className = "mt-6">
                    {configResult.status == 'needs_clarification' && configResult.clarificationQuestions && (
                        <AgentQuestions 
                            questionList = {configResult.clarificationQuestions} 
                            onSubmit = {handleClarificationSubmit}
                            loading = {loading}
                        />
                    )}
                    <div className = "mt-5">
                        {(configResult.status == 'ready' || (configResult as any).status_ == 'ready') && (
                            <AgentCard createdAgent = {createdAgent} />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateAgent
