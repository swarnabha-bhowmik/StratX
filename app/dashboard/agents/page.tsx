"use client"

import { useState, Suspense } from "react"
import CreateAgent from "@/components/custom/Agents/CreateAgent"
import MyAgents from "@/components/custom/Agents/MyAgents"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

const AgentPage = () => {
    const [activeTab, setActiveTab] = useState("create-agent");

    return (
        <div className = "w-full flex justify-center">
            <div className = "w-full max-w-4xl px-6 pt-24 pb-16">
                <Tabs value = {activeTab} onValueChange = {setActiveTab} className = "w-full">
                    <TabsList className = "p-1 rounded-xl">
                        <TabsTrigger value = "create-agent" className = "rounded-lg text-xs font-medium">
                            Create new Agent
                        </TabsTrigger>
                        <TabsTrigger value = "my-agent" className = "rounded-lg text-xs font-medium">
                            My Agents
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value = "create-agent">
                        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-blue-600" /></div>}>
                            <CreateAgent />
                        </Suspense>
                    </TabsContent>
                    <TabsContent value = "my-agent">
                        <MyAgents onCreateNew = {() => setActiveTab("create-agent")} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default AgentPage
