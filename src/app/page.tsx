import Link from "next/link";


export default function Page() {
    return (
        <div>
            <h1>Welcome to EriBot Chat App. <div>Please go to <Link href="/chat" className="text-pink-400">chat</Link> to start a new chat.</div></h1>
        </div>
    )
}