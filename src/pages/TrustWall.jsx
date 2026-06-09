import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Canvas from "@/components/wall/Canvas";
import HeroOverlay from "@/components/wall/HeroOverlay";
import SubmitModal from "@/components/wall/SubmitModal";
import ShareModal from "@/components/wall/ShareModal";
import { useToast } from "@/components/ui/use-toast";

const NOTE_COLORS = ["yellow", "pink", "blue", "green", "orange", "violet", "rose", "cyan", "lime", "amber"];

function getFingerprint() {
  let fp = localStorage.getItem("tw_fp");
  if (!fp) {
    fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("tw_fp", fp);
  }
  return fp;
}

function getUserVotes() {
  const raw = localStorage.getItem("tw_votes");
  return raw ? JSON.parse(raw) : {};
}

function setUserVoteStorage(votes) {
  localStorage.setItem("tw_votes", JSON.stringify(votes));
}

function generatePosition(index, total) {
  // Spiral-ish layout with randomness
  const cols = Math.ceil(Math.sqrt(total * 1.5));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const baseX = col * 260 + (row % 2 === 0 ? 0 : 130);
  const baseY = row * 240;
  const jitterX = (Math.random() - 0.5) * 80;
  const jitterY = (Math.random() - 0.5) * 60;
  return { x: baseX + jitterX, y: baseY + jitterY };
}

export default function TrustWall() {
  const [showSubmit, setShowSubmit] = useState(false);
  const [shareSubmission, setShareSubmission] = useState(null);
  const [userVotes, setUserVotes] = useState(getUserVotes);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => base44.entities.Submission.filter({ status: "approved" }, "-total_score", 200),
    refetchInterval: 15000,
  });

  const { data: allVotes = [] } = useQuery({
    queryKey: ["allVotes"],
    queryFn: () => base44.entities.Vote.list("-created_date", 100),
  });

  // Assign positions to submissions that don't have them
  const positionedSubmissions = useMemo(() => {
    return submissions.map((s, i) => ({
      ...s,
      note_x: s.note_x || generatePosition(i, submissions.length).x,
      note_y: s.note_y || generatePosition(i, submissions.length).y,
      note_rotation: s.note_rotation || (Math.random() - 0.5) * 12,
      note_color: s.note_color || NOTE_COLORS[i % NOTE_COLORS.length],
    }));
  }, [submissions]);

  const stats = useMemo(() => {
    let totalVotes = 0;
    submissions.forEach(s => {
      totalVotes += (s.votes_unhinged || 0) + (s.votes_think || 0) + (s.votes_trust || 0);
    });
    return { answers: submissions.length, votes: totalVotes };
  }, [submissions]);

  const createSubmission = useMutation({
    mutationFn: async (data) => {
      const index = submissions.length;
      const pos = generatePosition(index, submissions.length + 1);
      const newSubmission = {
        ...data,
        status: "approved",
        votes_unhinged: 0,
        votes_think: 0,
        votes_trust: 0,
        total_score: 0,
        rank: 0,
        note_color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        note_rotation: (Math.random() - 0.5) * 12,
        note_x: pos.x,
        note_y: pos.y,
      };
      return base44.entities.Submission.create(newSubmission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setShowSubmit(false);
      toast({
        title: "🎉 You're on the wall!",
        description: "Your answer has been added. Share it to get votes!",
      });
    },
  });

  const handleVote = async (submissionId, category) => {
    const fp = getFingerprint();
    const currentVotes = { ...userVotes };

    if (!currentVotes[submissionId]) currentVotes[submissionId] = [];
    if (currentVotes[submissionId].includes(category)) {
      toast({ title: "Already voted", description: "You already voted in this category for this note." });
      return;
    }

    // Check how many total votes in this category across all notes
    const categoryVoteCount = Object.values(currentVotes).filter(v => v.includes(category)).length;
    if (categoryVoteCount >= 3) {
      toast({ title: "Vote limit reached", description: `You can only cast 3 ${category} votes total.` });
      return;
    }

    currentVotes[submissionId].push(category);
    setUserVotes(currentVotes);
    setUserVoteStorage(currentVotes);

    // Save vote
    await base44.entities.Vote.create({
      submission_id: submissionId,
      category,
      voter_fingerprint: fp,
    });

    // Update submission counts
    const sub = submissions.find(s => s.id === submissionId);
    if (sub) {
      const field = category === "unhinged" ? "votes_unhinged" : category === "think" ? "votes_think" : "votes_trust";
      const newValue = (sub[field] || 0) + 1;
      const newTotal = (sub.total_score || 0) + 1;
      await base44.entities.Submission.update(submissionId, {
        [field]: newValue,
        total_score: newTotal,
      });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    }
  };

  const handleShare = (submission) => {
    setShareSubmission(submission);
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: "#fafafa" }}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-black/10 border-t-black/40 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-foreground/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <Canvas
        submissions={positionedSubmissions}
        onVote={handleVote}
        onShare={handleShare}
        userVotes={userVotes}
      />

      {/* Hero overlay */}
      <HeroOverlay
        onAddAnswer={() => setShowSubmit(true)}
        stats={stats}
      />

      {/* Modals */}
      <SubmitModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmit={(data) => createSubmission.mutate(data)}
      />

      <ShareModal
        submission={shareSubmission}
        isOpen={!!shareSubmission}
        onClose={() => setShareSubmission(null)}
      />
    </div>
  );
}