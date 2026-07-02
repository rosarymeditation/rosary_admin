"use client";
import GlobalApi from "@/app/_utils/IgboCrushApi";
import { useEffect, useState } from "react";
import {
  Loader2, Ban, CheckCircle2, ChevronLeft, ChevronRight,
  Search, Shield, ShieldOff, ChevronDown, ChevronUp, Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

const PAGE_LIMIT = 20;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [suspendingId, setSuspendingId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedIps, setExpandedIps] = useState({});

  const fetchUsers = async (currentPage = 1, searchTerm = "") => {
    setIsLoading(true);
    try {
      const res = await GlobalApi.getTimeline({
        page: currentPage,
        limit: PAGE_LIMIT,
        age_min: 18,
        age_max: 90,
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
      toast.error("Failed to load users.");
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

  const toggleIps = (userId) => {
    setExpandedIps((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="min-h-screen bg-[#f9f6f1] px-4 py-10 font-[Georgia,serif]">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-[#1a1a1a] tracking-tight">
          User Management
        </h1>
        <p className="text-[#888] mt-1 text-sm">
          Manage, review, and moderate your community members.
        </p>
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

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1fr_1fr_130px_130px] bg-[#1a1a1a] text-white text-xs uppercase tracking-widest px-4 py-3">
          <span>Photo</span>
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20 text-[#888]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading users...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-20 text-[#aaa] text-sm">
            No users found.
          </div>
        )}

        {/* User Rows */}
        {!isLoading &&
          users.map((user, i) => {
            const ipList = (user.ipLogs || []).slice(0, 10);
            const isExpanded = expandedIps[user._id];

            const uniqueCities = [
              ...new Set(
                (user.ipLogs || [])
                  .map((log) =>
                    [log.city, log.country].filter(Boolean).join(", ")
                  )
                  .filter(Boolean)
              ),
            ];

            return (
              <div
                key={user._id}
                className={`border-b border-[#f0ece4] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"
                  } hover:bg-[#f3ede4]`}
              >
                {/* Main Row */}
                <div className="grid grid-cols-[1fr_1fr_1fr_130px_130px] items-start px-4 py-3 gap-3">

                  {/* Photos — flex-wrap so all images are visible */}
                  <div className="flex flex-wrap gap-1.5">
                    {user.profileImage?.length > 0 ? (
                      user.profileImage.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-[60px] h-[60px] flex-shrink-0 rounded-md overflow-hidden bg-[#e5e0d8] border border-[#ddd] hover:scale-[1.03] transition"
                        >
                          <Image
                            src={img.url}
                            alt={`${user.fullname} photo ${idx + 1}`}
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-[60px] h-[60px] flex-shrink-0 rounded-md bg-[#e5e0d8] flex items-center justify-center border border-[#ddd]">
                        <span className="text-[#8b4513] font-bold text-xl">
                          {user.fullname?.[0] || "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name + Meta */}
                  <div className="flex flex-col gap-1 pt-1">
                    <p className="font-semibold text-[#1a1a1a] text-sm">
                      {user.fullname}
                    </p>
                    <p className="text-[#aaa] text-xs">
                      {user.gender} · {user.location?.country || "—"}
                    </p>
                    {uniqueCities.length > 0 && (
                      <p className="text-xs text-[#888] leading-relaxed">
                        📍 {uniqueCities.join(" · ")}
                      </p>
                    )}
                    <button
                      onClick={() => toggleIps(user._id)}
                      className="flex items-center gap-1 text-[#8b4513] text-xs mt-1 hover:underline w-fit"
                    >
                      <Wifi className="w-3 h-3" />
                      {ipList.length > 0
                        ? `${ipList.length} IP address${ipList.length > 1 ? "es" : ""}`
                        : "No IPs logged"}
                      {ipList.length > 0 &&
                        (isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </button>
                  </div>

                  {/* Email */}
                  <p className="text-sm text-[#555] truncate pt-1">{user.email}</p>

                  {/* Status */}
                  <div className="pt-1">
                    {user.suspended ? (
                      <span className="inline-flex items-center bg-red-100 text-red-700 border border-red-200 text-xs px-2 py-1">
                        <Ban className="w-3 h-3 mr-1" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end pt-1">
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
                        <>
                          <ShieldOff className="w-3 h-3 mr-1" /> Unsuspend
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 mr-1" /> Suspend
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* IP Expandable Panel */}
                {isExpanded && ipList.length > 0 && (
                  <div className="px-4 pb-4 bg-[#f5f0e8] border-t border-[#e5e0d8]">
                    <p className="text-xs uppercase tracking-widest text-[#888] py-2">
                      IP Addresses (last {ipList.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {ipList.map((ip, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-[#ddd] text-[#333] text-xs px-3 py-1.5 font-mono"
                        >
                          {ip.ipAddress}
                          {(ip.city || ip.country) && (
                            <span className="text-[#aaa] ml-1">
                              · {[ip.city, ip.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </span>
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

export default UsersPage;