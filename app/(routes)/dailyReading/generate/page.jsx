"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import Head from "next/head";
import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  CheckCircle2, Upload, BookOpen, Languages, CalendarDays,
  ArrowRight, Loader2, ListChecks, XCircle, Volume2,
  VolumeX, Plus, Trash2, ChevronDown, ChevronUp,
  FileText, Mic, Sparkles,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const newBlock = () => ({
  id: crypto.randomUUID(),
  massTitle: "",     // English title — e.g. "Mass of the Lord's Supper"
  massTitleES: "",   // Spanish title — e.g. "Misa de la Cena del Señor"
  contentEN: "",
  contentES: "",
  enFile: null,
  esFile: null,
  isOpen: true,
  step: null,       // null | "uploading_audio" | "generating" | "done" | "error"
  stepMessage: "",
  saved: false,
});

// ─── Step Progress Bar ─────────────────────────────────────────────────────────

const STEPS = [
  { key: "uploading_audio", icon: Mic, label: "Uploading audio" },
  { key: "generating", icon: Sparkles, label: "GPT formatting" },
  { key: "done", icon: CheckCircle2, label: "Saved" },
];

function StepProgress({ step }) {
  if (!step) return null;
  const activeIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "12px 16px", marginTop: 4,
    }}>
      {STEPS.map((s, i) => {
        const done = i < activeIdx || step === "done";
        const active = STEPS[activeIdx]?.key === s.key;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.key}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "rgba(74,180,120,0.2)" : active ? "rgba(180,83,9,0.25)" : "rgba(255,255,255,0.05)",
                border: done ? "1px solid rgba(74,180,120,0.4)" : active ? "1px solid rgba(180,83,9,0.5)" : "1px solid rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}>
                {active && !done
                  ? <Loader2 size={12} style={{ color: "#fbbf24", animation: "spin 1s linear infinite" }} />
                  : <Icon size={12} style={{ color: done ? "#6ee7b7" : active ? "#fbbf24" : "#4b5563" }} />
                }
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: done ? "#6ee7b7" : active ? "#fbbf24" : "#4b5563", whiteSpace: "nowrap" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: 1, flex: 1, maxWidth: 32,
                background: done ? "rgba(74,180,120,0.3)" : "rgba(255,255,255,0.06)",
                margin: "0 4px",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, color, children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "24px",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: color, borderRadius: 10, padding: "6px 8px", display: "flex", alignItems: "center" }}>
          <Icon size={16} color="#fff" />
        </span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: "#f0ebe3" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Date Status Panel ─────────────────────────────────────────────────────────
// Uses `title` (the human label) not `type` (which is "Year II" etc.)

function DateStatusPanel({ status }) {
  if (!status) return null;

  if (status.checking) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#9ca3af",
      }}>
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
        Checking for existing readings…
      </div>
    );
  }

  const { existingReadings } = status;
  const hasAny = existingReadings?.length > 0;

  return (
    <div style={{
      background: hasAny ? "rgba(74,180,120,0.05)" : "rgba(248,113,113,0.05)",
      border: hasAny ? "1px solid rgba(74,180,120,0.2)" : "1px solid rgba(248,113,113,0.2)",
      borderRadius: 12, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        {hasAny
          ? <CheckCircle2 size={15} style={{ color: "#6ee7b7" }} />
          : <XCircle size={15} style={{ color: "#f87171" }} />}
        <span style={{ fontWeight: 600, color: hasAny ? "#6ee7b7" : "#f87171" }}>
          {hasAny
            ? `${existingReadings.length} reading set${existingReadings.length > 1 ? "s" : ""} saved for this date`
            : "No readings found — ready to create"}
        </span>
      </div>

      {hasAny && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 }}>
          {existingReadings.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", fontSize: 12,
            }}>
              {/* ✅ Show title (mass label) not type (liturgical cycle) */}
              <span style={{ color: "#d1c7b8", fontWeight: 500 }}>
                {r.title || r.type || "Reading"}
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: r.hasAudioEN ? "#a5b4fc" : "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                  {r.hasAudioEN ? <Volume2 size={11} /> : <VolumeX size={11} />} EN
                </span>
                <span style={{ color: r.hasAudioES ? "#a5b4fc" : "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                  {r.hasAudioES ? <Volume2 size={11} /> : <VolumeX size={11} />} ES
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── File Upload Button ────────────────────────────────────────────────────────

function FileUploadButton({ label, file, onChange, id, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>
        {label}
      </label>
      <label htmlFor={!disabled ? id : undefined} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: file ? "rgba(74,180,120,0.08)" : "rgba(255,255,255,0.03)",
        border: file ? "1px dashed rgba(74,180,120,0.5)" : "1px dashed rgba(255,255,255,0.12)",
        borderRadius: 8, padding: "10px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        color: file ? "#6ee7b7" : "#6b7280", fontSize: 12, opacity: disabled ? 0.5 : 1,
      }}>
        {file ? <CheckCircle2 size={14} /> : <Upload size={14} />}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file ? file.name : "Click to select audio file"}
        </span>
      </label>
      <input id={id} type="file" accept="audio/*" onChange={onChange} style={{ display: "none" }} disabled={disabled} />
    </div>
  );
}

// ─── Reading Block ─────────────────────────────────────────────────────────────

function ReadingBlock({ block, index, total, onChange, onRemove, onSave, date }) {
  const { id, massTitle, massTitleES, contentEN, contentES, enFile, esFile, isOpen, step, saved } = block;
  const isBusy = step && step !== "done" && step !== "error";
  const canSave = massTitle.trim() && massTitleES.trim() && contentEN.trim() && contentES.trim() && enFile && esFile && !isBusy && !saved;

  return (
    <div style={{
      background: saved ? "rgba(74,180,120,0.04)" : "rgba(255,255,255,0.025)",
      border: saved ? "1px solid rgba(74,180,120,0.2)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, overflow: "hidden", transition: "border-color 0.3s",
    }}>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 18px", background: "rgba(255,255,255,0.02)",
          borderBottom: isOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
          cursor: "pointer",
        }}
        onClick={() => !isBusy && onChange(id, "isOpen", !isOpen)}
      >
        <span style={{
          width: 26, height: 26, borderRadius: "50%",
          background: saved ? "rgba(74,180,120,0.2)" : "rgba(180,83,9,0.2)",
          border: saved ? "1px solid rgba(74,180,120,0.4)" : "1px solid rgba(180,83,9,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: saved ? "#6ee7b7" : "#fbbf24", flexShrink: 0,
        }}>
          {isBusy
            ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
            : saved ? "✓" : index + 1}
        </span>

        <span style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600, color: "#f0ebe3" }}>
          {massTitle || `Reading Set ${index + 1}`}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {saved && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#6ee7b7",
              background: "rgba(74,180,120,0.1)", border: "1px solid rgba(74,180,120,0.2)",
              borderRadius: 6, padding: "2px 8px",
            }}>
              Saved
            </span>
          )}
          {total > 1 && !isBusy && !saved && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)",
                color: "#f87171", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
          {!isBusy && (isOpen
            ? <ChevronUp size={16} style={{ color: "#6b7280" }} />
            : <ChevronDown size={16} style={{ color: "#6b7280" }} />)}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {step && <StepProgress step={step} />}

          {/* Mass title input */}
          {!saved && (
            <>
              {/* English mass title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>
                  Mass / Liturgy Title — English *
                </label>
                <input
                  value={massTitle}
                  onChange={(e) => onChange(id, "massTitle", e.target.value)}
                  disabled={isBusy}
                  placeholder="e.g. Mass of the Lord's Supper, Chrism Mass, Easter Vigil…"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    padding: "10px 12px", color: "#f0ebe3", fontSize: 13,
                    outline: "none", fontFamily: "'DM Sans', sans-serif",
                    boxSizing: "border-box", opacity: isBusy ? 0.5 : 1,
                  }}
                />
                <span style={{ fontSize: 11, color: "#4b5563" }}>
                  Shown to English users to distinguish multiple masses on the same day.
                </span>
              </div>

              {/* Spanish mass title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8b5cf6" }}>
                  Mass / Liturgy Title — Spanish *
                </label>
                <input
                  value={massTitleES}
                  onChange={(e) => onChange(id, "massTitleES", e.target.value)}
                  disabled={isBusy}
                  placeholder="e.g. Misa de la Cena del Señor, Misa Crismal, Vigilia Pascual…"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(139,92,246,0.25)", borderRadius: 8,
                    padding: "10px 12px", color: "#f0ebe3", fontSize: 13,
                    outline: "none", fontFamily: "'DM Sans', sans-serif",
                    boxSizing: "border-box", opacity: isBusy ? 0.5 : 1,
                  }}
                />
                <span style={{ fontSize: 11, color: "#4b5563" }}>
                  Shown to Spanish-language users in the app.
                </span>
              </div>
            </>
          )}

          {/* EN + ES columns */}
          {!saved && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* English */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3b82f6" }}>
                  English
                </span>
                <FileUploadButton
                  id={`enFile-${id}`} label="Audio (EN)"
                  file={enFile} disabled={isBusy}
                  onChange={(e) => onChange(id, "enFile", e.target.files[0] || null)}
                />
                <textarea
                  value={contentEN}
                  onChange={(e) => onChange(id, "contentEN", e.target.value)}
                  disabled={isBusy}
                  placeholder="Paste plain English scripture text…"
                  rows={10}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                    padding: "10px 12px", color: "#f0ebe3", fontSize: 13,
                    lineHeight: 1.7, resize: "vertical", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
                    opacity: isBusy ? 0.5 : 1,
                  }}
                />
                <div style={{ textAlign: "right", fontSize: 11, color: "#4b5563" }}>
                  {contentEN.length.toLocaleString()} chars
                </div>
              </div>

              {/* Spanish */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8b5cf6" }}>
                  Spanish
                </span>
                <FileUploadButton
                  id={`esFile-${id}`} label="Audio (ES)"
                  file={esFile} disabled={isBusy}
                  onChange={(e) => onChange(id, "esFile", e.target.files[0] || null)}
                />
                <textarea
                  value={contentES}
                  onChange={(e) => onChange(id, "contentES", e.target.value)}
                  disabled={isBusy}
                  placeholder="Pega el texto bíblico en español…"
                  rows={10}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                    padding: "10px 12px", color: "#f0ebe3", fontSize: 13,
                    lineHeight: 1.7, resize: "vertical", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
                    opacity: isBusy ? 0.5 : 1,
                  }}
                />
                <div style={{ textAlign: "right", fontSize: 11, color: "#4b5563" }}>
                  {contentES.length.toLocaleString()} chars
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          {!saved && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#6b7280",
              }}>
                <FileText size={13} style={{ flexShrink: 0, marginTop: 1, color: "#4b5563" }} />
                <span>
                  <strong style={{ color: "#9ca3af" }}>Two steps: </strong>
                  Audio uploads first (fast), then GPT formats the reading and generates reflection audio.
                  Each step is independent — if GPT fails, the audio is already safely saved.
                </span>
              </div>

              <button
                onClick={() => onSave(id, date)}
                disabled={!canSave}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 20px", borderRadius: 10, width: "100%",
                  background: !canSave ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #b45309, #92400e)",
                  border: !canSave ? "1px solid rgba(255,255,255,0.08)" : "none",
                  color: !canSave ? "#4b5563" : "#fef3c7",
                  fontSize: 13, fontWeight: 600,
                  cursor: !canSave ? "not-allowed" : "pointer",
                }}
              >
                {isBusy
                  ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  : <ArrowRight size={14} />}
                {isBusy ? "Processing…" : `Save "${massTitle || `Reading Set ${index + 1}`}"`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const CreateDailyReadingPage = () => {
  const [date, setDate] = useState(new Date());
  const [dateStatus, setDateStatus] = useState(null);
  const [blocks, setBlocks] = useState([newBlock()]);

  const updateBlock = (id, field, value) =>
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));

  const updateBlockMany = (id, patch) =>
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...patch } : b));

  // ── Check what already exists for a date ───────────────────────────────────
  // Uses findAllByDate so we get ALL reading sets (not just one)
  const fetchStatus = (selectedDate) => {
    setDateStatus({ checking: true });
    GlobalApi.searchDailyReadingByDate({ date: formatDate(selectedDate) })
      .then((res) => {
        const all = res.data?.data || [];
        // Group into unique reading sets by title
        const seen = new Map();
        for (const r of all) {
          const key = r.title || r.type || "unknown";
          if (!seen.has(key)) {
            seen.set(key, {
              title: r.title || "",
              type: r.type || "",
              hasAudioEN: false,
              hasAudioES: false,
            });
          }
          const entry = seen.get(key);
          const isEN = r.language?.name?.toLowerCase().includes("english") ||
            r.language === "650294586a369b86e4f201f0";
          if (isEN) entry.hasAudioEN = !!(r.readingAudio);
          else entry.hasAudioES = !!(r.readingAudio);
        }
        setDateStatus({ checking: false, existingReadings: [...seen.values()] });
      })
      .catch(() => setDateStatus({ checking: false, existingReadings: [] }));
  };

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setBlocks([newBlock()]);
    fetchStatus(selectedDate);
  };

  // ── Save a single reading block ────────────────────────────────────────────

  const handleSaveBlock = async (id, currentDate) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const dateStr = formatDate(new Date(currentDate));

    // Step 1 — upload audio only (fast, no GPT)
    updateBlockMany(id, { step: "uploading_audio", isOpen: true });

    try {
      const audioForm = new FormData();
      audioForm.append("readingFileEN", block.enFile);
      audioForm.append("readingFileES", block.esFile);
      audioForm.append("date", dateStr);
      audioForm.append("typeOverride", block.massTitle.trim());   // EN title → saved as `title` on EN record
      audioForm.append("typeOverrideES", block.massTitleES.trim()); // ES title → saved as `title` on ES record

      const audioResult = await GlobalApi.updateCreateDailyReading(audioForm);
      if (audioResult.data.error) throw new Error(audioResult.data.message || "Audio upload failed");

      toast.success(`Audio uploaded for "${block.massTitle}"`);
    } catch (err) {
      console.error("Step 1 failed:", err);
      toast.error(`Audio upload failed: ${err.message}`);
      updateBlockMany(id, { step: "error" });
      return;
    }

    // Step 2 — GPT format + reflection + reflection audio
    updateBlockMany(id, { step: "generating" });

    try {
      const gptForm = new FormData();
      gptForm.append("contentEnglish", block.contentEN);
      gptForm.append("contentSpanish", block.contentES);
      gptForm.append("readingFileEN", block.enFile);
      gptForm.append("readingFileES", block.esFile);
      gptForm.append("date", dateStr);
      gptForm.append("typeOverride", block.massTitle.trim());   // EN title
      gptForm.append("typeOverrideES", block.massTitleES.trim()); // ES title

      const gptResult = await GlobalApi.createDailyReading(gptForm);
      if (gptResult.data.error) throw new Error(gptResult.data.message || "GPT processing failed");

      toast.success(`"${block.massTitle}" fully saved!`);
      updateBlockMany(id, { step: "done", saved: true, isOpen: false });
      fetchStatus(currentDate);
    } catch (err) {
      console.error("Step 2 failed:", err);
      toast.warning(`"${block.massTitle}" audio saved, but GPT formatting failed. Retry from the Edit page.`);
      updateBlockMany(id, { step: "done", saved: true, isOpen: false });
      fetchStatus(currentDate);
    }
  };

  const savedCount = blocks.filter((b) => b.saved).length;

  return (
    <>
      <Head>
        <title>Create Daily Reading — Admin</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); }    to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .page-fade   { animation: fadeIn   0.5s  ease forwards; }
        .status-slide { animation: slideDown 0.25s ease forwards; }
        textarea, input[type=text] { font-family: 'DM Sans', sans-serif !important; }
        textarea::placeholder, input::placeholder { color: #4b5563 !important; }
        @media (max-width: 640px) { .reading-cols { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="page-fade" style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f0c08 0%, #1a1208 50%, #0d1117 100%)",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 16px 80px",
      }}>
        {/* Header */}
        <div style={{ maxWidth: 900, margin: "0 auto 36px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(180,83,9,0.15)", border: "1px solid rgba(180,83,9,0.3)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 20,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#fbbf24",
          }}>
            <BookOpen size={12} />
            Catholic Daily Reading — Admin
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 700, color: "#fef3c7", lineHeight: 1.1, margin: 0, marginBottom: 10,
          }}>
            Create Daily Reading
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            Each reading set is saved independently — no timeouts, no waiting for all to finish.
          </p>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Calendar */}
          <SectionCard icon={CalendarDays} title="Select Date" color="#b45309">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <Calendar mode="single" selected={date} onSelect={handleDateSelect} className="rounded-md" />
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
              Selected:{" "}
              <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                {date?.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            {dateStatus && <div className="status-slide"><DateStatusPanel status={dateStatus} /></div>}
          </SectionCard>

          {/* Reading Blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#fef3c7", margin: 0 }}>
                  Reading Sets
                </h2>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                  {blocks.length} set{blocks.length !== 1 ? "s" : ""} — {savedCount} saved
                </p>
              </div>
              <button
                onClick={() => {
                  setBlocks((prev) => [...prev, newBlock()]);
                  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 10,
                  background: "rgba(180,83,9,0.12)", border: "1px solid rgba(180,83,9,0.3)",
                  color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Plus size={15} /> Add Reading Set
              </button>
            </div>

            {blocks.map((block, i) => (
              <ReadingBlock
                key={block.id}
                block={block}
                index={i}
                total={blocks.length}
                onChange={updateBlock}
                onRemove={(id) => setBlocks((prev) => prev.filter((b) => b.id !== id))}
                onSave={handleSaveBlock}
                date={date}
              />
            ))}

            <button
              onClick={() => {
                setBlocks((prev) => [...prev, newBlock()]);
                setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
              }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px", borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.1)",
                color: "#4b5563", fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}
            >
              <Plus size={15} /> Add another reading set
            </button>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/dailyReading/list" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#b45309", fontSize: 14, fontWeight: 500, textDecoration: "none",
            }}>
              <ListChecks size={15} />
              View all readings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateDailyReadingPage;