import React, { useState, useRef, useCallback, useEffect } from "react";
import StickyNote from "./StickyNote";

export default function Canvas({ submissions, onVote, onShare, userVotes }) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Center canvas initially
  useEffect(() => {
    if (containerRef.current && submissions.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      // Find center of all notes
      let sumX = 0, sumY = 0;
      submissions.forEach(s => {
        sumX += (s.note_x || 0) + 110;
        sumY += (s.note_y || 0) + 80;
      });
      const cx = sumX / submissions.length;
      const cy = sumY / submissions.length;
      setOffset({
        x: rect.width / 2 - cx,
        y: rect.height / 2 - cy,
      });
    }
  }, [submissions.length > 0]);

  const handlePointerDown = useCallback((e) => {
    if (e.target.closest("button")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [offset]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    // Pan vertically/horizontally on scroll, no zoom
    setOffset(prev => ({
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)`,
          backgroundSize: `${32 * scale}px ${32 * scale}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
        }}
      />

      {/* Canvas content */}
      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {submissions.map((submission) => (
          <StickyNote
            key={submission.id}
            submission={submission}
            onVote={onVote}
            onShare={onShare}
            userVotes={userVotes}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
}