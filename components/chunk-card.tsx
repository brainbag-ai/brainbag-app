"use client";

import { FileIcon, ChatIcon } from "./icons";

export function ChunkCard({ chunk, index }: { chunk: any; index: number }) {
  // Calculate a color based on similarity score (green for high, yellow for medium, red for low)
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const scoreColor = getScoreColor(chunk.similarity);
  
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {chunk.source === 'file' ? (
            <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <ChatIcon className="h-4 w-4 mr-2 text-purple-500" />
          )}
          <span className="text-xs font-medium text-white">
            {chunk.source === 'file' 
              ? `File: ${chunk.filePath?.split('/').pop()}` 
              : 'Chat History'}
          </span>
        </div>
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${scoreColor} mr-1`}></div>
          <span className="text-xs text-white">{(chunk.similarity * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="text-sm text-white max-h-48 overflow-y-auto">
        {chunk.content}
      </div>
    </div>
  );
}
