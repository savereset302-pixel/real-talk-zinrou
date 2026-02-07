"use client";
import { useGame } from "@/context/GameContext";
import { useEffect, useState } from "react";

export default function SimultaneousEvent() {
    const { room } = useGame();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (room?.simultaneousEvent?.active) {
            const endTime = room.simultaneousEvent.endTime.toDate(); // Firestore timestamp
            if (endTime > new Date()) {
                setShow(true);
                const timeout = setTimeout(() => setShow(false), endTime.getTime() - Date.now());
                return () => clearTimeout(timeout);
            }
        }
    }, [room?.simultaneousEvent]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="text-center animate-pulse">
                <h2 className="text-4xl font-bold text-red-500 mb-4 neon-text">⚠️ ALERT ⚠️</h2>
                <p className="text-2xl text-white mb-8">TOUCH YOUR DEVICE NOW!</p>
                <div className="w-64 h-64 bg-green-500/20 rounded-full border-4 border-green-500 mx-auto flex items-center justify-center">
                    <span className="text-green-500 text-xl">Everyone Tap Here</span>
                </div>
            </div>
        </div>
    );
}
