"use client";
import GlobalApi from "@/app/_utils/IgboCrushApi";
import { useEffect, useState } from "react";
import {
  Loader2, ChevronLeft, ChevronRight, Search,
  Shield, ShieldOff, AlertTriangle, ChevronDown, ChevronUp, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

const PAGE_LIMIT = 20;

const BlockedUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [suspendingId, setSuspendingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expandedReasons, setExpandedReasons] = useState({});

  const fetchUsers = async (currentPage = 1, searchTerm = "") => {
    setIsLoading(true);
    try {
      const res = await GlobalApi.getBlockedUsersReport({
        page: currentPage,
        limit: PAGE_LIMIT,
      });
      const fetched = res.data?.data || [];

      const filtered = searchTerm
        ? fetched.filter(
          (u) =>
            u.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : fetched;

      setUsers(filtered);
      setHasMore(fetched.length === PAGE_LIMIT);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blocked users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleSuspend = async (user) => {
    setSuspendingId(user._id);
    try {
      await GlobalApi.toggleAccountSuspension(user._id);
      const action = user.suspended ? "unsuspended" : "suspended";
      toast.success(`${user.fullname} has been ${action}.`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, suspended: !u.suspended } : u
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update suspension status.");
    } finally {
      setSuspendingId(null);
    }
  };

  const toggleReasons = (userId) => {
    setExpandedReasons((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="min-h-screen bg-[#f9f6f1] px-4 py-10 font-[Georgia,serif]">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <Ban className="w-8 h-8 text-red-700" />
          <div>
            <h1 className="text-4xl font-bold text-[#1a1a1a] tracking-tight">
              Blocked Users Report
            </h1>
            <p className="text-[#888] mt-1 text-sm">
              Users who have been blocked — sorted by most reported first.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto flex gap-2 mb-6">
        <Input
          className="bg-white border-[#ddd] rounded-none shadow-sm focus-visible:ring-[#8b4513]"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          className="bg-[#8b4513] hover:bg-[#7a3a10] text-white rounded-none px-5"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto bg-white border border-[#e5e0d8] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[100px_1.5fr_1fr_100px_110px_120px] bg-[#1a1a1a] text-white text-xs uppercase tracking-widest px-4 py-3 gap-3">
          <span>Photo</span>
          <span>Name</span>
          <span>Email</span>
          <span className="text-center">Blocks</span>
          <span>Account</span>
          <span className="text-right">Action</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20 text-[#888]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading blocked users...</span>
          </div>
        )}

        {/* Empty */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-20 text-[#aaa] text-sm">
            No blocked users found.
          </div>
        )}

        {/* Rows */}
        {!isLoading &&
          users.map((user, i) => {
            const isExpanded = expandedReasons[user._id];
            const reasons = user.reasons || [];

            return (
              <div
                key={user._id}
                className={`border-b border-[#f0ece4] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"
                  } hover:bg-[#f3ede4]`}
              >
                {/* Main Row */}
                <div className="grid grid-cols-[100px_1.5fr_1fr_100px_110px_120px] items-center px-4 py-3 gap-3">

                  {/* Avatar */}
                  <div className="w-[80px] h-[80px] rounded-md overflow-hidden bg-[#e5e0d8] flex items-center justify-center flex-shrink-0">
                    {user.profileImage?.[0]?.url ? (
                      <Image
                        src={user.profileImage[0].url}
                        alt={user.fullname || "user"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[#8b4513] font-bold text-2xl">
                        {user.fullname?.[0] || "?"}
                      </span>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-[#1a1a1a] text-sm">
                      {user.fullname}
                    </p>
                    <p className="text-[#aaa] text-xs">
                      {user.gender} · {user.location?.country || "—"}
                    </p>
                    <p className="text-[#aaa] text-xs">
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </p>

                    {/* Block dates */}
                    {user.firstBlockedAt && (
                      <p className="text-[10px] text-[#bbb]">
                        First blocked: {new Date(user.firstBlockedAt).toLocaleDateString()}
                      </p>
                    )}
                    {user.lastBlockedAt && (
                      <p className="text-[10px] text-[#bbb]">
                        Last blocked: {new Date(user.lastBlockedAt).toLocaleDateString()}
                      </p>
                    )}

                    {/* Reasons toggle */}
                    {reasons.length > 0 && (
                      <button
                        onClick={() => toggleReasons(user._id)}
                        className="flex items-center gap-1 text-red-600 text-xs mt-1 hover:underline w-fit"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {reasons.length} reason{reasons.length > 1 ? "s" : ""}
                        {isExpanded
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />
                        }
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <p className="text-sm text-[#555] truncate">{user.email}</p>

                  {/* Block count */}
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center font-bold text-sm w-10 h-10 rounded-full border-2 ${user.blockCount >= 5
                          ? "bg-red-100 text-red-700 border-red-400"
                          : user.blockCount >= 3
                            ? "bg-orange-100 text-orange-700 border-orange-400"
                            : "bg-yellow-100 text-yellow-700 border-yellow-400"
                        }`}
                    >
                      {user.blockCount}
                    </span>
                  </div>

                  {/* Account Status */}
                  <div>
                    {user.suspended ? (
                      <span className="inline-flex items-center bg-red-100 text-red-700 border border-red-200 text-xs px-2 py-1">
                        <Ban className="w-3 h-3 mr-1" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-1">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={suspendingId === user._id}
                      onClick={() => handleSuspend(user)}
                      className={`rounded-none text-xs px-3 py-1 h-auto ${user.suspended
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-red-700 hover:bg-red-800 text-white"
                        }`}
                    >
                      {suspendingId === user._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : user.suspended ? (
                        <><ShieldOff className="w-3 h-3 mr-1" /> Unsuspend</>
                      ) : (
                        <><Shield className="w-3 h-3 mr-1" /> Suspend</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expandable Reasons Panel */}
                {isExpanded && reasons.length > 0 && (
                  <div className="px-4 pb-4 bg-[#fff5f5] border-t border-red-100">
                    <p className="text-xs uppercase tracking-widest text-red-400 py-2">
                      Block Reasons
                    </p>
                    <div className="flex flex-col gap-2">
                      {reasons.map((reason, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 bg-white border border-red-100 px-3 py-2 text-sm text-[#555]"
                        >
                          <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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

export default BlockedUsersPage;