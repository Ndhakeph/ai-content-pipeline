export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Content Pipeline
        </h1>
        <p className="text-center text-lg mb-4">
          Welcome to your AI-powered content generation system
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Get Started</h2>
            <p className="text-gray-600">
              Begin creating AI-generated content with powerful tools and workflows.
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <p className="text-gray-600">
              Explore advanced content generation, customization, and automation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
