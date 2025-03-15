"use client";

import { useState } from "react";
import { ChunkCard } from "./chunk-card";
import { motion, AnimatePresence } from "framer-motion";

export function RagVisualizer({ 
  chunks, 
  isVisible, 
  toggleVisibility 
}: { 
  chunks: any[] | null; 
  isVisible: boolean; 
  toggleVisibility: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 overflow-y-auto p-4 shadow-lg z-50"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">RAG Context</h3>
            <button 
              onClick={toggleVisibility}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </div>
          
          {chunks && chunks.length > 0 ? (
            <div className="space-y-3">
              {chunks.map((chunk, index) => (
                <ChunkCard key={index} chunk={chunk} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 dark:text-zinc-400 text-center py-8">
              No RAG data available for this response.
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
