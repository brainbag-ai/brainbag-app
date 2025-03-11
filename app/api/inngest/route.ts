import { Inngest } from "inngest";
import { serve } from "inngest/next";
import { helloWorld } from "../../../inngest/functions";

// Create a client with your API key
export const inngest = new Inngest({ id: "brainbag-app" });


// Create the API endpoint for Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- This is where you'll always add all your functions
  ],
});