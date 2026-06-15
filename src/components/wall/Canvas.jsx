import React, { useState, useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import StickyNote from "./StickyNote";
import { Search, Crosshair, ArrowDownWideNarrow } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const Canvas = forwardRef(function Canvas({ submissions, onVote, onShare, userVotes, usedCategories, onAddAnswer, isAuthenticated, onSignIn }, ref) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent"); // "recent" | "votes"
  const [highlighted, setHighlighted] = useState(null);

  // Center canvas initially
  useEffect(() => {
    if (containerRef.current && visibleSubmissions.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      let sumX = 0, sumY = 0;
      visibleSubmissions.forEach(s => {
        sumX += getCx(s);
        sumY += getCy(s);
      });
      const cx = sumX / visibleSubmissions.length;
      const cy = sumY / visibleSubmissions.length;
      setOffset({ x: rect.width / 2 - cx, y: rect.height / 2 - cy });
    }
  }, [visibleSubmissions.length > 0]);

  // Expose focusNote to parent
  useImperativeHandle(ref, () => ({
    focusNote(submissionId) {
      const s = submissions.find(sub => sub.id === submissionId);
      if (!s || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setOffset({ x: rect.width / 2 - getCx(s), y: rect.height / 2 - getCy(s) });
      setHighlighted(submissionId);
      setTimeout(() => setHighlighted(null), 2000);
    }
  }), [submissions, gridMap]);

  const handlePointerDown = useCallback((e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [offset]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  const lastPinchDist = useRef(null);

  const handleWheel = useCallback((e) => {
    // Pan only, no zoom on scroll
    setOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist.current) {
        const ratio = dist / lastPinchDist.current;
        setScale(prev => Math.min(Math.max(prev * ratio, 0.3), 3));
      }
      lastPinchDist.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
  }, []);

  const handleRecenter = useCallback(() => {
    if (!visibleSubmissions.length || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let sumX = 0, sumY = 0;
    visibleSubmissions.forEach(s => { sumX += getCx(s); sumY += getCy(s); });
    const cx = sumX / visibleSubmissions.length;
    const cy = sumY / visibleSubmissions.length;
    setOffset({ x: rect.width / 2 - cx, y: rect.height / 2 - cy });
    setScale(1);
  }, [visibleSubmissions, gridMap]);

  const handleSurprise = useCallback(() => {
    if (!visibleSubmissions.length || !containerRef.current) return;
    const random = visibleSubmissions[Math.floor(Math.random() * visibleSubmissions.length)];
    const rect = containerRef.current.getBoundingClientRect();
    setOffset({
      x: rect.width / 2 - getCx(random),
      y: rect.height / 2 - getCy(random),
    });
    setHighlighted(random.id);
    setTimeout(() => setHighlighted(null), 2000);
  }, [visibleSubmissions, gridMap]);

  const NOTE_W = 212;
  const NOTE_H = 150;
  const GRID_COLS = 5;

  // Filter & sort
  const visibleSubmissions = submissions
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.answer?.toLowerCase().includes(q) ||
        s.alias?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "votes") return (b.total_score || 0) - (a.total_score || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  // Compute grid positions for sorted notes
  const gridMap = useMemo(() => {
    const map = {};
    visibleSubmissions.forEach((s, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      map[s.id] = { x: col * NOTE_W + 40, y: row * NOTE_H + 40 };
    });
    return map;
  }, [visibleSubmissions]);

  const getPos = (s) => gridMap[s.id] || { x: s.note_x || 0, y: s.note_y || 0 };
  const getCx = (s) => (getPos(s).x || 0) + 100;
  const getCy = (s) => (getPos(s).y || 0) + 55;

  // Ticker: latest submission
  const latest = submissions.length > 0
    ? [...submissions].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]
    : null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
        {visibleSubmissions.map((submission) => {
          const pos = gridMap[submission.id];
          const positioned = pos ? { ...submission, note_x: pos.x, note_y: pos.y } : submission;
          return (
            <StickyNote
              key={submission.id}
              submission={positioned}
              onVote={onVote}
              onShare={onShare}
              userVotes={userVotes}
              usedCategories={usedCategories}
              isAuthenticated={isAuthenticated}
              onSignIn={onSignIn}
              highlighted={highlighted === submission.id}
            />
          );
        })}
      </div>

      {/* Top-left: search + sort */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-black/10 rounded-full px-3 py-2 shadow-sm w-56">
          <Search size={13} className="text-foreground/40 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email or answer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-[12px] text-foreground placeholder:text-foreground/35 w-full"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        {/* Sort pills */}
        <div className="flex items-center gap-1">
          {["recent", "votes"].map(opt => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                sort === opt
                  ? "bg-foreground text-background"
                  : "bg-white/80 text-foreground/50 border border-black/10 hover:bg-white"
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {opt === "recent" ? "Recent" : "Most votes"}
            </button>
          ))}
        </div>
      </div>

      {/* Top-right: live stats */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-black/10 rounded-full px-3 py-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          <span className="text-[12px] text-foreground/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <span className="font-semibold text-foreground">{submissions.length}</span> answers
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-black/10 rounded-full px-3 py-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
          <span className="text-[12px] text-foreground/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <span className="font-semibold text-foreground">{submissions.reduce((s, sub) => s + (sub.total_score || 0), 0).toLocaleString()}</span> votes
          </span>
        </div>
      </div>

      {/* Bottom: add button + surprise + leaderboard + sign-in */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {!isAuthenticated && (
          <>
            <button
              onClick={onSignIn}
              className="bg-foreground text-background px-6 py-3 rounded-full text-[13px] font-medium hover:opacity-80 transition-opacity flex items-center gap-2 shadow-lg"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign in with Google
            </button>
            <Link
              to="/login"
              className="bg-white border border-black/10 text-foreground px-5 py-3 rounded-full text-[13px] font-medium hover:bg-black/5 transition-colors shadow-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign in with Email
            </Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <button
              onClick={onAddAnswer}
              className="bg-foreground text-background px-6 py-3 rounded-full text-[13px] font-medium hover:opacity-80 transition-opacity flex items-center gap-2 shadow-lg"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ✏️ Add your answer
            </button>
            <div
              className="px-3 py-1.5 rounded-full text-[11px] bg-white/90 border border-black/10 shadow-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {3 - (usedCategories?.size || 0)} votes left
            </div>
            <button
              onClick={() => base44.auth.logout(window.location.href)}
              className="px-3 py-1.5 rounded-full text-[11px] bg-white/90 border border-black/10 shadow-sm text-foreground/50 hover:text-foreground hover:bg-black/5 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Log out
            </button>
          </>
        )}
        <button
          onClick={handleSurprise}
          title="Surprise me"
          className="w-11 h-11 rounded-full bg-white border border-black/10 shadow-md flex items-center justify-center hover:bg-black/5 transition-colors text-lg"
        >
          ✨
        </button>
        <a
          href="#leaderboard"
          title="Leaderboard"
          className="w-11 h-11 rounded-full bg-white border border-black/10 shadow-md flex items-center justify-center hover:bg-black/5 transition-colors text-lg"
        >
          🏆
        </a>
      </div>

      {/* Bottom ticker */}
      {latest && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          <span className="text-[11px] text-foreground/35 italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            votes rolling in for '{latest.answer?.slice(0, 40)}{latest.answer?.length > 40 ? "…" : ""}'
          </span>
        </div>
      )}

      {/* Floating nav — right side */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleRecenter}
          title="Recenter"
          className="w-9 h-9 rounded-full bg-white/90 border border-black/10 shadow-sm flex items-center justify-center hover:bg-black/5 transition-colors"
        >
          <Crosshair size={14} className="text-foreground/50" />
        </button>
        <button
          onClick={() => setSort(s => s === "recent" ? "votes" : "recent")}
          title={sort === "recent" ? "Switch to Most Votes" : "Switch to Recent"}
          className={`w-9 h-9 rounded-full border shadow-sm flex items-center justify-center transition-colors ${
            sort === "votes" ? "bg-foreground border-foreground text-background" : "bg-white/90 border-black/10 hover:bg-black/5"
          }`}
        >
          <ArrowDownWideNarrow size={13} />
        </button>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <span className="text-[11px] text-foreground/30 italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          drag to explore · pinch to zoom
        </span>
      </div>
    </div>
  );
});

export default Canvas;