import Link from "next/link";


export default function Page() {
    return (
        <div>
            <h1>EriBot's Chat App. <div>Please go to <Link href="/chat" className="text-blue-500">chat</Link> to start a new chat.</div></h1>
        </div>
    )
}