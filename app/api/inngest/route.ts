import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld, processData, handleChat } from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- This is where you'll always add all your functions
    processData, // Added the processData function
    handleChat, // Added the handleChat function for AI-Kit POC
  ],
});
