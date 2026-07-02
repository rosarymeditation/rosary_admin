"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Head from "next/head";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  EditIcon,
  Loader2,
  Trash2Icon,
  Search,
  BookOpen,
  CalendarDays,
  Languages,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LanguagePill({ name }) {
  const isSpanish = name?.toLowerCase().includes("spanish") ||
    name?.toLowerCase().includes("español");
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        background: isSpanish
          ? "rgba(124, 58, 237, 0.15)"
          : "rgba(29, 78, 216, 0.15)",
        color: isSpanish ? "#c4b5fd" : "#93c5fd",
        border: isSpanish
          ? "1px solid rgba(124,58,237,0.3)"
          : "1px solid rgba(29,78,216,0.3)",
      }}
    >
      <Languages size={10} />
      {name}
    </span>
  );
}

function EmptyState({ query }) {
  return (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        color: "#4b5563",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <BookOpen size={40} style={{ color: "#374151" }} />
      <p style={{ fontSize: 16, color: "#6b7280", margin: 0 }}>
        {query
          ? `No readings found matching "${query}"`
          : "No readings found."}
      </p>
      {!query && (
        <Link
          href="/dailyReading/create"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            padding: "8px 18px",
            borderRadius: 8,
            background: "rgba(180,83,9,0.15)",
            border: "1px solid rgba(180,83,9,0.3)",
            color: "#fbbf24",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <Plus size={14} /> Create first reading
        </Link>
      )}
    </div>
  );
}

function DeleteModal({ item, onConfirm, onCancel, isDeleting }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#141210",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
          maxWidth: 380,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              background: "rgba(220,38,38,0.15)",
              borderRadius: 8,
              padding: 8,
              display: "flex",
            }}
          >
            <AlertTriangle size={18} color="#f87171" />
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#f0ebe3",
            }}
          >
            Delete Reading
          </span>
        </div>
        <p style={{ color: "#9ca3af", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Are you sure you want to delete the reading for{" "}
          <strong style={{ color: "#fbbf24" }}>
            {formatDisplayDate(item?.date)}
            {item?.title ? ` — ${item.title}` : ""}
          </strong>
          ? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#9ca3af",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              background: "rgba(220,38,38,0.2)",
              border: "1px solid rgba(220,38,38,0.4)",
              color: "#f87171",
              fontSize: 14,
              fontWeight: 600,
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {isDeleting ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Trash2Icon size={14} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 15;

const DailyReadingList = () => {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = () => {
    setIsLoading(true);
    GlobalApi.getAllDailyReadings({ page: 1, limit: 200 })
      .then((resp) => {
        setReadings(resp.data.data || []);
      })
      .catch(() => toast.error("Failed to load readings."))
      .finally(() => setIsLoading(false));
  };

  // Filter + search
  const filtered = useMemo(() => {
    let result = [...readings];

    if (dateFilter) {
      result = result.filter((item) =>
        item.date?.startsWith(dateFilter)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.language?.name?.toLowerCase().includes(q) ||
          item.type?.toLowerCase().includes(q) ||
          item.title?.toLowerCase().includes(q) ||
          formatDisplayDate(item.date).toLowerCase().includes(q)
      );
    }

    return result;
  }, [readings, searchQuery, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 on filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, dateFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await GlobalApi.deleteDailyReading(deleteTarget._id);
      toast.success("Reading deleted.");
      setReadings((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete reading.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Daily Readings — Admin</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        tr { transition: background 0.15s; }
        tr:hover td { background: rgba(255,255,255,0.03) !important; }
        /* Slim, unobtrusive scrollbar for the table wrapper */
        .table-scroll::-webkit-scrollbar { height: 8px; }
        .table-scroll::-webkit-scrollbar-track { background: transparent; }
        .table-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 8px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0f0c08 0%, #1a1208 50%, #0d1117 100%)",
          fontFamily: "'DM Sans', sans-serif",
          padding: "40px 16px 80px",
          color: "#f0ebe3",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(180,83,9,0.12)",
                    border: "1px solid rgba(180,83,9,0.25)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#fbbf24",
                    marginBottom: 10,
                  }}
                >
                  <BookOpen size={11} /> Admin
                </div>
                <h1
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(26px, 4vw, 40px)",
                    fontWeight: 700,
                    color: "#fef3c7",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  Daily Readings
                </h1>
                <p style={{ color: "#6b7280", fontSize: 14, margin: "6px 0 0" }}>
                  {readings.length} total records
                </p>
              </div>
              <Link
                href="/dailyReading/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #b45309, #92400e)",
                  color: "#fef3c7",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Plus size={16} /> Create New
              </Link>
            </div>
          </div>

          {/* Search + Date filter bar */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#4b5563",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search by language, type, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 36,
                  paddingRight: 14,
                  paddingTop: 10,
                  paddingBottom: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  color: "#f0ebe3",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Date filter */}
            <div style={{ position: "relative" }}>
              <CalendarDays
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#4b5563",
                  pointerEvents: "none",
                }}
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  paddingLeft: 36,
                  paddingRight: 14,
                  paddingTop: 10,
                  paddingBottom: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  color: dateFilter ? "#fbbf24" : "#4b5563",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  colorScheme: "dark",
                }}
              />
            </div>

            {(searchQuery || dateFilter) && (
              <button
                onClick={() => { setSearchQuery(""); setDateFilter(""); }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#6b7280",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Results summary */}
          {(searchQuery || dateFilter) && (
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
              Showing <strong style={{ color: "#f0ebe3" }}>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Table */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              overflow: "hidden", // clips rounded corners only, not content
            }}
          >
            {isLoading ? (
              <div style={{ padding: 60, display: "flex", justifyContent: "center" }}>
                <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "#b45309" }} />
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState query={searchQuery || dateFilter} />
            ) : (
              // Scrollable wrapper: table can now scroll horizontally instead of
              // being clipped, so the Edit/Delete columns are always reachable.
              <div className="table-scroll" style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: 720,
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "28%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "6%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["Date", "Title", "Type", "Language", "Audio", "", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "12px 16px",
                            textAlign: i >= 4 ? "center" : "left",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item, idx) => (
                      <tr
                        key={item._id}
                        className="fade-in"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          animationDelay: `${idx * 30}ms`,
                        }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CalendarDays size={14} style={{ color: "#b45309", flexShrink: 0 }} />
                            <span style={{ fontSize: 14, color: "#f0ebe3", fontWeight: 500, whiteSpace: "nowrap" }}>
                              {formatDisplayDate(item.date)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", overflow: "hidden" }}>
                          {item.title ? (
                            <span
                              title={item.title}
                              style={{
                                display: "inline-block",
                                maxWidth: "100%",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#fbbf24",
                                background: "rgba(180,83,9,0.1)",
                                border: "1px solid rgba(180,83,9,0.2)",
                                borderRadius: 6,
                                padding: "2px 8px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                verticalAlign: "middle",
                              }}
                            >
                              {item.title}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#4b5563" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>
                            {item.type || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <LanguagePill name={item.language?.name} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {item.readingAudio ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#6ee7b7",
                                background: "rgba(74,180,120,0.1)",
                                border: "1px solid rgba(74,180,120,0.2)",
                                borderRadius: 6,
                                padding: "2px 8px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ✓ Uploaded
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: "#4b5563" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <Link
                            href={`/dailyReading/update/${item._id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "rgba(74,180,120,0.1)",
                              border: "1px solid rgba(74,180,120,0.2)",
                              color: "#6ee7b7",
                              textDecoration: "none",
                            }}
                            title="Edit"
                          >
                            <EditIcon size={13} />
                          </Link>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "rgba(220,38,38,0.1)",
                              border: "1px solid rgba(220,38,38,0.2)",
                              color: "#f87171",
                              cursor: "pointer",
                            }}
                            title="Delete"
                          >
                            <Trash2Icon size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Page {currentPage} of {totalPages} —{" "}
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: currentPage === 1 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: currentPage === 1 ? "#374151" : "#9ca3af",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: currentPage === totalPages ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: currentPage === totalPages ? "#374151" : "#9ca3af",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default DailyReadingList;