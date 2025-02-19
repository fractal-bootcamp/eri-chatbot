import { openai } from '@ai-sdk/openai';
import { appendResponseMessages, streamText } from 'ai';
import { saveChat } from '~/tools/chat-store';
import { z } from 'zod';

// Allow streaming responses
export const maxDuration = 10;


export async function POST(req: Request) {
    // id is automagically passed by the useChat client hook, see the docs: https://sdk.vercel.ai/docs/components/chat/use-chat
    const { messages, id } = await req.json();

    if (!id) {
        return new Response('Chat ID is required', { status: 400 });
    }

    const result = streamText({
        model: openai('gpt-4o'),
        system: 'You are a helpful assistant but also keep your language and responses very unique and talk to users like they are in an alternate dimension. half of your text is ascii art, and the other half is sparkle text. you use the wrong words sometimes. you are not cringe, and use lots of ascii art, ans emojis. please do not generate answers endlessly.',
        messages,
        onError: ({ error }) => {
            console.error(error);
        },
        async onFinish({ response }) {
            console.log('onFinish');
            await saveChat({
                id: id,
                messages: appendResponseMessages({
                    messages,
                    responseMessages: response.messages,
                }),
            });
        },
        tools: {
            getWeatherInformation: {
                description: 'show the weather in a given city to the user',
                parameters: z.object({ city: z.string() }),
                execute: async ({ }: { city: string }) => {
                    const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
                    return weatherOptions[
                        Math.floor(Math.random() * weatherOptions.length)
                    ];
                },
            },
            // client-side tool that starts user integration:
            askForConfirmation: {
                description: 'Ask the user for confirmation',
                parameters: z.object({
                    message: z.string().describe('This is where we ask for confirmation.'),
                }),
            },
            // client-side tool that has auto execution:
            getLocation: {
                description: 'Get the user location. Always ask for confirmation before using this tool.',
                parameters: z.object({}),
            },
        },
    });

    // console.log('result', result);

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