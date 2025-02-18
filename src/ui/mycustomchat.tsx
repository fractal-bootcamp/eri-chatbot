'use client';

import { useChat } from '@ai-sdk/react';
import { type Message } from "ai";
import { useRef, useState } from "react";
import { Attachment } from "@ai-sdk/ui-utils";





export default function MyCustomChat({
    id,
    initialMessages,
}: {
    id: string; initialMessages: Message[]
}) {

    const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error, status, stop, reload } =
        useChat({
            id,
            initialMessages,
            sendExtraMessageFields: true,
            // api: '/api/custom-chat',
            credentials: 'same-origin',
            // streamProtocol: 'text',
        });

    /// for attaching files to the message
    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <>

            {messages.map(message => (
                <div key={message.id}>

                    <span>{message.role === 'user' ? 'User: ' : 'AI: '}</span>

                    <span>{message.content}</span>

                    <div>
                        {message.experimental_attachments
                            ?.filter(attachment =>
                                attachment.contentType?.startsWith('image/'),
                            )
                            .map((attachment, index) => (
                                <img
                                    key={`${message.id}-${index}`}
                                    src={attachment.url}
                                    alt={attachment.name}
                                />
                            ))}
                    </div>

                    {/* for use with Reasoning ==> deepseek models
                    {message.parts.map((part, index) => {
                        if (part.type === 'text') {
                            return <div key={index}>{part.text}</div>
                        }
                        if (part.type === 'reasoning') {
                            return <pre key={index}>{part.reasoning}</pre>;
                        }
                    })}

                    for use with Sources ==> perplexity/google generativeai
                    {message.parts
                        .filter(part => part.type !== 'source')
                        .map((part, index) => {
                            if (part.type === 'text') {
                                return <div key={index}>{part.text}</div>;
                            }
                        })}
                    {message.parts
                        .filter(part => part.type === 'source')
                        .map(part => (
                            <span key={`source-${part.source.id}`}>
                                [
                                <a href={part.source.url} target="_blank">
                                    {part.source.title ?? new URL(part.source.url).hostname}
                                </a>
                                ]
                            </span>
                        ))} */}
                </div>
            ))}

            {error && (
                <>
                    <div>An error occurred.</div>
                    <button type="button" onClick={() => reload()}>
                        Retry
                    </button>
                </>
            )}

            {(status === 'submitted' || status === 'streaming') && (
                <div>
                    {status === 'submitted' && <div>Submitting...</div>}
                    <button type="button" onClick={stop}>Stop</button>
                    <button onClick={() => reload()} disabled={status === 'submitted' || status === 'streaming'}>Retry</button>
                </div>
            )}

            <form
                onSubmit={event => {
                    handleSubmit(event, {
                        allowEmptySubmit: true,
                        experimental_attachments: files,
                    });

                    setFiles(undefined);

                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }}
            >
                <input
                    type="file"
                    onChange={event => {
                        if (event.target.files) {
                            setFiles(event.target.files);
                        }
                    }}
                    multiple
                    ref={fileInputRef}
                />


                <input
                    name="prompt"
                    value={input}
                    onChange={handleInputChange}
                    disabled={error !== null && status !== 'ready'}
                />
                <button type="submit">Submit</button>
            </form>
        </>
    );
}
