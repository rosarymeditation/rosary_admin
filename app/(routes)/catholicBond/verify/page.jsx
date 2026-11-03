"use client";
import GlobalApi from "@/app/_utils/CatholicApi";
import { useEffect, useState } from "react";
import {
  Loader2, Ban, CheckCircle2, ChevronLeft, ChevronRight,
  Search, Shield, ShieldOff, ChevronDown, ChevronUp, Wifi,
  BadgeCheck, XCircle, ImageOff, Smartphone, CalendarDays, Cake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

const PAGE_LIMIT = 20;

// Desktop columns. On phones each user becomes a stacked card instead.
const GRID = "lg:grid lg:grid-cols-[280px_1.5fr_1fr_120px_150px_150px]";

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

// Small grey label
const Pill = ({ children, className = "bg-[#f3f1ed] text-[#555] border-[#e0dbd2]" }) => (
  <span className={`inline-flex items-center text-[11px] px-2 py-0.5 border whitespace-nowrap ${className}`}>
    {children}
  </span>
);

// Small heading used only on phones (desktop has the table header instead)
const MobileLabel = ({ children }) => (
  <p className="lg:hidden text-[10px] uppercase tracking-widest text-[#aaa] mb-1">{children}</p>
);

const VerificationBadge = ({ status }) => {
  if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-1">
        <BadgeCheck className="w-3 h-3" /> Verified
      </span>
    );
  }
  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-1">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs px-2 py-1">
        <Loader2 className="w-3 h-3" /> Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 border border-gray-200 text-xs px-2 py-1">
      <ImageOff className="w-3 h-3" /> Unverified
    </span>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [suspendingId, setSuspendingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedIps, setExpandedIps] = useState({});

  const fetchUsers = async (currentPage = 1, searchTerm = "") => {
    setIsLoading(true);
    try {
      const res = await GlobalApi.getPendingVerifications({
        page: currentPage,
        limit: PAGE_LIMIT,
        age_min: 18,
        age_max: 90,
      });
      const fetched = res.data?.data || [];

      const filtered = searchTerm
        ? fetched.filter(
          (u) =>
            u.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      toast.success(`${user.firstname} has been ${action}.`);
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

  const handleVerification = async (user, status) => {
    setVerifyingId(user._id + status);
    try {
      await GlobalApi.updatePhotoVerification(user.email, status);
      toast.success(
        `${user.firstname}'s photo has been ${status === "Approved" ? "approved ✅" : "rejected ❌"}.`
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id
            ? {
              ...u,
              photoVerification: {
                ...u.photoVerification,
                status,
              },
            }
            : u
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update verification status.");
    } finally {
      setVerifyingId(null);
    }
  };

  const toggleIps = (userId) => {
    setExpandedIps((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="min-h-screen bg-[#f9f6f1] px-3 sm:px-4 py-6 sm:py-10 font-[Georgia,serif]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-[#1a1a1a] tracking-tight">
          User Management
        </h1>
        <p className="text-[#888] mt-1 text-sm">
          Manage, verify, and moderate your community members.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto flex gap-2 mb-6">
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
      <div className="max-w-7xl mx-auto bg-white border border-[#e5e0d8] shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className={`hidden ${GRID} bg-[#1a1a1a] text-white text-xs uppercase tracking-widest px-4 py-3 gap-3`}>
          <span>Photos</span>
          <span>Name</span>
          <span>Email</span>
          <span>Account</span>
          <span>Verification</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20 text-[#888]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading users...</span>
          </div>
        )}

        {/* Empty */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-20 text-[#aaa] text-sm">
            No users found.
          </div>
        )}

        {/* Rows */}
        {!isLoading &&
          users.map((user, i) => {
            const ipList = (user.ipLogs || []).slice(0, 10);
            const isExpanded = expandedIps[user._id];
            const verifyStatus = user.photoVerification?.status;
            const age = ageOf(user.dateOfBirth);
            const joined = formatJoined(user.createdAt);
            const phone = phoneModel(user.device) || phoneFromIpLogs(user.ipLogs);
            const name =
              [user.firstname, user.lastname].filter(Boolean).join(" ") || user.fullname || "—";
            const cities = [...new Set(
              (user.ipLogs || [])
                .map((log) => [log.city, log.country].filter(Boolean).join(", "))
                .filter(Boolean)
            )];

            return (
              <div
                key={user._id}
                className={`border-b border-[#f0ece4] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"
                  } hover:bg-[#f3ede4]`}
              >
                {/* Main Row */}
                <div className={`flex flex-col gap-4 ${GRID} lg:items-start lg:gap-3 px-4 py-4 lg:py-3`}>

                  {/* Photos — profile images + verification photo */}
                  <div className="flex flex-col gap-2 order-2 lg:order-none">
                    {/* Profile Photos */}
                    <p className="text-[10px] uppercase tracking-widest text-[#aaa]">Profile</p>
                    <div className="flex flex-wrap gap-1">
                      {user.profileImage?.length > 0 ? (
                        user.profileImage.map((img, idx) => (
                          <a
                            key={idx}
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open full size"
                            className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-sm overflow-hidden bg-[#e5e0d8] flex items-center justify-center flex-shrink-0 relative border border-[#ddd]"
                          >
                            <Image
                              src={img.url}
                              alt={`${user.firstname} photo ${idx + 1}`}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                            />
                          </a>
                        ))
                      ) : (
                        <div className="w-[80px] h-[80px] rounded-sm bg-[#e5e0d8] flex items-center justify-center border border-[#ddd]">
                          <span className="text-[#8b4513] font-bold text-2xl">
                            {user.firstname?.[0] || "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Verification Photo */}
                    <p className="text-[10px] uppercase tracking-widest text-[#aaa] mt-1">Verification Photo</p>
                    {user.photoVerification?.url ? (
                      <div className="relative w-full">
                        {/* Bigger on phones so the face is easy to compare */}
                        <a
                          href={user.photoVerification.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open full size"
                          className="block w-[160px] h-[160px] lg:w-[120px] lg:h-[120px] rounded-sm overflow-hidden border-2 border-dashed border-[#8b4513] bg-[#faf8f5]"
                        >
                          <Image
                            src={user.photoVerification.url}
                            alt={`${user.firstname} verification`}
                            width={160}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        </a>
                        <div className="mt-1">
                          <VerificationBadge status={user.photoVerification?.status} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-[120px] h-[80px] rounded-sm bg-[#f0ece4] border border-dashed border-[#ccc] flex items-center justify-center">
                        <span className="text-[#ccc] text-xs text-center px-2">No verification photo</span>
                      </div>
                    )}
                  </div>

                  {/* Name + Cities + IP toggle */}
                  <div className="flex flex-col gap-1 order-1 lg:order-none">
                    <p className="font-semibold text-[#1a1a1a] text-base lg:text-sm">{name}</p>
                    <p className="text-[#aaa] text-xs">
                      {user.gender || "—"}
                      {age !== null && ` · ${age} yrs`}
                      {" · "}
                      {user.location?.country || "—"}
                    </p>
                    {/* Email shown here on phones (own column on desktop) */}
                    <p className="lg:hidden text-xs text-[#555] break-all">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {age !== null && (
                        <Pill><Cake className="w-3 h-3 mr-1" /> {age}</Pill>
                      )}
                      {phone && (
                        <Pill>
                          <Smartphone className="w-3 h-3 mr-1" />
                          <span title={phone.detail}>{phone.name}</span>
                        </Pill>
                      )}
                      {joined && (
                        <Pill
                          className={
                            joined.days < 7
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-[#f3f1ed] text-[#555] border-[#e0dbd2]"
                          }
                        >
                          <CalendarDays className="w-3 h-3 mr-1" /> Joined {joined.date}
                        </Pill>
                      )}
                    </div>
                    {cities.length > 0 && (
                      <p className="text-xs text-[#888] leading-relaxed">
                        📍 {cities.join(" · ")}
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
                      {ipList.length > 0 && (
                        isExpanded
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Email */}
                  <p className="hidden lg:block text-sm text-[#555] truncate">{user.email}</p>

                  {/* Account Status */}
                  <div className="order-3 lg:order-none">
                    <MobileLabel>Account</MobileLabel>
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

                  {/* Photo Verification Status */}
                  <div className="order-3 lg:order-none -mt-2 lg:mt-0">
                    {/* Status badge already shows under the photo on phones */}
                    <div className="hidden lg:block">
                      <VerificationBadge status={verifyStatus} />
                    </div>
                    {user.photoVerification?.uploadedAt && (
                      <p className="text-[10px] text-[#aaa] mt-1">
                        Uploaded {new Date(user.photoVerification.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                    {user.photoVerification?.verifiedAt && (
                      <p className="text-[10px] text-[#aaa]">
                        Reviewed {new Date(user.photoVerification.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {/* Phones: 3 big buttons side by side at the bottom of the card */}
                  <div className="order-4 lg:order-none grid grid-cols-3 gap-2 lg:flex lg:flex-col lg:items-end">
                    {/* Suspend / Unsuspend */}
                    <Button
                      size="sm"
                      disabled={suspendingId === user._id}
                      onClick={() => handleSuspend(user)}
                      className={`rounded-none text-xs px-2 lg:px-3 py-3 lg:py-1 h-auto w-full justify-center ${user.suspended
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

                    {/* Approve Photo */}
                    <Button
                      size="sm"
                      disabled={
                        verifyStatus === "Approved" ||
                        verifyingId === user._id + "Approved"
                      }
                      onClick={() => handleVerification(user, "Approved")}
                      className="rounded-none text-xs px-2 lg:px-3 py-3 lg:py-1 h-auto w-full justify-center bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
                    >
                      {verifyingId === user._id + "Approved" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><BadgeCheck className="w-3 h-3 mr-1" /> Approve</>
                      )}
                    </Button>

                    {/* Reject Photo */}
                    <Button
                      size="sm"
                      disabled={
                        verifyStatus === "Rejected" ||
                        verifyingId === user._id + "Rejected"
                      }
                      onClick={() => handleVerification(user, "Rejected")}
                      className="rounded-none text-xs px-2 lg:px-3 py-3 lg:py-1 h-auto w-full justify-center bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40"
                    >
                      {verifyingId === user._id + "Rejected" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" /> Reject</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* IP Addresses Expandable Panel */}
                {isExpanded && ipList.length > 0 && (
                  <div className="px-4 pb-4 bg-[#f5f0e8] border-t border-[#e5e0d8]">
                    <p className="text-xs uppercase tracking-widest text-[#888] py-2">
                      IP Addresses (last {ipList.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                      {ipList.map((ip, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-[#ddd] text-[#333] text-xs px-3 py-1.5 font-mono flex flex-col"
                        >
                          <span>{ip.ipAddress}</span>
                          {(ip.city || ip.country) && (
                            <span className="text-[#aaa] text-[10px] mt-0.5">
                              {[ip.city, ip.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {ipDeviceLabel(ip) && (
                            <span className="text-[#8b4513] text-[10px] mt-0.5 font-sans">
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
        <div className="max-w-7xl mx-auto flex justify-between items-center mt-6">
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