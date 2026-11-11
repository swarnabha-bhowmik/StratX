"use client"

import { useState } from "react"
import { 
    Sparkles, 
    Check, 
    Plus, 
    ArrowRight, 
    Loader2, 
    Type, 
    Hash, 
    Calendar, 
    Clock, 
    CheckCircle2,
    X
} from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { cn } from "@/lib/utils"
import { ClarificationQuestion } from "./CreateAgent"

interface AgentQuestionsProps {
    questionList: ClarificationQuestion[]
    onSubmit?: (answers: Record<string, any>) => void
    loading?: boolean
}

const AgentQuestions = ({ questionList = [], onSubmit, loading = false }: AgentQuestionsProps) => {
    // Stores answers keyed by question ID
    const [answers, setAnswers] = useState<Record<string, any>>({})
    // Temporary inputs for custom options
    const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
    // Tracks if custom mode is activated per question
    const [customActive, setCustomActive] = useState<Record<string, boolean>>({})

    // Single Select handler
    const handleSingleSelect = (questionId: string, option: string) => {
        setCustomActive((prev) => ({ ...prev, [questionId]: false }))
        setAnswers((prev) => ({ ...prev, [questionId]: option }))
    }

    // Toggle custom mode for single select
    const handleToggleCustomSingle = (questionId: string) => {
        setCustomActive((prev) => {
            const nextState = !prev[questionId]
            if (nextState) {
                // If opening custom, set answer to whatever is in customInputs or empty
                setAnswers((a) => ({ ...a, [questionId]: customInputs[questionId] || "" }))
            }
            return { ...prev, [questionId]: nextState }
        })
    }

    // Change custom text for single select
    const handleCustomSingleChange = (questionId: string, val: string) => {
        setCustomInputs((prev) => ({ ...prev, [questionId]: val }))
        setAnswers((prev) => ({ ...prev, [questionId]: val }))
    }

    // Multi Select handler
    const handleMultiSelect = (questionId: string, option: string) => {
        const currentList: string[] = Array.isArray(answers[questionId]) ? answers[questionId] : []
        const updatedList = currentList.includes(option)
            ? currentList.filter((item) => item !== option)
            : [...currentList, option]

        setAnswers((prev) => ({ ...prev, [questionId]: updatedList }))
    }

    // Add custom tag to multi select
    const handleAddCustomMulti = (questionId: string) => {
        const text = (customInputs[questionId] || "").trim()
        if (!text) return

        const currentList: string[] = Array.isArray(answers[questionId]) ? answers[questionId] : []
        if (!currentList.includes(text)) {
            setAnswers((prev) => ({ ...prev, [questionId]: [...currentList, text] }))
        }
        setCustomInputs((prev) => ({ ...prev, [questionId]: "" }))
    }

    // Direct input handler (text, number, date, time)
    const handleDirectInputChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }

    // Calculate how many questions have answers
    const answeredCount = questionList.filter((q) => {
        const a = answers[q.id]
        if (Array.isArray(a)) return a.length > 0
        return Boolean(a !== undefined && a !== null && String(a).trim() !== "")
    }).length

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(answers)
        }
    }

    if (!questionList || questionList.length === 0) {
        return null
    }

    const getTypeBadge = (type: ClarificationQuestion["type"]) => {
        switch (type) {
            case "single_select":
                return <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">Choose 1</span>
            case "multi_select":
                return <span className="text-[11px] font-medium text-purple-700 bg-purple-100 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-md">Choose multiple</span>
            case "text":
                return (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Type className="w-3 h-3" /> Text
                    </span>
                )
            case "number":
                return (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Number
                    </span>
                )
            case "date":
                return (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date
                    </span>
                )
            case "time":
                return (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time
                    </span>
                )
            default:
                return null
        }
    }

    return (
        <div className="w-full rounded-2xl border border-purple-200/80 bg-card p-6 shadow-sm dark:border-purple-950/60 transition-all">
            {/* Header with AI Badge & Progress */}
            <div className="flex flex-col gap-2 border-b border-border/60 pb-5">
                <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        AI Agent Clarifications
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                        {answeredCount} of {questionList.length} answered
                    </span>
                </div>

                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        A few details to tailor your Agent
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Our model generated {questionList.length} quick {questionList.length === 1 ? "question" : "questions"} to fine-tune instructions, schedule, and tools.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                        className="bg-purple-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${(answeredCount / Math.max(questionList.length, 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-5 mt-5">
                {questionList.map((question, index) => {
                    const hasAnswer = (() => {
                        const a = answers[question.id]
                        if (Array.isArray(a)) return a.length > 0
                        return Boolean(a !== undefined && a !== null && String(a).trim() !== "")
                    })()

                    return (
                        <div 
                            key={question.id || index}
                            className={cn(
                                "p-4 rounded-xl border bg-background/50 transition-all duration-200",
                                hasAnswer 
                                    ? "border-purple-200/90 dark:border-purple-900/40 shadow-xs" 
                                    : "border-border/70 hover:border-purple-200"
                            )}
                        >
                            {/* Question Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                    <span className={cn(
                                        "w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                        hasAnswer 
                                            ? "bg-purple-600 text-white" 
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {hasAnswer ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : index + 1}
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground leading-snug">
                                            {question.question}
                                        </h4>
                                    </div>
                                </div>
                                {getTypeBadge(question.type)}
                            </div>

                            {/* Question Content / Inputs */}
                            <div className="mt-3.5 pl-8.5">
                                {/* Single Select */}
                                {question.type === "single_select" && (
                                    <div className="space-y-2.5">
                                        <div className="flex flex-wrap gap-2">
                                            {question.options?.map((option, optIdx) => {
                                                const isSelected = answers[question.id] === option && !customActive[question.id]
                                                return (
                                                    <button
                                                        key={optIdx}
                                                        type="button"
                                                        onClick={() => handleSingleSelect(question.id, option)}
                                                        className={cn(
                                                            "px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border text-left",
                                                            isSelected
                                                                ? "border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200 ring-1 ring-purple-500/30 shadow-xs"
                                                                : "border-border/80 bg-background text-muted-foreground hover:text-foreground hover:border-purple-300 hover:bg-purple-50/20"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                                                            isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-muted-foreground/40"
                                                        )}>
                                                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                        </div>
                                                        <span>{option}</span>
                                                    </button>
                                                )
                                            })}

                                            {question.allowCustom && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleCustomSingle(question.id)}
                                                    className={cn(
                                                        "px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border text-left",
                                                        customActive[question.id]
                                                            ? "border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200 ring-1 ring-purple-500/30"
                                                            : "border-dashed border-border/90 bg-background/50 text-muted-foreground hover:text-foreground hover:border-purple-400"
                                                    )}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Other</span>
                                                </button>
                                            )}
                                        </div>

                                        {question.allowCustom && customActive[question.id] && (
                                            <div className="flex items-center gap-2 max-w-md pt-1">
                                                <Input
                                                    value={customInputs[question.id] || ""}
                                                    onChange={(e) => handleCustomSingleChange(question.id, e.target.value)}
                                                    placeholder={question.customPlaceholder || "Enter custom answer..."}
                                                    className="text-xs h-9 bg-background focus-visible:ring-purple-500"
                                                    autoFocus
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Multi Select */}
                                {question.type === "multi_select" && (
                                    <div className="space-y-2.5">
                                        <div className="flex flex-wrap gap-2">
                                            {question.options?.map((option, optIdx) => {
                                                const currentList: string[] = Array.isArray(answers[question.id]) ? answers[question.id] : []
                                                const isSelected = currentList.includes(option)
                                                return (
                                                    <button
                                                        key={optIdx}
                                                        type="button"
                                                        onClick={() => handleMultiSelect(question.id, option)}
                                                        className={cn(
                                                            "px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border text-left",
                                                            isSelected
                                                                ? "border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200 ring-1 ring-purple-500/30 shadow-xs"
                                                                : "border-border/80 bg-background text-muted-foreground hover:text-foreground hover:border-purple-300 hover:bg-purple-50/20"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all",
                                                            isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-muted-foreground/40"
                                                        )}>
                                                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                        </div>
                                                        <span>{option}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Added custom values for multi-select */}
                                        {Array.isArray(answers[question.id]) && answers[question.id].some((val: string) => !question.options?.includes(val)) && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {answers[question.id]
                                                    .filter((val: string) => !question.options?.includes(val))
                                                    .map((customVal: string, cIdx: number) => (
                                                        <span 
                                                            key={cIdx} 
                                                            className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 px-2.5 py-1 rounded-lg text-xs"
                                                        >
                                                            {customVal}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleMultiSelect(question.id, customVal)}
                                                                className="hover:text-purple-950 dark:hover:text-white"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                            </div>
                                        )}

                                        {question.allowCustom && (
                                            <div className="flex items-center gap-2 max-w-md pt-1">
                                                <Input
                                                    value={customInputs[question.id] || ""}
                                                    onChange={(e) => setCustomInputs((prev) => ({ ...prev, [question.id]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            handleAddCustomMulti(question.id)
                                                        }
                                                    }}
                                                    placeholder={question.customPlaceholder || "Add custom option and press Enter..."}
                                                    className="text-xs h-9 bg-background focus-visible:ring-purple-500"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddCustomMulti(question.id)}
                                                    className="h-9 px-3 text-xs shrink-0"
                                                >
                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Text Question */}
                                {question.type === "text" && (
                                    <div className="max-w-lg">
                                        <Input
                                            value={answers[question.id] || ""}
                                            onChange={(e) => handleDirectInputChange(question.id, e.target.value)}
                                            placeholder={question.customPlaceholder || "Type your response here..."}
                                            className="text-xs h-9 bg-background focus-visible:ring-purple-500"
                                        />
                                    </div>
                                )}

                                {/* Number Question */}
                                {question.type === "number" && (
                                    <div className="max-w-xs">
                                        <Input
                                            type="number"
                                            value={answers[question.id] || ""}
                                            onChange={(e) => handleDirectInputChange(question.id, e.target.value)}
                                            placeholder={question.customPlaceholder || "Enter a number..."}
                                            className="text-xs h-9 bg-background focus-visible:ring-purple-500"
                                        />
                                    </div>
                                )}

                                {/* Date Question */}
                                {question.type === "date" && (
                                    <div className="max-w-xs">
                                        <Input
                                            type="date"
                                            value={answers[question.id] || ""}
                                            onChange={(e) => handleDirectInputChange(question.id, e.target.value)}
                                            className="text-xs h-9 bg-background focus-visible:ring-purple-500"
                                        />
                                    </div>
                                )}

                                {/* Time Question */}
                                {question.type === "time" && (
                                    <div className="max-w-xs">
                                        <Input
                                            type="time"
                                            value={answers[question.id] || ""}
                                            onChange={(e) => handleDirectInputChange(question.id, e.target.value)}
                                            className="text-xs h-9 bg-background focus-visible:ring-purple-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                    {answeredCount === questionList.length ? (
                        <span className="text-green-600 dark:text-green-400 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> All questions answered
                        </span>
                    ) : (
                        "Answer what applies; sensible defaults will be used for any skipped items."
                    )}
                </p>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || answeredCount === 0}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 h-9 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Building Agent...</span>
                        </>
                    ) : (
                        <>
                            <span>Continue to Build Agent</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export default AgentQuestions
