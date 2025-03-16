"use client";

import { useState, useEffect } from "react";
import { Message } from "ai";
import { RagChunk, RagMetadata, MessageWithRag } from "./use-chat-with-rag";

/**
 * Custom hook for Inngest chat
 * This hook provides similar functionality to the useChat hook but uses Inngest for processing
 */
export function useInngestChat(options: {
  body: { id: string; selectedFilePathnames: string[]; sessionId: string; useInngest?: boolean };
  initialMessages: Message[];
  onFinish?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(options.initialMessages || []);
  const [messagesWithRag, setMessagesWithRag] = useState<MessageWithRag[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  // Poll for results if we have an eventId
  useEffect(() => {
    if (!eventId || isProcessingResponse) return;
    
    const pollInterval = setInterval(async () => {
      if (isProcessingResponse) {
        clearInterval(pollInterval);
        return;
      }
      
      try {
        setIsProcessingResponse(true);
        console.log("Polling for results with eventId:", eventId);
        
        const response = await fetch(`/api/chat/inngest/poll?eventId=${eventId}`);
        const data = await response.json();
        
        if (data.completed) {
          clearInterval(pollInterval);
          setEventId(null);
          
          console.log("Received completed response:", data.response);
          
          // Add assistant message to the list
          const assistantMessage: MessageWithRag = {
            role: "assistant",
            content: data.response,
            id: Date.now().toString(),
          };
          
          setMessages((prev) => [...prev, assistantMessage]);
          setMessagesWithRag((prev) => [...prev, assistantMessage]);
          
          // Call onFinish callback if provided
          if (options.onFinish) {
            options.onFinish();
          }
          
          setIsLoading(false);
        } else {
          console.log("Response not completed yet, continuing to poll");
        }
        
        setIsProcessingResponse(false);
      } catch (error) {
        console.error("Error polling for results:", error);
        setIsProcessingResponse(false);
      }
    }, 2000); // Increased polling interval to 2 seconds
    
    return () => {
      clearInterval(pollInterval);
      setIsProcessingResponse(false);
    };
  }, [eventId, options.onFinish, isProcessingResponse]);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to the list
    const userMessage: Message = { role: "user", content: input, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input
    setInput("");
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send event to the chat API with the useInngest flag
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          selectedFilePathnames: options.body.selectedFilePathnames,
          sessionId: options.body.sessionId,
          id: options.body.id,
          useInngest: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      const data = await response.json();
      setEventId(data.eventId);
      
      // Note: We don't add the assistant message here
      // It will be added when polling completes
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      // Handle error (e.g., add error message to chat)
    }
  };

  // Function to append a message programmatically
  const append = async (message: Message) => {
    setMessages((prev) => [...prev, message]);
    
    // If it's a user message, trigger a response
    if (message.role === "user") {
      // Similar logic to handleSubmit but without form event
      setIsLoading(true);
      
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, message],
            selectedFilePathnames: options.body.selectedFilePathnames,
            sessionId: options.body.sessionId,
            id: options.body.id,
            useInngest: true,
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        
        const data = await response.json();
        setEventId(data.eventId);
      } catch (error) {
        console.error("Error sending message:", error);
        setIsLoading(false);
      }
    }
  };

  return {
    messages,
    messagesWithRag,
    input,
    setInput,
    handleSubmit,
    isLoading,
    append,
  };
}