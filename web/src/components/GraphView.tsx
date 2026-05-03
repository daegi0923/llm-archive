"use client";

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Client-side only import for force graph
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function GraphView() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/v1/conversations/graph`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch graph data", err);
      }
    };

    fetchGraph();

    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-zinc-950">
      <ForceGraph2D
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="name"
        nodeColor={() => "#3b82f6"}
        linkColor={() => "#333"}
        onNodeClick={(node: any) => {
          router.push(`/conversation/${node.id}`);
        }}
        backgroundColor="#09090b"
      />
    </div>
  );
}
