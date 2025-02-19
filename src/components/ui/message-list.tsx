import { ReactNode } from "react";
import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "~/components/ui/chat-message"
import { TypingIndicator } from "~/components/ui/typing-indicator"
import { MyAddToolResult } from "~/ui/chat"

type AdditionalMessageOptions = {
  showTimeStamp?: boolean | undefined;
  animation?: "none" | "slide" | "scale" | "fade" | null | undefined;
  actions?: ReactNode;
  className?: string | undefined;
}

interface MessageListProps {
  addToolResult: MyAddToolResult
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  messageOptions?:
  | AdditionalMessageOptions
  | ((message: Message) => AdditionalMessageOptions)
}

export function MessageList({
  addToolResult,
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: MessageListProps) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            addToolResult={addToolResult}
            {...message}
            {...additionalOptions}
          />
        )
      })}
      {isTyping && <TypingIndicator />}
    </div>
  )
}
