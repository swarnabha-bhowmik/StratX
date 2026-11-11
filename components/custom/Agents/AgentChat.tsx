"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, Loader2, Paperclip, Sparkles } from "lucide-react"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { CreatedAgent } from "./CreateAgent"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Props = {
    agent: CreatedAgent
    open: boolean
    onOpenChange: (open: boolean) => void
}

type ChatMessage = {
    id: string
    role: "user" | "agent"
    content: string
    createdAt?: Date
}

const AgentMessage = ({
    agent,
    content,
}: {
    agent: CreatedAgent
    content: string
}) => {
    return (
        <div className="flex items-start gap-2.5 max-w-[85%]">
            <img
                src={agent?.agentImg || "/logo.png"}
                alt={agent?.name || "Agent"}
                className="size-8 rounded-xl bg-slate-100 dark:bg-muted border border-border object-contain shrink-0 mt-0.5 p-0.5"
            />
            <Bubble align="start" variant="outline" className="max-w-full">
                <BubbleContent className="bg-background text-foreground shadow-2xs border-border/80">
                    <div className="text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </BubbleContent>
            </Bubble>
        </div>
    )
}

const AgentChat = ({ agent, open, onOpenChange }: Props) => {
    const [prompt, setPrompt] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isReplying, setIsReplying] = useState(false)
    const messageEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        })
    }, [messages, isReplying])

    // Focus input when sheet opens
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                textareaRef.current?.focus()
            }, 150)
        }
    }, [open])

    const sendMessage = async () => {
        const message = prompt.trim()

        if (!message || isReplying) return

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
            createdAt: new Date(),
        }
        const updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
        setPrompt("")
        setIsReplying(true)

        try {
            const res = await axios.post("/api/agent/run", {
                agentConfig: agent,
                agentId: agent?.agentId,
                input: updatedMessages,
            })

            const agentMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "agent",
                content: res.data?.finalOutput || "Agent completed the task without text response.",
                createdAt: new Date(),
            }

            setMessages((prev) => [...prev, agentMsg])
        } catch (error) {
            console.error("Failed to generate agent response:", error)
            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "agent",
                content: "Sorry, I ran into an error while processing your request. Please try again.",
                createdAt: new Date(),
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsReplying(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-xl h-full"
            >
                <SheetHeader className="border-b px-5 py-4 pr-14 shrink-0 bg-background">
                    <div className="flex items-center gap-3">
                        <img
                            src={agent?.agentImg || "/logo.png"}
                            alt={agent?.name || "Agent"}
                            className="size-11 rounded-xl bg-slate-100 dark:bg-muted border border-border object-contain p-1"
                        />

                        <div className="min-w-0 flex-1">
                            <SheetTitle className="truncate text-base font-semibold text-foreground">
                                {agent?.name || "AI Agent"}
                            </SheetTitle>

                            <SheetDescription className="truncate text-xs text-muted-foreground mt-0.5">
                                Chat with your agent and give it a task to perform
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-5">
                    <div className="flex min-h-full flex-col justify-end space-y-4">
                        <div className="mx-auto mb-4 max-w-sm text-center">
                            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/50 shadow-2xs">
                                <Sparkles className="size-5" />
                            </div>

                            <h2 className="text-sm font-semibold text-foreground">
                                Start a chat with {agent?.name || "your agent"}
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {agent?.objective || agent?.description || "Give your agent instructions, ask questions, or trigger actions."}
                            </p>
                        </div>

                        <AgentMessage
                            agent={agent}
                            content={`Hi! I'm ${agent?.name || "your agent"}. What would you like to achieve today?`}
                        />

                        {messages.map((message) =>
                            message.role === "user" ? (
                                <div key={message.id} className="flex justify-end">
                                    <Bubble align="end" variant="default" className="max-w-[85%]">
                                        <BubbleContent className="bg-purple-600 text-white rounded-2xl">
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        </BubbleContent>
                                    </Bubble>
                                </div>
                            ) : (
                                <AgentMessage
                                    key={message.id}
                                    agent={agent}
                                    content={message.content}
                                />
                            )
                        )}

                        {isReplying && (
                            <div className="flex items-start gap-2.5 max-w-[85%]">
                                <img
                                    src={agent?.agentImg || "/logo.png"}
                                    alt={agent?.name || "Agent"}
                                    className="size-8 rounded-xl bg-slate-100 dark:bg-muted border border-border object-contain shrink-0 mt-0.5 p-0.5"
                                />
                                <Bubble align="start" variant="outline">
                                    <BubbleContent className="bg-background text-foreground shadow-2xs border-border/80">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="size-3.5 animate-spin text-purple-600" />
                                            <span className="text-sm">
                                                {agent?.name || "Agent"} is thinking...
                                            </span>
                                        </div>
                                    </BubbleContent>
                                </Bubble>
                            </div>
                        )}

                        <div ref={messageEndRef} />
                    </div>
                </div>

                <div className="border-t bg-background p-4 shrink-0">
                    <div className="relative rounded-2xl border border-input bg-background p-2.5 shadow-2xs focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                        <Textarea
                            ref={textareaRef}
                            placeholder={`Message ${agent?.name || "agent"}...`}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="min-h-[58px] max-h-36 w-full resize-none border-0 p-1.5 text-sm shadow-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/70"
                            rows={2}
                        />
                        <div className="flex items-center justify-between pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                                title="Attach file"
                            >
                                <Paperclip className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                onClick={sendMessage}
                                disabled={isReplying || !prompt.trim()}
                                className="size-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
                                title="Send message"
                            >
                                {isReplying ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <ArrowUp className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                        Press Enter to send, Shift + Enter for a new line
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default AgentChat