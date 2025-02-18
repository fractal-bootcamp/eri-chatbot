"use client"

import { useChat } from "@ai-sdk/react"

import { Chat as ShadCNChat } from "~/components/ui/chat"

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
        useChat()

    return (
        <ShadCNChat
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isGenerating={isLoading}
            stop={stop}
        />
    )
}