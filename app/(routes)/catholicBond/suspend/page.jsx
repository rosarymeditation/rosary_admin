"use client";
import GlobalApi from "@/app/_utils/CatholicApi";
import { useEffect, useState } from "react";
import {
  Loader2, Ban, CheckCircle2, ChevronLeft, ChevronRight,
  Search, Shield, ShieldOff, ChevronDown, ChevronUp, Wifi,
  Crown, BadgeCheck, Clock, Ghost, Smartphone, CalendarDays, Cake, Zap, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

const PAGE_LIMIT = 20;

// Columns: Photo · Name & details · Email · Status · Action
const GRID = "grid grid-cols-[1fr_1.3fr_1fr_150px_130px]";

// ── Helpers ─────────────────────────────────────────────────────────────────
// Photo verification status, case-insensitive ("Approved" / "approved")
const verifyStatus = (u) => String(u.photoVerification?.status || "").toLowerCase();
const isVerified = (u) => u.verifiedBadge === true || verifyStatus(u) === "approved";
const isVerificationPending = (u) => !isVerified(u) && verifyStatus(u) === "pending";

// Boost still running?
const isBoosted = (u) => u.boostExpiresAt && new Date(u.boostExpiresAt) > new Date();

// "Active today" / "Active 3 days ago" from lastLogin
const lastActive = (d) => {
  if (!d) return null;
  const t = new Date(d);
  if (isNaN(t)) return null;
  const days = Math.floor((Date.now() - t.getTime()) / 86400000);
  const text =
    days <= 0 ? "today"
      : days === 1 ? "yesterday"
        : days < 30 ? `${days} days ago`
          : days < 365 ? `${Math.floor(days / 30)} mo ago`
            : `${Math.floor(days / 365)} yr ago`;
  return { text, days, full: t.toLocaleString("en-GB") };
};

// Age in years from dateOfBirth (null if missing / invalid)
const ageOf = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const beforeBirthday =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthday) age--;
  return age;
};

// "2 Nov 2026" + "today" / "3 days ago" / "5 months ago"
const formatJoined = (createdAt) => {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (isNaN(d)) return null;
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  const ago =
    days <= 0 ? "today"
      : days === 1 ? "yesterday"
        : days < 30 ? `${days} days ago`
          : days < 365 ? `${Math.floor(days / 30)} mo ago`
            : `${Math.floor(days / 365)} yr ago`;
  return { date, ago, days };
};

// Phone OS from user.os ("android" / "ios" / …) → label + colour
const phoneOs = (os) => {
  const v = String(os || "").toLowerCase();
  if (v.includes("ios") || v.includes("iphone")) {
    return { label: "iPhone", cls: "bg-slate-100 text-slate-700 border-slate-300" };
  }
  if (v.includes("android")) {
    return { label: "Android", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  return v
    ? { label: os, cls: "bg-[#f3f1ed] text-[#888] border-[#e0dbd2]" }
    : null;
};

// Common iPhone model codes → names (the phone reports e.g. "iPhone15,2")
const IPHONE_NAMES = {
  "iPhone12,1": "iPhone 11", "iPhone12,3": "iPhone 11 Pro", "iPhone12,5": "iPhone 11 Pro Max",
  "iPhone12,8": "iPhone SE (2nd gen)", "iPhone13,1": "iPhone 12 mini", "iPhone13,2": "iPhone 12",
  "iPhone13,3": "iPhone 12 Pro", "iPhone13,4": "iPhone 12 Pro Max", "iPhone14,4": "iPhone 13 mini",
  "iPhone14,5": "iPhone 13", "iPhone14,2": "iPhone 13 Pro", "iPhone14,3": "iPhone 13 Pro Max",
  "iPhone14,6": "iPhone SE (3rd gen)", "iPhone14,7": "iPhone 14", "iPhone14,8": "iPhone 14 Plus",
  "iPhone15,2": "iPhone 14 Pro", "iPhone15,3": "iPhone 14 Pro Max", "iPhone15,4": "iPhone 15",
  "iPhone15,5": "iPhone 15 Plus", "iPhone16,1": "iPhone 15 Pro", "iPhone16,2": "iPhone 15 Pro Max",
  "iPhone17,3": "iPhone 16", "iPhone17,4": "iPhone 16 Plus", "iPhone17,1": "iPhone 16 Pro",
  "iPhone17,2": "iPhone 16 Pro Max", "iPhone17,5": "iPhone 16e",
};

// Tidy brand names: "samsung" → "Samsung", "TECNO" → "Tecno", "itel" stays "itel"
const BRAND_NAMES = {
  samsung: "Samsung", itel: "itel", tecno: "Tecno", infinix: "Infinix",
  xiaomi: "Xiaomi", redmi: "Redmi", poco: "POCO", oppo: "OPPO", vivo: "vivo",
  realme: "realme", google: "Google Pixel", huawei: "Huawei", honor: "HONOR",
  nokia: "Nokia", motorola: "Motorola", oneplus: "OnePlus", apple: "Apple",
};

/**
 * Phone label from user.device (sent by the new app), e.g.
 *   "Samsung SM-A145F", "itel A665L", "iPhone 14 Pro".
 * Returns { name, detail } or null if the app hasn't reported it yet.
 */
const phoneModel = (device) => {
  if (!device || (!device.model && !device.brand)) return null;
  const detail = [device.osVersion, device.appVersion && `app ${device.appVersion}`]
    .filter(Boolean)
    .join(" · ");

  if (device.platform === "ios") {
    return { name: IPHONE_NAMES[device.model] || device.model || "iPhone", detail };
  }

  const rawBrand = String(device.brand || device.manufacturer || "").trim();
  const brand = BRAND_NAMES[rawBrand.toLowerCase()] || rawBrand;
  const model = String(device.model || "").trim();
  // Some phones repeat the brand in the model ("itel A665L") — don't show it twice
  const name = model.toLowerCase().startsWith(rawBrand.toLowerCase())
    ? model
    : [brand, model].filter(Boolean).join(" ");
  return { name, detail };
};

/**
 * Phone from the IP logs' deviceInfo (saved with each login IP).
 * Uses the NEWEST log that has deviceInfo. deviceInfo may be:
 *   • JSON text  → '{"brand":"samsung","model":"SM-A145F",...}'
 *   • plain text → "samsung SM-A145F" / "iPhone15,2"
 * Returns { name, detail } or null.
 */
const phoneFromIpLogs = (ipLogs = []) => {
  const withDevice = ipLogs
    .filter((l) => l?.deviceInfo)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const raw = withDevice[0]?.deviceInfo;
  if (!raw) return null;

  // JSON → reuse the same formatting as user.device
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (obj && typeof obj === "object") {
      const platform =
        obj.platform ||
        (String(obj.model || obj.brand || "").toLowerCase().includes("iphone") ? "ios" : "android");
      const res = phoneModel({ ...obj, platform });
      if (res) return res;
    }
  } catch (_) {
    /* not JSON — plain text below */
  }

  // Plain text
  const text = String(raw).trim();

  // App format: "Android - Redmi 24048RN6CG, SDK 34" / "iOS - iPhone15,2, 18.1"
  const m = text.match(/^(android|ios)\s*-\s*(.+?)(?:,\s*(SDK\s*\d+|[\d.]+))?$/i);
  if (m) {
    const isIos = m[1].toLowerCase() === "ios";
    let model = m[2].trim();
    if (isIos && IPHONE_NAMES[model]) model = IPHONE_NAMES[model];
    // Tidy the brand word: "samsung SM-A145F" → "Samsung SM-A145F"
    const [w, ...more] = model.split(/\s+/);
    if (BRAND_NAMES[w.toLowerCase()]) model = [BRAND_NAMES[w.toLowerCase()], ...more].join(" ");
    // "SDK 34" → "Android 14"
    const SDK = { 36: "16", 35: "15", 34: "14", 33: "13", 32: "12L", 31: "12", 30: "11", 29: "10", 28: "9", 27: "8.1", 26: "8" };
    const ver = m[3] || "";
    const sdk = ver.match(/SDK\s*(\d+)/i)?.[1];
    const detail = isIos
      ? `iOS ${ver}`.trim()
      : sdk ? `Android ${SDK[sdk] || `SDK ${sdk}`}` : "Android";
    return { name: model, detail };
  }

  if (IPHONE_NAMES[text]) return { name: IPHONE_NAMES[text], detail: text };
  const [first, ...rest] = text.split(/\s+/);
  const brand = BRAND_NAMES[first.toLowerCase()];
  return { name: brand ? [brand, ...rest].join(" ") : text, detail: text };
};

/** Short readable device text for one IP log row (or null). */
const ipDeviceLabel = (log) => (log?.deviceInfo ? phoneFromIpLogs([log])?.name : null);

// Small coloured label used across the table
const Pill = ({ className, children }) => (
  <span
    className={`inline-flex items-center text-[11px] px-2 py-0.5 border whitespace-nowrap ${className}`}
  >
    {children}
  </span>
);

const GREY = "bg-[#f3f1ed] text-[#666] border-[#e0dbd2]";

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
            `${u.firstname || ""} ${u.lastname || ""} ${u.fullname || ""}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
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
      toast.success(`${user.firstname || "User"} has been ${action}.`);
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
        <div className={`${GRID} bg-[#1a1a1a] text-white text-xs uppercase tracking-widest px-4 py-3`}>
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
            const age = ageOf(user.dateOfBirth);
            const joined = formatJoined(user.createdAt);
            const active = lastActive(user.lastLogin);
            // Phone: app device report if present, else newest IP log deviceInfo
            const phone = phoneModel(user.device) || phoneFromIpLogs(user.ipLogs);
            const os =
              phoneOs(user.device?.platform || user.os) ||
              (phone ? phoneOs(/iphone|apple/i.test(phone.name) ? "ios" : "android") : null);
            const name =
              [user.firstname, user.lastname].filter(Boolean).join(" ") || user.fullname || "—";

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
                <div className={`${GRID} items-start px-4 py-3 gap-3`}>

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
                            alt={`${user.firstname} photo ${idx + 1}`}
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-[60px] h-[60px] flex-shrink-0 rounded-md bg-[#e5e0d8] flex items-center justify-center border border-[#ddd]">
                        <span className="text-[#8b4513] font-bold text-xl">
                          {user.firstname?.[0] || "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name + Meta */}
                  <div className="flex flex-col gap-1 pt-1">
                    <p className="font-semibold text-[#1a1a1a] text-sm">{name}</p>
                    <p className="text-[#aaa] text-xs">
                      {user.gender || "—"}
                      {age !== null && ` · ${age} yrs`}
                      {" · "}
                      {user.location?.country || "—"}
                      {user.ethnicity && ` · ${user.ethnicity}`}
                    </p>

                    {/* Age · phone · joined · last active */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {age !== null && (
                        <Pill className={GREY}>
                          <Cake className="w-3 h-3 mr-1" /> {age}
                        </Pill>
                      )}
                      {os && (
                        <Pill className={os.cls}>
                          <Smartphone className="w-3 h-3 mr-1" />
                          <span title={phone?.detail || ""}>{phone ? phone.name : os.label}</span>
                        </Pill>
                      )}
                      {joined && (
                        <Pill
                          className={
                            joined.days < 7 ? "bg-sky-50 text-sky-700 border-sky-200" : GREY
                          }
                        >
                          <CalendarDays className="w-3 h-3 mr-1" />
                          Joined {joined.date} · {joined.ago}
                        </Pill>
                      )}
                      {active && (
                        <Pill
                          className={
                            active.days < 2
                              ? "bg-green-50 text-green-700 border-green-200"
                              : active.days >= 14
                                ? "bg-rose-50 text-rose-700 border-rose-200" // inactive 2+ weeks
                                : GREY
                          }
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          <span title={active.full}>Active {active.text}</span>
                        </Pill>
                      )}
                    </div>

                    {/* Premium · verification · boost */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {user.isPremium ? (
                        <Pill className="bg-amber-50 text-amber-800 border-amber-300">
                          <Crown className="w-3 h-3 mr-1" /> Premium
                        </Pill>
                      ) : (
                        <Pill className={GREY}>Free</Pill>
                      )}
                      {isVerified(user) ? (
                        <Pill className="bg-sky-50 text-sky-700 border-sky-200">
                          <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                        </Pill>
                      ) : isVerificationPending(user) ? (
                        <Pill className="bg-orange-50 text-orange-700 border-orange-200">
                          <Clock className="w-3 h-3 mr-1" /> Verification pending
                        </Pill>
                      ) : (
                        <Pill className={GREY}>Not verified</Pill>
                      )}
                      {isBoosted(user) && (
                        <Pill className="bg-violet-50 text-violet-700 border-violet-200">
                          <Zap className="w-3 h-3 mr-1" /> Boosted
                        </Pill>
                      )}
                    </div>

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
                  <div className="flex flex-col items-start gap-1 pt-1">
                    {user.suspended ? (
                      <span className="inline-flex items-center bg-red-100 text-red-700 border border-red-200 text-xs px-2 py-1">
                        <Ban className="w-3 h-3 mr-1" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                    {user.isGhost && (
                      <Pill className="bg-violet-50 text-violet-700 border-violet-200">
                        <Ghost className="w-3 h-3 mr-1" /> Ghost (hidden)
                      </Pill>
                    )}
                    {user.hasCompletedReg === false && (
                      <Pill className="bg-orange-50 text-orange-700 border-orange-200">
                        Registration incomplete
                      </Pill>
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
                          {/* Phone used for this login */}
                          {ipDeviceLabel(ip) && (
                            <span className="block text-[#8b4513] mt-0.5 font-sans">
                              📱 {ipDeviceLabel(ip)}
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