"use client";

import React, { useState } from "react";
import CustomButton from "./components/CustomButton";
import InputField from "./components/InputField";
import Card from "./components/Card";

type ChatMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Zdravo! Ja sam travel chatbot. Postavi mi pitanje o putovanjima. ✈️",
    },
  ]);

  const [currentQuestion, setCurrentQuestion] = useState("");

  const handleAsk = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentQuestion.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      from: "user",
      text: currentQuestion,
    };

    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      from: "bot",
      text:
        "Ovo će kasnije pozivati backend /api/chat/ask. Ti si pitao: " +
        currentQuestion,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setCurrentQuestion("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* HEADER + NAV */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Travel Chatbot</h1>
          <nav className="space-x-4 text-sm">
            <a href="/" className="font-semibold underline">
              Chat
            </a>
            <a href="/destinacija" className="hover:underline">
              Destinacije
            </a>
            <a href="/admin" className="hover:underline">
              Admin
            </a>
            <a href="/login" className="hover:underline">
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Card title="Chat sa chatbotom">
          <div className="h-64 overflow-y-auto border border-slate-200 rounded p-3 bg-slate-50 mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    msg.from === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2">
            <InputField
              label="Pitanje"
              hideLabel
              placeholder="Postavi pitanje o putovanjima..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
            />
            <CustomButton type="submit" label="Pošalji" />
          </form>
        </Card>
      </main>
    </div>
  );
}
