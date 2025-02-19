import { ToolInvocationUIPart, UIMessage } from "@ai-sdk/ui-utils";
import { MyAddToolResult } from "./chat";
import MarkdownRenderer from "~/components/ui/markdown-renderer";

// the type for a specific Part of a message, see ai sdk docs for more info
type MessagePartProps = {
    part: UIMessage["parts"][number]
    addToolResult: MyAddToolResult
}

export const MessagePart: React.FC<MessagePartProps> = ({
    part,
    addToolResult,
}) => {
    switch (part.type) {
        // render text parts as simple text:
        case 'text':
            return <MarkdownRenderer>{part.text}</MarkdownRenderer>;

        // for tool invocations, distinguish between the tools and the state:
        case 'tool-invocation':
            return <ToolCall part={part} addToolResult={addToolResult} />
    }
}

export function ToolCall({
    part,
    addToolResult,
}: {
    part: ToolInvocationUIPart
    addToolResult: MyAddToolResult
}) {

    const callId = part.toolInvocation.toolCallId;

    switch (part.toolInvocation.toolName) {
        case 'askForConfirmation': {
            switch (part.toolInvocation.state) {
                case 'partial-call':
                case 'call':
                    return (
                        <div key={callId} className="text-gray-500">
                            {part.toolInvocation.args.message}
                            <div className="flex gap-2">
                                <button
                                    className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                                    onClick={() =>
                                        addToolResult({
                                            toolCallId: callId,
                                            result: 'Yes, confirmed.',
                                        })
                                    }
                                >
                                    Yes
                                </button>
                                <button
                                    className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                                    onClick={() =>
                                        addToolResult({
                                            toolCallId: callId,
                                            result: 'No, denied',
                                        })
                                    }
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    );
                case 'result':
                    return (
                        <div key={callId} className="text-gray-500">
                            Location access allowed:{' '}
                            {part.toolInvocation.result}
                        </div>
                    );
            }
        }

        case 'getLocation': {
            switch (part.toolInvocation.state) {
                case 'partial-call':
                case 'call':
                    return (
                        <div key={callId} className="text-gray-500">
                            Getting location...
                        </div>
                    );
                case 'result':
                    return (
                        <div key={callId} className="text-gray-500">
                            Location: {part.toolInvocation.result}
                        </div>
                    );
            }
        }

        case 'getWeatherInformation': {
            switch (part.toolInvocation.state) {
                // example of pre-rendering streaming tool calls:
                case 'partial-call':
                    return (
                        <pre key={callId}>
                            {JSON.stringify(part.toolInvocation, null, 2)}
                        </pre>
                    );
                case 'call':
                    return (
                        <div key={callId} className="text-gray-500">
                            Getting weather information for{' '}
                            {part.toolInvocation.args.city}...
                        </div>

                    );
                case 'result':
                    return (
                        <div key={callId} className="text-gray-500">
                            Weather in {part.toolInvocation.args.city}:{' '}
                            {part.toolInvocation.result}
                        </div>
                    );
            }
            break;
        }
    }
}
