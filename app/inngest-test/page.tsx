"use client";

import Link from 'next/link';

export default function InngestTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Inngest Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Hello World Function</h2>
          <p className="mb-4">
            This will trigger the &quot;test/hello.world&quot; event and execute the helloWorld function.
          </p>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <button
                onClick={async () => {
                  const email = (document.getElementById('email') as HTMLInputElement).value || 'test@example.com';
                  const response = await fetch(`/api/test-inngest?email=${encodeURIComponent(email)}`);
                  const data = await response.json();
                  alert(`Event sent! Event ID: ${data.eventId}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Trigger Hello World
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Process Data Function</h2>
          <p className="mb-4">
            This will trigger the &quot;data/process&quot; event and execute the processData function.
          </p>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="text"
                id="value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="test-data"
              />
            </div>
            <div>
              <button
                onClick={async () => {
                  const value = (document.getElementById('value') as HTMLInputElement).value || 'test-data';
                  const response = await fetch(`/api/test-process-data?value=${encodeURIComponent(value)}`);
                  const data = await response.json();
                  alert(`Event sent! Event ID: ${data.eventId}`);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Trigger Process Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Inngest Dev Setup</h2>
        <p className="mb-4">
          To see the Inngest functions in action, you need to run the Inngest dev server alongside your Next.js app.
        </p>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="whitespace-pre-wrap">
            <code>
              # Install Inngest CLI (if not already installed)
              npm install -g inngest-cli

              # In one terminal, run your Next.js app
              npm run dev

              # In another terminal, run the Inngest dev server
              npx inngest-cli@latest dev
            </code>
          </pre>
        </div>
        <p className="mt-4">
          The Inngest dev server will open a dashboard at <a href="http://localhost:8288" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://localhost:8288</a> where you can see your events and function executions.
        </p>
      </div>
    </div>
  );
}
