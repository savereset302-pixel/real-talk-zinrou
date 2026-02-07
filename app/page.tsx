"use client";
import { useGame } from "@/context/GameContext";
import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import BossKey from "@/components/BossKey";
import SimultaneousEvent from "@/components/SimultaneousEvent";

export default function Home() {
  const { user, room, createRoom, joinRoom } = useGame();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [joining, setJoining] = useState(false);

  const handleCreate = async () => {
    setJoining(true);
    await createRoom();
    setJoining(false);
  };

  const handleJoin = async () => {
    if (!roomIdInput) return;
    setJoining(true);
    await joinRoom(roomIdInput);
    setJoining(false);
  };

  if (room?.id) {
    return (
      <main className="relative min-h-screen">
        <ChatInterface />
        <BossKey />
        <SimultaneousEvent />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border border-green-500 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-purple-500 rounded-full animate-ping"></div>
      </div>

      <div className="z-10 max-w-md w-full space-y-8 bg-black/50 p-8 border border-green-800 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,65,0.2)]">
        <h1 className="text-4xl font-bold mb-8 neon-text tracking-tighter">
          REAL TALK <span className="text-neon-purple">ZINROU</span>
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleCreate}
            disabled={joining}
            className="w-full py-4 text-xl font-bold border-2 border-green-500 hover:bg-green-500 hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(0,255,65,0.5)]"
          >
            {joining ? "INITIALIZING..." : "CREATE ROOM"}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="ENTER ROOM ID"
              className="flex-1 bg-black border border-gray-600 p-3 text-center outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleJoin}
              disabled={joining || !roomIdInput}
              className="px-6 border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all font-bold"
            >
              JOIN
            </button>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-500 font-mono">
          SYSTEM STATUS: ONLINE<br />
          ENCRYPTION: ENABLED<br />
          USER_ID: {user?.id.slice(0, 8)}...
        </div>
      </div>
    </main>
  );
}
