"use client";
import { useState } from "react";

export default function BossKey() {
    const [isActive, setIsActive] = useState(false);

    if (isActive) {
        return (
            <div
                className="fixed inset-0 z-50 bg-white text-black p-4 font-sans cursor-pointer"
                onClick={() => setIsActive(false)}
            >
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Notes</h2>
                <div className="space-y-2 text-gray-600">
                    <p>Meeting Agenda:</p>
                    <ul className="list-disc pl-5">
                        <li>Review Q3 objectives</li>
                        <li>budget allocation discussion</li>
                        <li>Team building event planning</li>
                    </ul>
                    <p className="mt-8 text-sm text-gray-400">Last edited: Today at 10:45 AM</p>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsActive(true)}
            className="fixed bottom-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg border-2 border-red-400 opacity-50 hover:opacity-100 transition-opacity"
            title="Emergency Hide"
        >
            ⚠️
        </button>
    );
}
