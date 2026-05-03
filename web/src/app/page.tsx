"use client";

import GraphView from '@/components/GraphView';

export default function Home() {
  return (
    <div className="flex-1 relative overflow-hidden bg-zinc-950">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl font-black text-white/20 uppercase tracking-tighter select-none">
          Knowledge<br/>Graph
        </h1>
      </div>
      <GraphView />
    </div>
  );
}
