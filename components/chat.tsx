"use client";

import { Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { Files } from "@/components/files";
import { AnimatePresence, motion } from "framer-motion";
import { FileIcon, InfoIcon } from "@/components/icons";
import { Message as PreviewMessage } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { generateSessionId, SESSION_ID_KEY } from "@/utils/constants";
import { RagVisualizer } from "@/components/rag-visualizer";

const suggestedActions = [
  {
    title: "What's the summary",
    label: "of these documents?",
    action: "what's the summary of these documents?",
  },
  {
    title: "Who is the author",
    label: "of these documents?",
    action: "who is the author of these documents?",
  },
];

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  // State to store the session ID
  const [sessionId, setSessionId] = useState<string>("");
  
  const [selectedFilePathnames, setSelectedFilePathnames] = useState<
    Array<string>
  >([]);
  const [isFilesVisible, setIsFilesVisible] = useState(false);
  const [isRagVisible, setIsRagVisible] = useState(false);
  const [currentRagData, setCurrentRagData] = useState<any[] | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize or retrieve the session ID when the component mounts
  useEffect(() => {
    let storedSessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Save selected file pathnames to localStorage
  useEffect(() => {
    if (isMounted !== false && sessionId) {
      localStorage.setItem(
        `${sessionId}/selected-file-pathnames`,
        JSON.stringify(selectedFilePathnames),
      );
    }
  }, [selectedFilePathnames, isMounted, sessionId]);

  // Load selected file pathnames from localStorage when session ID changes
  useEffect(() => {
    if (sessionId) {
      setSelectedFilePathnames(
        JSON.parse(
          localStorage.getItem(
            `${sessionId}/selected-file-pathnames`,
          ) || "[]",
        ),
      );
    }
  }, [sessionId]);

  const { messages, handleSubmit, input, setInput, append } = useChat({
    body: { id, selectedFilePathnames, sessionId },
    initialMessages,
    onFinish: () => {
      window.history.replaceState({}, "", `/${id}`);
    },
  });
  
  // Monitor messages for new assistant responses and generate mock RAG data
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      // Create mock RAG data for demonstration
      const mockRagData = [
        {
          content: "This is a sample chunk from a document that was used to answer the question.",
          similarity: 0.92,
          source: 'file',
          filePath: 'sample-document.pdf',
          id: 'doc-1'
        },
        {
          content: "Here's another relevant chunk from the document with additional context.",
          similarity: 0.85,
          source: 'file',
          filePath: 'sample-document.pdf',
          id: 'doc-2'
        },
        {
          content: "This chunk comes from a previous conversation in the chat history.",
          similarity: 0.78,
          source: 'chat',
          id: 'chat-1'
        },
        {
          content: "This is a less relevant chunk but still provided some context.",
          similarity: 0.65,
          source: 'file',
          filePath: 'another-document.txt',
          id: 'doc-3'
        },
        {
          content: "This chunk had minimal relevance but was included in the top results.",
          similarity: 0.52,
          source: 'chat',
          id: 'chat-2'
        }
      ];
      
      setCurrentRagData(mockRagData);
    }
  }, [messages]);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.map((message, index) => (
            <PreviewMessage
              key={`${id}-${index}`}
              role={message.role}
              content={message.content}
            />
          ))}
          <div
            ref={messagesEndRef}
            className="flex-shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {messages.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[500px]">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <form
          className="flex flex-row gap-2 relative items-center w-full md:max-w-[500px] max-w-[calc(100dvw-32px)] px-4 md:px-0"
          onSubmit={handleSubmit}
        >
          <input
            className="bg-zinc-100 rounded-md px-2 py-1.5 flex-1 outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300"
            placeholder="Send a message..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
          />

          <div
            className="relative text-sm bg-zinc-100 rounded-lg size-9 flex-shrink-0 flex flex-row items-center justify-center cursor-pointer hover:bg-zinc-200 dark:text-zinc-50 dark:bg-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => {
              setIsFilesVisible(!isFilesVisible);
            }}
          >
            <FileIcon />
            <motion.div
              className="absolute text-xs -top-2 -right-2 bg-blue-500 size-5 rounded-full flex flex-row justify-center items-center border-2 dark:border-zinc-900 border-white text-blue-50"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {selectedFilePathnames?.length}
            </motion.div>
          </div>
          
          {/* Add RAG visualization toggle button */}
          {currentRagData && (
            <div
              className="relative text-sm bg-zinc-100 rounded-lg size-9 flex-shrink-0 flex flex-row items-center justify-center cursor-pointer hover:bg-zinc-200 dark:text-zinc-50 dark:bg-zinc-700 dark:hover:bg-zinc-800"
              onClick={() => setIsRagVisible(!isRagVisible)}
              title="Show RAG context"
            >
              <InfoIcon />
            </div>
          )}
        </form>
      </div>

      <AnimatePresence>
        {isFilesVisible && (
          <Files
            setIsFilesVisible={setIsFilesVisible}
            selectedFilePathnames={selectedFilePathnames}
            setSelectedFilePathnames={setSelectedFilePathnames}
          />
        )}
      </AnimatePresence>
      
      {/* Add RAG visualizer component */}
      <RagVisualizer 
        chunks={currentRagData} 
        isVisible={isRagVisible} 
        toggleVisibility={() => setIsRagVisible(false)} 
      />
    </div>
  );
}
