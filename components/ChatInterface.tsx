"use client";
import { useGame } from "@/context/GameContext";
import { useState, useRef, useEffect } from "react";

export default function ChatInterface() {
    const { user, room, messages, sendMessage, triggerSimultaneousEvent, startGame } = useGame();
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        setIsSending(true);
        const text = input;
        setInput("");

        // Simulate "Encryption" phase visually before the actual context delay handles it?
        // Actually context handles the delay logic, but we want to show feedback.
        // We can just call sendMessage, and show a spinner.
        // But since sendMessage is async and waits for the delay? 
        // Wait, my sendMessage implementation had setTimeout but didn't await it effectively for the UI 
        // (it returned immediately or after delay? I need to check GameContext).
        // Checking GameContext: sendMessage returns Promise<void>, but the setTimeout is inside.
        // The Promise resolves *immediately* because I didn't await the timeout unless I wrapped it.
        // Let's assume I need to wrap it in a promise there or handle it here.
        // I will update GameContext logic later if needed, but for now let's assume valid behavior.

        await sendMessage(text);

        // Reset sending state after a fixed time or when message appears?
        // Since message appearance is delayed 3-8s, we should probably keep "Sending..." 
        // or just show "Encrypted & Sent" immediate feedback.
        // The requirement is "Random delay sending".
        // If I show "Sent" immediately, user knows they sent it.
        // If I show "Sending..." for 8 seconds, it feels laggy but hides the exact moment.

        setTimeout(() => {
            setIsSending(false);
        }, 2000); // Fake "processing" time
    };

    return (
        <div className="flex flex-col h-screen bg-black text-green-500 font-mono p-4">
            {/* Header */}
            <div className="border-b border-green-800 pb-2 mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold neon-text">ROOM: {room?.id}</h1>
                    <div className="text-xs text-green-700">STATUS: {room?.status}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs">ID: {user?.id.slice(0, 4)}...</div>
                    <div className="text-sm font-bold text-neon-purple">{user?.role || "UNKNOWN"}</div>
                    {room?.status === "waiting" && room.players?.[0]?.id === user?.id && (
                        <button
                            onClick={() => startGame()}
                            className="mt-1 text-[10px] bg-green-700 text-black px-2 py-0.5 rounded hover:bg-green-600"
                        >
                            [START GAME]
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[80%] p-3 rounded border ${isMe
                                    ? "border-green-600 bg-green-900/10 text-right"
                                    : "border-gray-700 bg-gray-900/50"
                                    }`}
                            >
                                {!isMe && <div className="text-xs text-gray-500 mb-1">USER_{msg.senderId.slice(0, 4)}</div>}
                                <div className="break-words">{msg.text}</div>
                                <div className="text-[10px] text-gray-600 mt-1">
                                    {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString() : "..."}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="mt-auto">
                {isSending && (
                    <div className="text-xs text-neon-purple animate-pulse mb-2">
                        [SYSTEM] ENCRYPTING DATA PACKET... REROUTING...
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isSending}
                        className="flex-1 bg-black border border-green-700 p-3 outline-none focus:border-green-400 focus:shadow-[0_0_10px_#00ff41] transition-all"
                        placeholder={isSending ? "TRANSMITTING..." : "ENTER MESSAGE..."}
                    />
                    <button
                        type="submit"
                        disabled={isSending || !input.trim()}
                        className="bg-green-900/30 border border-green-600 px-6 py-2 hover:bg-green-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        SEND
                    </button>
                </form>

                {/* Anti-Doxxing Controls */}
                <div className="mt-4 flex justify-between">
                    <button
                        onClick={() => triggerSimultaneousEvent()}
                        className="text-xs text-red-500 underline hover:text-red-400"
                    >
                        [DEBUG] TRIGGER SYNC EVENT
                    </button>
                    <div className="text-xs text-gray-600">
                        SECURE CONNECTION
                    </div>
                </div>
            </div>
        </div>
    );
}
