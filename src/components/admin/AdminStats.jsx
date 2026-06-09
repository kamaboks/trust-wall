import React from "react";
import { MessageCircle, Zap, Trophy, Clock, ShieldCheck, ShieldOff } from "lucide-react";

export default function AdminStats({ submissions }) {
  const approved = submissions.filter(s => s.status === "approved").length;
  const pending = submissions.filter(s => s.status === "pending").length;
  const hidden = submissions.filter(s => s.status === "hidden" || s.status === "removed").length;
  const totalVotes = submissions.reduce((sum, s) => 
    sum + (s.votes_unhinged || 0) + (s.votes_think || 0) + (s.votes_trust || 0), 0
  );
  const topSubmission = submissions.length > 0 
    ? submissions.reduce((best, s) => (s.total_score || 0) > (best.total_score || 0) ? s : best, submissions[0])
    : null;

  const cards = [
    { icon: MessageCircle, label: "Total Submissions", value: submissions.length, color: "text-primary" },
    { icon: ShieldCheck, label: "Approved", value: approved, color: "text-emerald-400" },
    { icon: Clock, label: "Pending", value: pending, color: "text-amber-400" },
    { icon: ShieldOff, label: "Hidden/Removed", value: hidden, color: "text-destructive" },
    { icon: Zap, label: "Total Votes", value: totalVotes, color: "text-accent" },
    { icon: Trophy, label: "Top Score", value: topSubmission?.total_score || 0, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-card border border-border rounded-xl p-4">
          <Icon size={18} className={`${color} mb-2`} />
          <p className="text-2xl font-display font-bold text-foreground">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground font-body mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}