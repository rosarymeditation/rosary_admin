"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import Head from "next/head";
import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  CheckCircle2,
  Upload,
  BookOpen,
  Languages,
  CalendarDays,
  ArrowRight,
  Loader2,
  RefreshCw,
  ListChecks,
  XCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

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
        <span style={{
          background: color, borderRadius: 10, padding: "6px 8px",
          display: "flex", alignItems: "center",
        }}>
          <Icon size={16} color="#fff" />
        </span>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18, fontWeight: 600, color: "#f0ebe3", letterSpacing: "0.01em",
        }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Date Status Panel ─────────────────────────────────────────────────────────

function StatusRow({ icon: Icon, iconColor, label, value, valueColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <Icon size={14} style={{ color: iconColor, flexShrink: 0 }} />
      <span style={{ color: "#9ca3af" }}>{label}</span>
      <span style={{ marginLeft: "auto", fontWeight: 600, color: valueColor }}>{value}</span>
    </div>
  );
}

function DateStatusPanel({ status }) {
  if (!status) return null;

  if (status.checking) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: "14px 16px",
        fontSize: 13, color: "#9ca3af",
      }}>
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
        Checking for existing reading…
      </div>
    );
  }

  const { hasReading, hasAudioEN, hasAudioES } = status;

  return (
    <div style={{
      background: hasReading ? "rgba(74,180,120,0.05)" : "rgba(248,113,113,0.05)",
      border: hasReading
        ? "1px solid rgba(74,180,120,0.2)"
        : "1px solid rgba(248,113,113,0.2)",
      borderRadius: 12, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Reading status */}
      <StatusRow
        icon={hasReading ? CheckCircle2 : XCircle}
        iconColor={hasReading ? "#6ee7b7" : "#f87171"}
        label="Daily reading"
        value={hasReading ? "Exists for this date" : "Not found — ready to create"}
        valueColor={hasReading ? "#6ee7b7" : "#f87171"}
      />

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* English audio */}
      <StatusRow
        icon={hasAudioEN ? Volume2 : VolumeX}
        iconColor={hasAudioEN ? "#818cf8" : "#6b7280"}
        label="English audio"
        value={hasAudioEN ? "Uploaded" : "Missing"}
        valueColor={hasAudioEN ? "#a5b4fc" : "#6b7280"}
      />

      {/* Spanish audio */}
      <StatusRow
        icon={hasAudioES ? Volume2 : VolumeX}
        iconColor={hasAudioES ? "#818cf8" : "#6b7280"}
        label="Spanish audio"
        value={hasAudioES ? "Uploaded" : "Missing"}
        valueColor={hasAudioES ? "#a5b4fc" : "#6b7280"}
      />
    </div>
  );
}

// ─── File Upload Button ────────────────────────────────────────────────────────

function FileUploadButton({ label, file, onChange, id }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{
        fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#9ca3af",
      }}>
        {label}
      </label>
      <label htmlFor={id} style={{
        display: "flex", alignItems: "center", gap: 10,
        background: file ? "rgba(74,180,120,0.08)" : "rgba(255,255,255,0.04)",
        border: file ? "1px dashed rgba(74,180,120,0.5)" : "1px dashed rgba(255,255,255,0.15)",
        borderRadius: 10, padding: "12px 16px",
        cursor: "pointer", transition: "all 0.2s",
        color: file ? "#6ee7b7" : "#6b7280", fontSize: 13,
      }}>
        {file ? <CheckCircle2 size={16} /> : <Upload size={16} />}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file ? file.name : "Click to select MP3 / AAC file"}
        </span>
      </label>
      <input id={id} type="file" accept="audio/*" onChange={onChange} style={{ display: "none" }} />
    </div>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────

function ActionButton({ onClick, disabled, loading, icon: Icon, label, variant = "primary" }) {
  const styles = {
    primary: {
      background: disabled
        ? "rgba(255,255,255,0.06)"
        : "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
      color: disabled ? "#4b5563" : "#fef3c7",
      border: "none",
    },
    secondary: {
      background: disabled ? "rgba(255,255,255,0.04)" : "rgba(139, 92, 246, 0.15)",
      color: disabled ? "#374151" : "#c4b5fd",
      border: disabled ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(139,92,246,0.3)",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 24px", borderRadius: 10,
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s", width: "100%", letterSpacing: "0.02em",
      }}
    >
      {loading
        ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        : <Icon size={16} />}
      {label}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const CreateDailyReadingPage = () => {
  const [date, setDate] = useState(new Date());
  const [contentEN, setContentEN] = useState("");
  const [contentES, setContentES] = useState("");
  const [enFile, setEnFile] = useState(null);
  const [esFile, setEsFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateStatus, setDateStatus] = useState(null);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);

    // Always clear content + files on date change
    setContentEN("");
    setContentES("");
    setEnFile(null);
    setEsFile(null);
    setDateStatus({ checking: true });

    GlobalApi.checkReadingExist({ date: formatDate(selectedDate) })
      .then((res) => {
        const { hasEnglish, hasSpanish, englishData, spanishData } = res.data;
        const hasReading = hasEnglish || hasSpanish;

        setDateStatus({
          checking: false,
          hasReading,
          hasAudioEN: !!(englishData?.readingAudio),
          hasAudioES: !!(spanishData?.readingAudio),
        });

        // Pre-fill text if a reading already exists so admin can review/overwrite
        if (hasReading) {
          setContentEN(englishData?.content || "");
          setContentES(spanishData?.content || "");
        }
      })
      .catch((err) => {
        console.error("Error checking reading:", err);
        setDateStatus({ checking: false, hasReading: false, hasAudioEN: false, hasAudioES: false });
      });
  };

  const refreshStatus = () => handleDateSelect(date);

  const handleCreate = async () => {
    if (!contentEN) return toast.error("English reading content is required.");
    if (!contentES) return toast.error("Spanish reading content is required.");
    if (!date) return toast.error("Please select a date.");
    if (!enFile) return toast.error("Please upload the English audio file.");
    if (!esFile) return toast.error("Please upload the Spanish audio file.");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("contentEnglish", contentEN);
      formData.append("contentSpanish", contentES);
      formData.append("readingFileEN", enFile);
      formData.append("readingFileES", esFile);
      formData.append("date", formatDate(new Date(date)));

      const result = await GlobalApi.createDailyReading(formData);
      if (!result.data.error) {
        toast.success(result.data.message || "Reading saved successfully!");
        setContentEN("");
        setContentES("");
        setEnFile(null);
        setEsFile(null);
        refreshStatus();
      } else {
        toast.error(result.data.message || "An error occurred.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAudioOnly = async () => {
    if (!date) return toast.error("Please select a date.");
    if (!enFile) return toast.error("Please upload the English audio file.");
    if (!esFile) return toast.error("Please upload the Spanish audio file.");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("readingFileEN", enFile);
      formData.append("readingFileES", esFile);
      formData.append("date", formatDate(new Date(date)));

      const result = await GlobalApi.updateCreateDailyReading(formData);
      if (!result.data.error) {
        toast.success(result.data.message || "Audio updated successfully!");
        setEnFile(null);
        setEsFile(null);
        refreshStatus();
      } else {
        toast.error(result.data.message || "An error occurred.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .page-fade { animation: fadeIn 0.5s ease forwards; }
        .status-slide { animation: slideDown 0.25s ease forwards; }
        textarea { font-family: 'DM Sans', sans-serif !important; }
        textarea::placeholder { color: #4b5563 !important; }
      `}</style>

      <div className="page-fade" style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f0c08 0%, #1a1208 50%, #0d1117 100%)",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 16px 80px",
      }}>
        {/* Header */}
        <div style={{ maxWidth: 760, margin: "0 auto 36px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(180, 83, 9, 0.15)", border: "1px solid rgba(180, 83, 9, 0.3)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 20,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#fbbf24",
          }}>
            <BookOpen size={12} />
            Catholic Daily Reading — Admin
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 700, color: "#fef3c7", lineHeight: 1.1, margin: 0, marginBottom: 10,
          }}>
            Create Daily Reading
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            Select a date, paste the scripture text, upload audio — done.
          </p>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Calendar + Status ─────────────────────────────────────── */}
          <SectionCard icon={CalendarDays} title="Select Date" color="#b45309">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 8,
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md"
                  style={{ color: "#f0ebe3" }}
                />
              </div>
            </div>

            <div style={{
              textAlign: "center", fontSize: 13, color: "#9ca3af",
              borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12,
            }}>
              Selected:{" "}
              <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                {date?.toLocaleDateString("en-GB", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>

            {/* Status panel — always shown after a date is selected */}
            {dateStatus && (
              <div className="status-slide">
                <DateStatusPanel status={dateStatus} />
              </div>
            )}
          </SectionCard>

          {/* ── English ───────────────────────────────────────────────── */}
          <SectionCard icon={Languages} title="English Reading" color="#1d4ed8">
            <FileUploadButton
              id="enFile" label="English Audio File" file={enFile}
              onChange={(e) => setEnFile(e.target.files[0] || null)}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "#9ca3af",
              }}>
                Scripture Text (English)
              </label>
              <textarea
                value={contentEN}
                onChange={(e) => setContentEN(e.target.value)}
                placeholder="Paste the plain English scripture text here — not HTML formatted..."
                style={{
                  width: "100%", height: 220,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "12px 14px",
                  color: "#f0ebe3", fontSize: 14, lineHeight: 1.7,
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ textAlign: "right", fontSize: 12, color: "#4b5563" }}>
                {contentEN.length.toLocaleString()} characters
              </div>
            </div>
          </SectionCard>

          {/* ── Spanish ───────────────────────────────────────────────── */}
          <SectionCard icon={Languages} title="Spanish Reading" color="#7c3aed">
            <FileUploadButton
              id="esFile" label="Spanish Audio File" file={esFile}
              onChange={(e) => setEsFile(e.target.files[0] || null)}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "#9ca3af",
              }}>
                Scripture Text (Spanish)
              </label>
              <textarea
                value={contentES}
                onChange={(e) => setContentES(e.target.value)}
                placeholder="Pega aquí el texto bíblico en español — sin formato HTML..."
                style={{
                  width: "100%", height: 220,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "12px 14px",
                  color: "#f0ebe3", fontSize: 14, lineHeight: 1.7,
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ textAlign: "right", fontSize: 12, color: "#4b5563" }}>
                {contentES.length.toLocaleString()} characters
              </div>
            </div>
          </SectionCard>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ActionButton
              onClick={handleCreate}
              disabled={!contentEN || !contentES || !enFile || !esFile || isLoading}
              loading={isLoading}
              icon={ArrowRight}
              label="Create Reading (Format + Reflect + Generate Audio)"
              variant="primary"
            />
            <ActionButton
              onClick={handleUpdateAudioOnly}
              disabled={!enFile || !esFile || isLoading}
              loading={isLoading}
              icon={RefreshCw}
              label="Update Audio Files Only"
              variant="secondary"
            />
          </div>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <div style={{
            display: "flex", justifyContent: "center",
            paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
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