"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import { EditIcon, Trash2Icon, PlusIcon, Loader2, Music2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Head from "next/head";

export default function PrayerList() {
  const router = useRouter();
  const [prayers, setPrayers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    GlobalApi.prayers()
      .then((resp) => setPrayers(resp.data.data))
      .catch(() => toast.error("Failed to load prayers."))
      .finally(() => setIsFetching(false));
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this prayer?")) return;
    setDeletingId(id);
    GlobalApi.deletePrayer(id)
      .then((result) => {
        if (!result.data.error) {
          setPrayers((prev) => prev.filter((p) => p._id !== id));
          toast.success("Prayer deleted.");
        } else {
          toast.error("Failed to delete prayer.");
        }
      })
      .catch(() => toast.error("Network error."))
      .finally(() => setDeletingId(null));
  };

  return (
    <>
      <Head><title>Prayer List</title></Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');

        :root {
          --bg: #f5f2ed;
          --card: #ffffff;
          --ink: #1c1a17;
          --ink-muted: #6b6560;
          --ink-faint: #b8b2aa;
          --accent: #7c4d2f;
          --accent-light: #f0e8df;
          --accent-hover: #6a3f24;
          --border: #e2dbd3;
          --red: #b03030;
          --red-light: #fdf0f0;
          --green: #3d7a5a;
          --green-light: #f0faf5;
          --radius: 6px;
          --shadow: 0 1px 3px rgba(28,26,23,0.08), 0 4px 16px rgba(28,26,23,0.06);
        }

        .pl-root {
          min-height: 100vh;
          background: var(--bg);
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%237c4d2f' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
          font-family: 'Lato', sans-serif;
          padding: 40px 16px 80px;
        }

        .pl-inner {
          max-width: 860px;
          margin: 0 auto;
        }

        .pl-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pl-heading {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 4px;
          line-height: 1.15;
        }

        .pl-subheading {
          font-size: 13px;
          color: var(--ink-muted);
          font-weight: 300;
          margin: 0;
        }

        .pl-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          background: var(--accent);
          border: none;
          border-radius: var(--radius);
          color: white;
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(124,77,47,0.25);
          white-space: nowrap;
        }
        .pl-add-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(124,77,47,0.32);
        }
        .pl-add-btn svg { width: 14px; height: 14px; }

        .pl-card {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .pl-table {
          width: 100%;
          border-collapse: collapse;
        }

        .pl-thead { border-bottom: 2px solid var(--border); }

        .pl-th {
          padding: 13px 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-muted);
          text-align: left;
          background: #fdfcfb;
        }
        .pl-th.center { text-align: center; }
        .pl-th.right  { text-align: right; }

        .pl-tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.12s;
        }
        .pl-tr:last-child { border-bottom: none; }
        .pl-tr:hover { background: #fdfaf7; }

        .pl-td {
          padding: 14px 20px;
          font-size: 14px;
          color: var(--ink);
          vertical-align: middle;
        }
        .pl-td.center { text-align: center; }
        .pl-td.right  { text-align: right; }

        .pl-title { font-weight: 600; color: var(--ink); }

        .pl-type-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 20px;
          background: var(--accent-light);
          color: var(--accent);
        }

        /* Audio indicator */
        .pl-audio-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          background: var(--accent-light);
          border-radius: 50%;
          color: var(--accent);
        }
        .pl-audio-icon svg { width: 13px; height: 13px; }
        .pl-no-audio { color: var(--ink-faint); font-size: 13px; }

        .pl-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .pl-action-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s, color 0.12s;
          text-decoration: none;
          color: var(--ink-muted);
          flex-shrink: 0;
        }
        .pl-action-btn svg { width: 14px; height: 14px; }
        .pl-action-btn.edit:hover {
          background: var(--green-light);
          border-color: #a8d5bc;
          color: var(--green);
        }
        .pl-action-btn.delete:hover {
          background: var(--red-light);
          border-color: #f0b8b8;
          color: var(--red);
        }
        .pl-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .pl-skeleton {
          background: linear-gradient(90deg, #ede8e2 25%, #e4ddd6 50%, #ede8e2 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 4px;
          height: 14px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .pl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 64px 32px;
          color: var(--ink-faint);
          text-align: center;
        }
        .pl-empty-icon {
          width: 48px;
          height: 48px;
          background: var(--accent-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          opacity: 0.6;
        }
        .pl-empty strong { font-size: 14px; color: var(--ink-muted); font-weight: 600; }
        .pl-empty span { font-size: 13px; }

        .pl-count {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          background: var(--border);
          color: var(--ink-muted);
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 10px;
          vertical-align: middle;
        }
      `}</style>

      <div className="pl-root">
        <div className="pl-inner">

          {/* Header */}
          <div className="pl-header">
            <div>
              <h1 className="pl-heading">
                Prayers
                {!isFetching && <span className="pl-count">{prayers.length}</span>}
              </h1>
              <p className="pl-subheading">Manage your prayer collection</p>
            </div>
            <Link href="/prayer/create" className="pl-add-btn">
              <PlusIcon /> Add Prayer
            </Link>
          </div>

          {/* Table */}
          <div className="pl-card">
            <table className="pl-table">
              <thead className="pl-thead">
                <tr>
                  <th className="pl-th">Title</th>
                  <th className="pl-th">Type</th>
                  <th className="pl-th center">Audio</th>
                  <th className="pl-th right">Actions</th>
                </tr>
              </thead>
              <tbody>

                {/* Skeleton */}
                {isFetching && Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="pl-tr">
                    <td className="pl-td"><div className="pl-skeleton" style={{ width: "60%" }} /></td>
                    <td className="pl-td"><div className="pl-skeleton" style={{ width: 70 }} /></td>
                    <td className="pl-td center"><div className="pl-skeleton" style={{ width: 26, height: 26, borderRadius: "50%", margin: "0 auto" }} /></td>
                    <td className="pl-td">
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <div className="pl-skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
                        <div className="pl-skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty */}
                {!isFetching && prayers.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="pl-empty">
                        <div className="pl-empty-icon"><PlusIcon size={22} /></div>
                        <strong>No prayers yet</strong>
                        <span>Click "Add Prayer" to create the first one.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {!isFetching && prayers.map((item) => (
                  <tr key={item._id} className="pl-tr">
                    <td className="pl-td">
                      <span className="pl-title">{item.title}</span>
                    </td>
                    <td className="pl-td">
                      <span className="pl-type-badge">{item.type?.name || "—"}</span>
                    </td>
                    <td className="pl-td center">
                      {item.audioUrl
                        ? (
                          <span className="pl-audio-icon" title="Has audio">
                            <Music2 />
                          </span>
                        ) : (
                          <span className="pl-no-audio">—</span>
                        )
                      }
                    </td>
                    <td className="pl-td right">
                      <div className="pl-actions">
                        <Link href={`/prayer/update/${item._id}`} className="pl-action-btn edit">
                          <EditIcon />
                        </Link>
                        <button
                          className="pl-action-btn delete"
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                        >
                          {deletingId === item._id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2Icon />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
}