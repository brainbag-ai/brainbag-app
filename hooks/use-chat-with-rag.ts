"use client";

import { useChat as useVercelChat, type Message } from "ai/react";
import { useEffect, useState } from "react";

// Define the RAG metadata type
export interface RagChunk {
  content: string;
  similarity: number;
  source: 'file' | 'chat';
  filePath?: string;
  id: string;
}

export interface RagMetadata {
  chunks: RagChunk[];
}

// Extend the Message type to include RAG metadata
export interface MessageWithRag extends Message {
  ragMetadata?: RagMetadata;
}

// Define the content part type for Vercel AI SDK messages
interface ContentPart {
  type: string;
  text: string;
}

// Function to extract RAG chunks from user message content
const extractRagChunksFromMessage = (message: Message): RagChunk[] | null => {
  // Check if the message is a user message
  if (message.role !== 'user') return null;
  
  // In the Vercel AI SDK, message content can be a string or an array of content parts
  const content = message.content;
  
  // Debug: Log the message content type
  console.log('Message content type:', typeof content);
  
  // If content is a string, we can use it directly as a single chunk
  if (typeof content === 'string') {
    console.log('Message content is a string, using as a single chunk');
    
    // Create a single chunk with the entire content
    return [{
      content: content,
      similarity: 0.9, // High similarity since it's the exact content
      source: 'chat',
      id: 'content-string'
    }];
  }
  
  // Cast content to array of ContentPart
  const contentParts = content as ContentPart[];
  
  // Debug: Log the content parts
  console.log('Content parts:', JSON.stringify(contentParts.slice(0, 2)));
  
  // If it's not an array or empty, return null
  if (!Array.isArray(contentParts) || contentParts.length === 0) {
    console.log('Content parts is not an array or is empty');
    return null;
  }
  
  // Look for the RAG information marker
  const ragMarkerIndex = contentParts.findIndex(
    part => part.type === 'text' && 
    typeof part.text === 'string' && 
    part.text.includes('Here is some relevant information that you can use to answer the question:')
  );
  
  // Debug: Log if we found the marker
  console.log('RAG marker index:', ragMarkerIndex);
  
  // If we found the marker, extract the chunks that follow it
  if (ragMarkerIndex !== -1) {
    const chunks: RagChunk[] = [];
    
    // Process each content part after the marker
    for (let i = ragMarkerIndex + 1; i < contentParts.length; i++) {
      const part = contentParts[i];
      if (part.type === 'text' && typeof part.text === 'string') {
        // Debug: Log each chunk text
        console.log('Found chunk text:', part.text.substring(0, 50) + '...');
        
        // For each chunk, create a RagChunk object
        // We'll use some heuristics to determine if it's from a file or chat
        const isFile = part.text.includes('File:') || part.text.includes('.pdf') || 
                      part.text.includes('.txt') || part.text.includes('.md');
        
        chunks.push({
          content: part.text,
          similarity: 0.8, // We don't have the actual similarity score, so use a default
          source: isFile ? 'file' : 'chat',
          filePath: isFile ? 'document.pdf' : undefined, // We don't have the actual file path
          id: `chunk-${i}`
        });
      }
    }
    
    // Debug: Log the number of chunks found
    console.log('Total chunks found:', chunks.length);
    
    return chunks.length > 0 ? chunks : null;
  }
  
  // If we didn't find the marker but content is an array, use all text parts as chunks
  const chunks: RagChunk[] = [];
  
  for (let i = 0; i < contentParts.length; i++) {
    const part = contentParts[i];
    if (part.type === 'text' && typeof part.text === 'string') {
      // Debug: Log each chunk text
      console.log('Using content part as chunk:', part.text.substring(0, 50) + '...');
      
      // For each chunk, create a RagChunk object
      // We'll use some heuristics to determine if it's from a file or chat
      const isFile = part.text.includes('File:') || part.text.includes('.pdf') || 
                    part.text.includes('.txt') || part.text.includes('.md');
      
      chunks.push({
        content: part.text,
        similarity: 0.7, // Lower similarity since we're not sure if it's relevant
        source: isFile ? 'file' : 'chat',
        filePath: isFile ? 'document.pdf' : undefined, // We don't have the actual file path
        id: `content-${i}`
      });
    }
  }
  
  // Debug: Log the number of chunks found
  console.log('Total content parts used as chunks:', chunks.length);
  
  return chunks.length > 0 ? chunks : null;
};

// Custom hook that extends useChat to include RAG metadata
export function useChat(options: Parameters<typeof useVercelChat>[0]) {
  // Use the original useChat hook
  const chatResult = useVercelChat(options);
  
  // Add state for RAG metadata
  const [messagesWithRag, setMessagesWithRag] = useState<MessageWithRag[]>([]);
  
  // Update messagesWithRag when messages change
  useEffect(() => {
    // Process all messages to find RAG data
    const newMessagesWithRag = chatResult.messages.map((message, index) => {
      // For assistant messages, check if there's a preceding user message with RAG chunks
      if (message.role === 'assistant' && index > 0) {
        const prevMessage = chatResult.messages[index - 1];
        const chunks = extractRagChunksFromMessage(prevMessage);
        
        if (chunks) {
          console.log('Found RAG chunks in user message:', chunks.length);
          return {
            ...message,
            ragMetadata: {
              chunks: chunks
            }
          } as MessageWithRag;
        }
      }
      
      return message as MessageWithRag;
    });
    
    setMessagesWithRag(newMessagesWithRag);
  }, [chatResult.messages]);
  
  // Return the original chat result with the extended messages
  return {
    ...chatResult,
    messagesWithRag
  };
}
