"use client";

import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: input.trim() },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: ["https://example.com"], // Replace with actual URLs if needed
          messages: chatHistory.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An unexpected error occurred.");
      }

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.aiResponse },
      ]);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Welcome Message */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to AI Chat!</h1>
        <p className="text-gray-600">
          Start a conversation with our AI-powered assistant. Ask anything!
        </p>
      </div>

      {/* Chat Box */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4">
        <div
          className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg"
          style={{ maxHeight: "300px" }}
        >
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-md ${
                message.role === "user"
                  ? "bg-blue-100 text-blue-800 self-end"
                  : "bg-gray-100 text-gray-800 self-start"
              }`}
            >
              <strong>{message.role === "user" ? "You" : "Assistant"}:</strong>{" "}
              {message.content}
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
