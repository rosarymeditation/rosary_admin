"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import Head from "next/head";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen, Edit3, Save, X, Play, Pause, Volume2,
  FileAudio, Languages, ArrowLeft, Loader2, RefreshCw,
  CheckCircle2, Upload, Mic, Tag,
} from "lucide-react";

// ─── Audio Player ──────────────────────────────────────────────────────────────

function AudioPlayer({ url, label, color }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(cur);
    setProgress(dur ? (cur / dur) * 100 : 0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  if (!url) return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "rgba(255,255,255,0.02)",
      border: "1px dashed rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "12px 16px",
      color: "#4b5563", fontSize: 13,
    }}>
      <FileAudio size={15} />
      <span>No audio uploaded for {label}</span>
    </div>
  );

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${color}44`,
      borderRadius: 12, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <audio
        ref={audioRef} src={url} preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={togglePlay} style={{
          width: 38, height: 38, borderRadius: "50%",
          background: color, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {isPlaying ? <Pause size={15} color="#fff" /> : <Play size={15} color="#fff" style={{ marginLeft: 2 }} />}
        </button>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Volume2 size={12} style={{ color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>
          <div onClick={handleSeek} style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 999, cursor: "pointer", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress}%`, background: color, borderRadius: 999, transition: "width 0.1s linear" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, color, badge, children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <span style={{ background: color, borderRadius: 8, padding: "5px 7px", display: "flex", alignItems: "center" }}>
          <Icon size={14} color="#fff" />
        </span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: "#f0ebe3" }}>{title}</span>
        {badge && (
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6ee7b7", background: "rgba(74,180,120,0.1)", border: "1px solid rgba(74,180,120,0.2)", borderRadius: 6, padding: "2px 8px" }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

// ─── HTML Preview ──────────────────────────────────────────────────────────────

function HtmlPreview({ html, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>{label}</span>
      <div
        dangerouslySetInnerHTML={{ __html: html || "<p style='color:#4b5563'>No content</p>" }}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16, color: "#d1c7b8", fontSize: 14, lineHeight: 1.8, maxHeight: 300, overflowY: "auto" }}
      />
    </div>
  );
}

// ─── Editable Field ────────────────────────────────────────────────────────────

function EditableField({ label, value, onChange, placeholder, rows = 10 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          padding: "12px 14px", color: "#f0ebe3", fontSize: 14,
          lineHeight: 1.7, resize: "vertical", outline: "none",
          fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
        }}
      />
      <div style={{ textAlign: "right", fontSize: 11, color: "#4b5563" }}>
        {(value || "").length.toLocaleString()} characters
      </div>
    </div>
  );
}

// ─── File Upload Button ────────────────────────────────────────────────────────

function FileUploadButton({ id, label, file, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>{label}</label>
      <label htmlFor={id} style={{
        display: "flex", alignItems: "center", gap: 10,
        background: file ? "rgba(74,180,120,0.06)" : "rgba(255,255,255,0.03)",
        border: file ? "1px dashed rgba(74,180,120,0.4)" : "1px dashed rgba(255,255,255,0.12)",
        borderRadius: 10, padding: "11px 14px", cursor: "pointer",
        fontSize: 13, color: file ? "#6ee7b7" : "#6b7280", transition: "all 0.2s",
      }}>
        {file ? <CheckCircle2 size={15} /> : <Upload size={15} />}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file ? file.name : "Click to select a replacement audio file"}
        </span>
      </label>
      <input id={id} type="file" accept="audio/*" onChange={onChange} style={{ display: "none" }} />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const EditDailyReadingPage = ({ params }) => {
  const id = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [enRecord, setEnRecord] = useState(null);
  const [esRecord, setEsRecord] = useState(null);
  const [contentEN, setContentEN] = useState("");
  const [contentES, setContentES] = useState("");
  const [newAudioEN, setNewAudioEN] = useState(null);
  const [newAudioES, setNewAudioES] = useState(null);

  useEffect(() => { if (id) loadReading(); }, [id]);

  const loadReading = async () => {
    setIsLoading(true);
    try {
      const res = await GlobalApi.getDailyReadingById({ id });
      const record = res.data?.data;
      if (!record) { toast.error("Reading not found."); return; }

      const dateStr = record.date
        ? new Date(record.date).toISOString().split("T")[0]
        : null;

      let en = null;
      let es = null;

      if (dateStr) {
        const dateRes = await GlobalApi.searchDailyReadingByDate({ date: dateStr, limit: 20 });
        const all = dateRes.data?.data || [];

        // Match by title so we get the right mass on multi-mass days
        const recordTitle = record.title || "";
        const pool = recordTitle
          ? all.filter((r) => r.title === recordTitle)
          : all;

        en = pool.find((r) => r.language?.name?.toLowerCase().includes("english")) || null;
        es = pool.find((r) => r.language?.name?.toLowerCase().includes("spanish")) || null;
      }

      // Fallback to the record itself
      if (!en && !es) {
        const isEn = record.language?.name?.toLowerCase().includes("english");
        if (isEn) en = record; else es = record;
      }

      setEnRecord(en);
      setEsRecord(es);
      setContentEN(en?.content || "");
      setContentES(es?.content || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reading.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contentEN.trim() || !contentES.trim()) {
      toast.error("Both English and Spanish content are required.");
      return;
    }
    setIsSaving(true);
    try {
      await GlobalApi.updateDailyReading({
        id: enRecord?._id || esRecord?._id,
        contentEnglish: contentEN,
        contentSpanish: contentES,
      });
      toast.success("Reading queued for reprocessing. GPT is reformatting in the background.");
      setIsEditing(false);
      loadReading();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reading.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAudioUpdate = async () => {
    if (!newAudioEN && !newAudioES) {
      toast.error("Please select at least one audio file.");
      return;
    }
    setIsSaving(true);
    try {
      const dateStr = (enRecord?.date || esRecord?.date)
        ? new Date(enRecord?.date || esRecord?.date).toISOString().split("T")[0]
        : "";

      const formData = new FormData();
      formData.append("date", dateStr);
      // Pass the titles so the backend finds the correct record for multi-mass days
      if (enRecord?.title) formData.append("typeOverride", enRecord.title);
      if (esRecord?.title) formData.append("typeOverrideES", esRecord.title);
      if (newAudioEN) formData.append("readingFileEN", newAudioEN);
      if (newAudioES) formData.append("readingFileES", newAudioES);

      await GlobalApi.updateCreateDailyReading(formData);
      toast.success("Audio files replaced successfully.");
      setNewAudioEN(null);
      setNewAudioES(null);
      loadReading();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update audio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setContentEN(enRecord?.content || "");
    setContentES(esRecord?.content || "");
    setIsEditing(false);
  };

  const displayDate = (enRecord?.date || esRecord?.date)
    ? new Date(enRecord?.date || esRecord?.date).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })
    : "—";

  // Show title if present, otherwise fall back to liturgical type
  const enTitle = enRecord?.title || "";
  const esTitle = esRecord?.title || "";
  const liturgicalType = enRecord?.type || esRecord?.type || "—";

  return (
    <>
      <Head>
        <title>Edit Daily Reading — Admin</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        textarea:focus { border-color: rgba(180,83,9,0.5) !important; box-shadow: 0 0 0 2px rgba(180,83,9,0.1); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f0c08 0%, #1a1208 55%, #0d1117 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#f0ebe3", padding: "36px 16px 80px",
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <Link href="/dailyReading/list" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#6b7280", fontSize: 13, textDecoration: "none", marginBottom: 20,
            }}>
              <ArrowLeft size={14} /> Back to list
            </Link>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(180,83,9,0.12)", border: "1px solid rgba(180,83,9,0.25)",
                  borderRadius: 999, padding: "4px 12px", marginBottom: 10,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#fbbf24",
                }}>
                  <BookOpen size={11} /> Daily Reading
                </div>

                <h1 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(24px, 4vw, 38px)",
                  fontWeight: 700, color: "#fef3c7", margin: 0, lineHeight: 1.1,
                }}>
                  {isLoading ? "Loading…" : displayDate}
                </h1>

                {!isLoading && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                    {/* Title badge — only shown for multi-mass days */}
                    {enTitle && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "rgba(180,83,9,0.12)", border: "1px solid rgba(180,83,9,0.25)",
                          borderRadius: 6, padding: "3px 10px",
                          fontSize: 12, fontWeight: 600, color: "#fbbf24",
                        }}>
                          <Tag size={10} /> {enTitle}
                        </span>
                        {esTitle && esTitle !== enTitle && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                            borderRadius: 6, padding: "3px 10px",
                            fontSize: 12, fontWeight: 600, color: "#c4b5fd",
                          }}>
                            <Tag size={10} /> {esTitle}
                          </span>
                        )}
                      </div>
                    )}
                    <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                      {liturgicalType}
                    </p>
                  </div>
                )}
              </div>

              {/* Edit / Save / Cancel */}
              {!isLoading && (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={handleCancelEdit} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px", borderRadius: 10,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>
                        <X size={14} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={isSaving} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 18px", borderRadius: 10,
                        background: isSaving ? "rgba(180,83,9,0.3)" : "linear-gradient(135deg, #b45309, #92400e)",
                        border: "none", color: "#fef3c7",
                        fontSize: 13, fontWeight: 600,
                        cursor: isSaving ? "not-allowed" : "pointer",
                      }}>
                        {isSaving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                        {isSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "10px 18px", borderRadius: 10,
                      background: "rgba(180,83,9,0.15)",
                      border: "1px solid rgba(180,83,9,0.3)",
                      color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                      <Edit3 size={14} /> Edit Reading
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "80px 0", color: "#6b7280" }}>
              <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#b45309" }} />
              <span style={{ fontSize: 14 }}>Loading reading…</span>
            </div>
          ) : (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* English */}
              <SectionCard icon={Languages} title="English" color="#1d4ed8" badge="EN">
                <AudioPlayer url={enRecord?.readingAudio} label="Reading Audio" color="#3b82f6" />
                <AudioPlayer url={enRecord?.reflectionAudio} label="Reflection Audio" color="#6366f1" />
                {isEditing ? (
                  <EditableField
                    label="Scripture Text (plain text — GPT will reformat on save)"
                    value={contentEN} onChange={setContentEN}
                    placeholder="Paste plain English scripture text here..." rows={12}
                  />
                ) : (
                  <>
                    <HtmlPreview html={enRecord?.content} label="Formatted Reading" />
                    <HtmlPreview html={enRecord?.summary} label="Reflection" />
                  </>
                )}
              </SectionCard>

              {/* Spanish */}
              <SectionCard icon={Languages} title="Spanish" color="#7c3aed" badge="ES">
                <AudioPlayer url={esRecord?.readingAudio} label="Audio de Lectura" color="#8b5cf6" />
                <AudioPlayer url={esRecord?.reflectionAudio} label="Audio de Reflexión" color="#a78bfa" />
                {isEditing ? (
                  <EditableField
                    label="Texto de la Escritura (texto plano — GPT reformateará al guardar)"
                    value={contentES} onChange={setContentES}
                    placeholder="Pega aquí el texto bíblico en español..." rows={12}
                  />
                ) : (
                  <>
                    <HtmlPreview html={esRecord?.content} label="Lectura Formateada" />
                    <HtmlPreview html={esRecord?.summary} label="Reflexión" />
                  </>
                )}
              </SectionCard>

              {/* Replace Audio */}
              <SectionCard icon={Mic} title="Replace Audio Files" color="#b45309">
                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
                  Upload new reading audio files. This only updates the audio URLs — it does not re-run GPT.
                </p>
                <FileUploadButton id="newAudioEN" label="New English Reading Audio" file={newAudioEN}
                  onChange={(e) => setNewAudioEN(e.target.files[0] || null)} />
                <FileUploadButton id="newAudioES" label="New Spanish Reading Audio" file={newAudioES}
                  onChange={(e) => setNewAudioES(e.target.files[0] || null)} />
                <button
                  onClick={handleAudioUpdate}
                  disabled={isSaving || (!newAudioEN && !newAudioES)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "11px 20px", borderRadius: 10, width: "100%",
                    background: (!newAudioEN && !newAudioES) || isSaving ? "rgba(255,255,255,0.04)" : "rgba(180,83,9,0.15)",
                    border: (!newAudioEN && !newAudioES) || isSaving ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(180,83,9,0.3)",
                    color: (!newAudioEN && !newAudioES) || isSaving ? "#374151" : "#fbbf24",
                    fontSize: 13, fontWeight: 600,
                    cursor: (!newAudioEN && !newAudioES) || isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  {isSaving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={14} />}
                  Update Audio Files
                </button>
              </SectionCard>

              {/* Save banner */}
              {isEditing && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, flexWrap: "wrap",
                  padding: "16px 20px",
                  background: "rgba(180,83,9,0.08)",
                  border: "1px solid rgba(180,83,9,0.2)",
                  borderRadius: 12,
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#d97706", lineHeight: 1.5, flex: 1 }}>
                    <strong>Saving will re-run GPT</strong> — content will be reformatted, a new reflection generated, and new audio produced. This may take a minute or two.
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleCancelEdit} style={{
                      padding: "9px 16px", borderRadius: 8,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "9px 18px", borderRadius: 8,
                      background: "linear-gradient(135deg, #b45309, #92400e)",
                      border: "none", color: "#fef3c7",
                      fontSize: 13, fontWeight: 600,
                      cursor: isSaving ? "not-allowed" : "pointer",
                    }}>
                      {isSaving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
                      {isSaving ? "Saving…" : "Save & Reprocess"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditDailyReadingPage;