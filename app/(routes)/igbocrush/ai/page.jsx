"use client";
// ════════════════════════════════════════════════════════════════════════════
// Chat Helper (✨ AI) usage — who tried it and how many times
// Data: POST aiSuggestStats (backend controllers/ai_suggest.js → stats)
// ════════════════════════════════════════════════════════════════════════════
import GlobalApi from "@/app/_utils/IgboCrushApi";
import { useEffect, useState } from "react";
import {
    Loader2, ChevronLeft, ChevronRight, Sparkles, Users, Coins,
    CalendarCheck, Crown, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

const PAGE_LIMIT = 50;

// Columns: User · Email · Uses · Tokens · First used · Last used
const GRID = "grid grid-cols-[1.4fr_1.4fr_80px_90px_1fr_1fr]";

/** "26 Oct 2026, 14:05" — or "—" if empty */
const formatDate = (d) =>
    d
        ? new Date(d).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

/** "3h ago", "2d ago" — quick sense of how recent */
const timeAgo = (d) => {
    if (!d) return "";
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

/** One summary card at the top */
const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white border border-[#e5e0d8] shadow-sm px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-[#f5f0e8] text-[#8b4513]">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-2xl font-bold text-[#1a1a1a] leading-none">{value}</p>
            <p className="text-xs text-[#888] mt-1 uppercase tracking-widest">{label}</p>
        </div>
    </div>
);

const AiUsagePage = () => {
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStats = async (currentPage = 1) => {
        setIsLoading(true);
        try {
            const res = await GlobalApi.getAiUsageStats({
                page: currentPage,
                limit: PAGE_LIMIT,
            });
            setRows(res.data?.data || []);
            setSummary(res.data?.summary || null);
            setHasMore(res.data?.hasMore === true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load AI usage.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(page);
    }, [page]);

    return (
        <div className="min-h-screen bg-[#f9f6f1] px-4 py-10 font-[Georgia,serif]">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-[#1a1a1a] tracking-tight flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-[#c2410c]" /> Chat Helper Usage
                    </h1>
                    <p className="text-[#888] mt-1 text-sm">
                        Members who used ✨ AI message ideas, most uses first.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => fetchStats(page)}
                    className="rounded-none border-[#ccc] text-[#555] hover:bg-[#f3ede4]"
                >
                    <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                </Button>
            </div>

            {/* Summary */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard icon={Users} label="Members tried it" value={summary?.users ?? "—"} />
                <StatCard icon={Sparkles} label="Total uses" value={summary?.taps ?? "—"} />
                <StatCard icon={Coins} label="Tokens spent" value={summary?.tokensSpent ?? "—"} />
                <StatCard icon={CalendarCheck} label="Used today" value={summary?.usedToday ?? "—"} />
            </div>

            {/* Table */}
            <div className="max-w-6xl mx-auto bg-white border border-[#e5e0d8] shadow-sm overflow-hidden">
                <div className={`${GRID} bg-[#1a1a1a] text-white text-xs uppercase tracking-widest px-4 py-3 gap-3`}>
                    <span>Member</span>
                    <span>Email</span>
                    <span className="text-right">Uses</span>
                    <span className="text-right">Tokens</span>
                    <span>First used</span>
                    <span>Last used</span>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center py-20 text-[#888]">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-sm">Loading usage...</span>
                    </div>
                )}

                {!isLoading && rows.length === 0 && (
                    <div className="text-center py-20 text-[#aaa] text-sm">
                        Nobody has used Chat Helper yet.
                    </div>
                )}

                {!isLoading &&
                    rows.map((u, i) => (
                        <div
                            key={u._id}
                            className={`${GRID} items-center px-4 py-3 gap-3 border-b border-[#f0ece4] ${i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"
                                } hover:bg-[#f3ede4]`}
                        >
                            {/* Member */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-[#e5e0d8] border border-[#ddd] flex items-center justify-center">
                                    {u.photo ? (
                                        <Image src={u.photo} alt={u.fullname || ""} fill sizes="40px" className="object-cover" />
                                    ) : (
                                        <span className="text-[#8b4513] font-bold">{u.fullname?.[0] || "?"}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-[#1a1a1a] truncate">{u.fullname}</p>
                                    <p className="text-xs text-[#aaa] flex items-center gap-1">
                                        {u.gender}
                                        {u.isPremium && (
                                            <span className="inline-flex items-center text-amber-700">
                                                · <Crown className="w-3 h-3 mx-0.5" /> Premium
                                            </span>
                                        )}
                                        <span>· {u.tokens} tokens left</span>
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <p className="text-sm text-[#555] truncate">{u.email}</p>

                            {/* Uses */}
                            <p className="text-right font-bold text-[#1a1a1a]">{u.total}</p>

                            {/* Tokens spent */}
                            <p className="text-right text-sm text-[#8b4513]">{u.tokensSpent}</p>

                            {/* First used */}
                            <p className="text-xs text-[#555]">{formatDate(u.firstUsedAt)}</p>

                            {/* Last used */}
                            <p className="text-xs text-[#555]">
                                {formatDate(u.lastUsedAt)}
                                <span className="block text-[#aaa]">{timeAgo(u.lastUsedAt)}</span>
                            </p>
                        </div>
                    ))}
            </div>

            {/* Pagination */}
            {!isLoading && (
                <div className="max-w-6xl mx-auto flex justify-between items-center mt-6">
                    <p className="text-xs text-[#aaa]">Page {page}</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="rounded-none border-[#ccc] text-[#555] hover:bg-[#f3ede4]"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!hasMore}
                            onClick={() => setPage((p) => p + 1)}
                            className="rounded-none border-[#ccc] text-[#555] hover:bg-[#f3ede4]"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiUsagePage;