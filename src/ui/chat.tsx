"use client"

import { useChat } from "@ai-sdk/react"

import { Chat as ShadCNChat } from "~/components/ui/chat"

export type MyAddToolResult = ({ toolCallId, result, }: {
    toolCallId: string;
    result: any;
}) => void

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, stop, addToolResult } =
        useChat({
            maxSteps: 5,
            async onToolCall({ toolCall }) {
                if (toolCall.toolName === 'getLocation') {
                    const cities = ['New York', 'Los Angeles', 'Paris', 'London', 'Tokyo', 'Soeul']
                    return cities[Math.floor(Math.random() * cities.length)];
                }
            },
        });


    return (
        <ShadCNChat
            messages={messages}
            addToolResult={addToolResult}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isGenerating={isLoading}
            stop={stop}
            placeholder="hellllllooooooooo..."
        />
    )
}