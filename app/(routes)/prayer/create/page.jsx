"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import Head from "next/head";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronLeft, ImagePlus, Music, X, UploadCloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function PrayerCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [audioFile, setAudioFile] = useState(null);
  const [audioName, setAudioName] = useState("");
  const [audioDragging, setAudioDragging] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const photoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (file) => {
    if (!file) return;
    const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/aac"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a valid audio file (MP3, WAV, AAC).");
      return;
    }
    setAudioFile(file);
    setAudioName(file.name);
  };

  const handleAudioDrop = (e) => {
    e.preventDefault();
    setAudioDragging(false);
    const file = e.dataTransfer.files[0];
    handleAudioChange(file);
  };

  const handleCreate = () => {
    if (!selectedLanguage) { toast.error("Please select a language."); return; }
    if (!selectedType) { toast.error("Please select a prayer type."); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("language", selectedLanguage);
    formData.append("type", selectedType);
    if (photoFile) formData.append("photo", photoFile);
    if (audioFile) formData.append("audio", audioFile);

    setIsLoading(true);
    GlobalApi.createPrayer(formData)
      .then((result) => {
        if (!result.data.error) {
          toast.success("Prayer created successfully.");
          router.push("/prayer/list");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      })
      .catch(() => toast.error("Network error. Please try again."))
      .finally(() => setIsLoading(false));
  };

  const isValid = title.trim() && content.trim() && selectedLanguage && selectedType;

  return (
    <>
      <Head><title>Create Prayer</title></Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Lato:wght@300;400;700&display=swap');

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
          --border-focus: #7c4d2f;
          --success: #3d7a5a;
          --red: #b03030;
          --radius: 6px;
          --shadow: 0 1px 3px rgba(28,26,23,0.08), 0 4px 16px rgba(28,26,23,0.06);
        }

        .cp-root {
          min-height: 100vh;
          background: var(--bg);
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%237c4d2f' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
          font-family: 'Lato', sans-serif;
          padding: 40px 16px 80px;
        }

        .cp-layout {
          max-width: 780px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .cp-layout { grid-template-columns: 1fr; }
        }

        .cp-nav {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .cp-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--ink-muted);
          font-size: 13px;
          text-decoration: none;
          transition: color 0.15s;
          font-family: 'Lato', sans-serif;
        }
        .cp-back:hover { color: var(--accent); }

        .cp-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          background: var(--accent-light);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .cp-main {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .cp-main-header {
          padding: 32px 36px 24px;
          border-bottom: 1px solid var(--border);
        }

        .cp-heading {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 4px;
          line-height: 1.15;
        }

        .cp-subheading {
          font-size: 13px;
          color: var(--ink-muted);
          font-weight: 300;
        }

        .cp-main-body {
          padding: 28px 36px 36px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .cp-field { display: flex; flex-direction: column; gap: 7px; }

        .cp-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }

        .cp-input {
          width: 100%;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: #fdfcfb;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 11px 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .cp-input::placeholder { color: var(--ink-faint); }
        .cp-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(124,77,47,0.1);
        }

        .cp-textarea {
          min-height: 200px;
          resize: vertical;
          line-height: 1.75;
        }

        .cp-select {
          width: 100%;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: #fdfcfb;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 11px 36px 11px 14px;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237c4d2f' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          box-sizing: border-box;
        }
        .cp-select:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(124,77,47,0.1);
        }

        .cp-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .cp-sidebar { display: flex; flex-direction: column; gap: 16px; }

        .cp-panel {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .cp-panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
        }

        .cp-panel-icon {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .cp-panel-icon svg { width: 14px; height: 14px; }

        .cp-panel-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .cp-panel-subtitle { font-size: 11px; color: var(--ink-faint); }

        .cp-panel-body { padding: 16px 18px; }

        /* Photo */
        .cp-photo-zone {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          transition: border-color 0.15s;
          overflow: hidden;
          min-height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cp-photo-zone:hover { border-color: var(--accent); }

        .cp-photo-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 16px;
          color: var(--ink-faint);
          text-align: center;
        }
        .cp-photo-placeholder svg { color: var(--accent); opacity: 0.5; width: 26px; height: 26px; }
        .cp-photo-placeholder strong { font-size: 12px; color: var(--ink-muted); font-weight: 600; }
        .cp-photo-placeholder span { font-size: 11px; }

        .cp-photo-preview-wrap {
          position: relative;
          width: 100%;
          height: 150px;
        }

        .cp-photo-overlay {
          position: absolute;
          inset: 0;
          background: rgba(28,26,23,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cp-photo-zone:hover .cp-photo-overlay { opacity: 1; }

        .cp-photo-remove {
          position: absolute;
          top: 8px; right: 8px;
          width: 24px; height: 24px;
          background: rgba(28,26,23,0.65);
          border: none;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.15s;
        }
        .cp-photo-remove:hover { background: var(--red); }

        /* Audio */
        .cp-audio-drop {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 20px 16px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .cp-audio-drop:hover, .cp-audio-drop.dragging {
          border-color: var(--accent);
          background: var(--accent-light);
        }
        .cp-audio-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          pointer-events: none;
        }
        .cp-audio-inner svg { color: var(--accent); opacity: 0.55; width: 22px; height: 22px; }
        .cp-audio-inner strong { font-size: 12px; color: var(--ink-muted); }
        .cp-audio-inner span { font-size: 11px; color: var(--ink-faint); }

        .cp-audio-success {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 13px;
          background: #f0faf5;
          border: 1px solid #a8d5bc;
          border-radius: var(--radius);
        }
        .cp-audio-success svg { color: var(--success); flex-shrink: 0; width: 17px; height: 17px; }
        .cp-audio-success-info { flex: 1; min-width: 0; }
        .cp-audio-success-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cp-audio-success-sub { font-size: 11px; color: var(--success); }
        .cp-audio-rm {
          background: none;
          border: none;
          color: var(--ink-faint);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .cp-audio-rm:hover { color: var(--red); }

        /* Submit */
        .cp-submit {
          width: 100%;
          padding: 13px;
          background: var(--accent);
          border: none;
          border-radius: var(--radius);
          color: white;
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(124,77,47,0.25);
        }
        .cp-submit:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(124,77,47,0.32);
        }
        .cp-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .cp-hint {
          font-size: 11px;
          color: var(--ink-faint);
          text-align: center;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>

      {/* Hidden file inputs — display:none so they never receive direct clicks */}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={photoInputRef}
        onChange={handlePhotoChange}
      />
      <input
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        ref={audioInputRef}
        onChange={(e) => handleAudioChange(e.target.files[0])}
      />

      <div className="cp-root">
        <div className="cp-layout">

          {/* Nav */}
          <div className="cp-nav">
            <Link href="/prayer/list" className="cp-back">
              <ChevronLeft size={14} /> All Prayers
            </Link>
            <span className="cp-badge">New Prayer</span>
          </div>

          {/* ── Main ── */}
          <div className="cp-main">
            <div className="cp-main-header">
              <h1 className="cp-heading">Create Prayer</h1>
              <p className="cp-subheading">Add a new prayer to the collection</p>
            </div>

            <div className="cp-main-body">

              <div className="cp-field">
                <label className="cp-label">Title</label>
                <input
                  className="cp-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter prayer title"
                />
              </div>

              <div className="cp-row">
                <div className="cp-field">
                  <label className="cp-label">Language</label>
                  <select className="cp-select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                    <option value="">Select language</option>
                    <option value="6502946f6a369b86e4f201f2">Spanish</option>
                    <option value="650294586a369b86e4f201f0">English</option>
                  </select>
                </div>
                <div className="cp-field">
                  <label className="cp-label">Type</label>
                  <select className="cp-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="">Select type</option>
                    <option value="6502ec837377d628e7187a53">Catholic</option>
                    <option value="6502ec907377d628e7187a55">Others</option>
                    <option value="65356b8812e66ebd41c5c6c3">Novena</option>
                  </select>
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label">Content</label>
                <textarea
                  className="cp-input cp-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the prayer text here..."
                />
              </div>

            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="cp-sidebar">

            {/* Photo panel */}
            <div className="cp-panel">
              <div className="cp-panel-header">
                <div className="cp-panel-icon"><ImagePlus /></div>
                <div>
                  <div className="cp-panel-title">Cover Photo</div>
                  <div className="cp-panel-subtitle">Optional · JPG, PNG, WEBP</div>
                </div>
              </div>
              <div className="cp-panel-body">
                <div className="cp-photo-zone" onClick={() => photoInputRef.current?.click()}>
                  {photoPreview ? (
                    <>
                      <div className="cp-photo-preview-wrap">
                        <Image src={photoPreview} alt="Preview" fill style={{ objectFit: "cover" }} />
                        <div className="cp-photo-overlay"><ImagePlus size={13} /> Change</div>
                      </div>
                      <button
                        className="cp-photo-remove"
                        onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(""); }}
                      >
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    <div className="cp-photo-placeholder">
                      <ImagePlus />
                      <strong>Click to upload</strong>
                      <span>PNG, JPG, WEBP · max 10MB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Audio panel */}
            <div className="cp-panel">
              <div className="cp-panel-header">
                <div className="cp-panel-icon"><Music /></div>
                <div>
                  <div className="cp-panel-title">Audio</div>
                  <div className="cp-panel-subtitle">Optional · MP3, WAV, AAC</div>
                </div>
              </div>
              <div className="cp-panel-body">
                {audioFile ? (
                  <div className="cp-audio-success">
                    <CheckCircle2 />
                    <div className="cp-audio-success-info">
                      <div className="cp-audio-success-name">{audioName}</div>
                      <div className="cp-audio-success-sub">Ready to upload</div>
                    </div>
                    <button className="cp-audio-rm" onClick={() => { setAudioFile(null); setAudioName(""); }}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`cp-audio-drop${audioDragging ? " dragging" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setAudioDragging(true); }}
                    onDragLeave={() => setAudioDragging(false)}
                    onDrop={handleAudioDrop}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <div className="cp-audio-inner">
                      <UploadCloud />
                      <strong>Drop file or click to browse</strong>
                      <span>MP3, WAV, AAC · max 50MB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit panel */}
            <div className="cp-panel">
              <div className="cp-panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button className="cp-submit" disabled={!isValid || isLoading} onClick={handleCreate}>
                  {isLoading
                    ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                    : "Create Prayer"
                  }
                </button>
                <p className="cp-hint">Title, content, language &amp; type required.<br />Photo and audio are optional.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}