import { openai } from '@ai-sdk/openai';
import { appendResponseMessages, streamText } from 'ai';
import { saveChat } from '~/tools/chat-store';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;


export async function POST(req: Request) {
    // id is automagically passed by the useChat client hook, see the docs: https://sdk.vercel.ai/docs/components/chat/use-chat
    const { messages, id } = await req.json();

    if (!id) {
        return new Response('Chat ID is required', { status: 400 });
    }

    const result = streamText({
        model: openai('gpt-4o'),
        system: 'You are a helpful assistant.',
        messages,
        async onFinish({ response }) {
            await saveChat({
                id: id,
                messages: appendResponseMessages({
                    messages,
                    responseMessages: response.messages,
                }),
            });
        },
    });

    return result.toDataStreamResponse({
        getErrorMessage: error => {
            if (error == null) {
                return 'unknown error';
            }

            if (typeof error === 'string') {
                return error;
            }

            if (error instanceof Error) {
                return error.message;
            }

            return JSON.stringify(error);
        },
        // sendReasoning: true,    //// for use with DeepSeek models
        // sendSources: true,      //// for use with Perplexity/Google GenerativeAI
    });
}