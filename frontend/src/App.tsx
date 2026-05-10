
import { useState } from "react";
import { motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { VideoFeed } from "./components/VideoFeed/VideoFeed";
import { ROIPanel } from "./components/ROIPanel/ROIPanel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col min-h-screen bg-background text-text-primary"
      >
        <Header />

        {}
        <button
          className="md:hidden fixed bottom-4 left-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-surface-elevated border border-border shadow-lg text-text-primary"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex flex-1 min-h-0">
          <Sidebar isMobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
              <div className="flex-1 min-w-0">
                <VideoFeed />
              </div>
              <div className="w-full lg:w-auto">
                <ROIPanel />
              </div>
            </div>
          </main>
        </div>
      </motion.div>
    </QueryClientProvider>
  );
}