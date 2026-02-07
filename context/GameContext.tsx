"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    onSnapshot,
    setDoc,
    addDoc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy,
    arrayUnion,
} from "firebase/firestore";

type Role = "citizen" | "spy" | null;

interface Player {
    id: string;
    role: Role;
    joinedAt: any;
}

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
    delayedUntil?: any; // For random delay logic
}

interface GameState {
    user: { id: string; role: Role } | null;
    room: {
        id: string;
        status: "waiting" | "playing" | "voting";
        players: Player[];
        simultaneousEvent?: { active: boolean; endTime: any };
    } | null;
    messages: Message[];
    joinRoom: (roomId: string) => Promise<void>;
    createRoom: () => Promise<string>;
    sendMessage: (text: string) => Promise<void>;
    triggerSimultaneousEvent: () => Promise<void>;
    startGame: () => Promise<void>;
}

const GameContext = createContext<GameState | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<{ id: string; role: Role } | null>(null);
    const [room, setRoom] = useState<GameState["room"]>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    // Initialize User ID
    useEffect(() => {
        let storedId = localStorage.getItem("rtz_user_id");
        if (!storedId) {
            storedId = crypto.randomUUID();
            localStorage.setItem("rtz_user_id", storedId);
        }
        setUser((prev) => (prev?.id === storedId ? prev : { id: storedId!, role: null }));
    }, []);

    // Use this to listen to room changes
    useEffect(() => {
        if (!room?.id) return;

        const roomRef = doc(db, "rooms", room.id);
        const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setRoom((prev) => ({
                    ...prev!,
                    status: data.status,
                    players: data.players || [],
                    simultaneousEvent: data.simultaneousEvent,
                }));

                // Update user role if assigned
                const myPlayer = data.players?.find((p: Player) => p.id === user?.id);
                if (myPlayer && myPlayer.role !== user?.role) {
                    setUser((prev) => ({ ...prev!, role: myPlayer.role }));
                }
            }
        });

        const messagesRef = collection(db, "rooms", room.id, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];
            setMessages(msgs);
        });

        return () => {
            unsubscribeRoom();
            unsubscribeMessages();
        };
    }, [room?.id, user?.id]); // Added user.id dependency to update role

    const createRoom = async () => {
        if (!user) return "";
        const roomRef = await addDoc(collection(db, "rooms"), {
            status: "waiting",
            players: [{ id: user.id, role: null, joinedAt: serverTimestamp() }],
            createdAt: serverTimestamp(),
        });
        setRoom({ id: roomRef.id, status: "waiting", players: [], simultaneousEvent: undefined }); // Optimistic update
        return roomRef.id;
    };

    const joinRoom = async (roomId: string) => {
        if (!user) return;
        const roomRef = doc(db, "rooms", roomId);
        // Add player to array
        await updateDoc(roomRef, {
            players: arrayUnion({ id: user.id, role: null, joinedAt: new Date() }),
        });
        setRoom({ id: roomId, status: "waiting", players: [], simultaneousEvent: undefined });
    };

    const sendMessage = async (text: string) => {
        if (!user || !room) return;

        // Add random delay logic here (handled by client or server function?)
        // For now, we just send with a client-side wait or standard timestamp.
        // Real implementation of "Random Delay" should be here.

        // Calculate delay (3-8 seconds)
        const delayMs = Math.floor(Math.random() * (8000 - 3000 + 1) + 3000);

        // We can simulate delay by `setTimeout` before sending to Firestore.
        // This runs on the sender's client, so they will see their own message only after delay?
        // Or they see "Sending..."? Ideally, for anonymity, they should hit send, 
        // and it shouldn't appear for ANYONE (including them) until delay is up.

        setTimeout(async () => {
            await addDoc(collection(db, "rooms", room.id, "messages"), {
                text,
                senderId: user.id,
                createdAt: serverTimestamp(),
            });
        }, delayMs);
    };

    const triggerSimultaneousEvent = async () => {
        if (!room) return;
        // Set a flag in the room for event
        await updateDoc(doc(db, "rooms", room.id), {
            simultaneousEvent: { active: true, endTime: new Date(Date.now() + 10000) } // 10s window?
        });
    };

    const startGame = async () => {
        if (!room || !room.players) return;

        // Assign roles: 1 Spy, rest Citizens
        // Simple logic: Shuffle array, first is Spy.
        const players = [...room.players];
        const shuffled = players.sort(() => 0.5 - Math.random());

        const updatedPlayers = players.map(p => ({
            ...p,
            role: p.id === shuffled[0].id ? "spy" : "citizen"
        })) as Player[];

        await updateDoc(doc(db, "rooms", room.id), {
            status: "playing",
            players: updatedPlayers
        });
    };

    return (
        <GameContext.Provider value={{ user, room, messages, joinRoom, createRoom, sendMessage, triggerSimultaneousEvent, startGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within GameProvider");
    return context;
};
