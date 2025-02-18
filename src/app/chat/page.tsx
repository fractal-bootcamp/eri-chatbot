import { redirect } from 'next/navigation';
import { createChat } from '~/tools/chat-store';
import Chat from "~/ui/chat";

export default async function Page() {
  const id = await createChat();
  redirect(`/chat/${id}`);
}
