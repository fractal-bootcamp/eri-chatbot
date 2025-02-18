
// types for the project

// message, user, session, botID/model 

// import { useChat } from "@ai-sdk/react";

export type Message = {
    id: string;
    content: string;
    role: "user" | "assistant";
    createdAt: Date;
    sessionId: string;
};

export type Session = {
    id: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    endedAt: Date | null;
};

export type Bot = {
    id: string;
    name: string;
    model: string;
};

export type User = {
    id: string;
    email: string;
    name: string;
    password: string;
    loggenIn: Date | null;
    signedOut: Date | null;
};


