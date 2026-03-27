"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Loader2,
    ChevronLeft,
    ImagePlus,
    X,
    Plus,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Sparkles,
    Zap,
    User,
    ClipboardPaste,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import GlobalApi from "@/app/_utils/GlobalApi";

const CATEGORIES = [
    "Marian",
    "Liturgical",
    "Eucharistic",
    "Healing",
    "Novena",
    "Scripture",
    "Saint",
    "Virtue",
    "Prayer",
    "Reflection",
    "Liturgical",
    "Fasting",
    "Lent",
    "Marriage",
];

const LANGUAGES = [
    { label: "Spanish", value: "6502946f6a369b86e4f201f2" },
    { label: "English", value: "650294586a369b86e4f201f0" },
];

const emptyDay = (dayNumber) => ({
    dayNumber,
    title: "",
    scripture: "",
    reflection: "",
    saintReflection: "",
    prayers: [""],
    actions: [""],
});

export default function PlanCreatePage() {
    const router = useRouter();

    // Plan-level fields
    const [slug, setSlug] = useState("");
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [language, setLanguage] = useState("");
    const [isFree, setIsFree] = useState(false);

    // Photo
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const photoInputRef = useRef(null);

    // Daily items
    const [days, setDays] = useState([emptyDay(1)]);
    const [expandedDay, setExpandedDay] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    // JSON import
    const [jsonInput, setJsonInput] = useState("");
    const [jsonStatus, setJsonStatus] = useState(null); // null | "success" | "error"
    const [jsonError, setJsonError] = useState("");

    // ── Helpers ──────────────────────────────────────────────

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };


    const updateDay = (idx, field, value) => {
        setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
    };

    const updateListItem = (dayIdx, field, itemIdx, value) => {
        setDays((prev) =>
            prev.map((d, i) => {
                if (i !== dayIdx) return d;
                const arr = [...d[field]];
                arr[itemIdx] = value;
                return { ...d, [field]: arr };
            })
        );
    };

    const addListItem = (dayIdx, field) => {
        setDays((prev) =>
            prev.map((d, i) => (i === dayIdx ? { ...d, [field]: [...d[field], ""] } : d))
        );
    };

    const removeListItem = (dayIdx, field, itemIdx) => {
        setDays((prev) =>
            prev.map((d, i) =>
                i !== dayIdx ? d : { ...d, [field]: d[field].filter((_, j) => j !== itemIdx) }
            )
        );
    };

    const autoSlug = (val) => {
        setName(val);
        if (!slug) setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    };

    const handleImportJson = () => {
        setJsonStatus(null);
        setJsonError("");
        try {
            const parsed = JSON.parse(jsonInput);
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            const mapped = arr.map((d, i) => ({
                dayNumber: d.dayNumber ?? i + 1,
                title: d.title ?? "",
                scripture: d.scripture ?? "",
                reflection: d.reflection ?? "",
                saintReflection: d.saintReflection ?? "",
                prayers: Array.isArray(d.prayers) && d.prayers.length ? d.prayers : [""],
                actions: Array.isArray(d.actions) && d.actions.length ? d.actions : [""],
            }));
            setDays(mapped);
            setExpandedDay(0);
            setJsonStatus("success");
            toast.success(`Imported ${mapped.length} day${mapped.length > 1 ? "s" : ""} successfully.`);
        } catch (e) {
            setJsonStatus("error");
            setJsonError("Invalid JSON — please check the format and try again.");
        }
    };

    // ── Submit ────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!slug || !name || !category || !language) {
            toast.error("Please fill all required fields.");
            return;
        }
        const cleanDays = days.map((d) => ({
            ...d,
            prayers: d.prayers.filter((p) => p.trim()),
            actions: d.actions.filter((a) => a.trim()),
        }));

        const formData = new FormData();
        formData.append("slug", slug);
        formData.append("name", name);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("totalDays", days.length);
        formData.append("dailyItems", JSON.stringify(cleanDays));
        formData.append("code", LANGUAGES.find((l) => l.value === language)?.label === "Spanish" ? "1" : "0");
        formData.append("isFree", isFree);
        if (photoFile) formData.append("photo", photoFile);

        setIsLoading(true);
        try {
            await GlobalApi.createPlan(formData);
            toast.success("Plan created successfully.");
            router.push("/plan/list");
        } catch {
            toast.error("Failed to create plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isValid = slug && name && category && language;

    // ── Render ────────────────────────────────────────────────

    return (
        <>
            <Head><title>Create Plan</title></Head>

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
          --red: #b03030;
          --radius: 6px;
          --shadow: 0 1px 3px rgba(28,26,23,0.08), 0 4px 16px rgba(28,26,23,0.06);
        }

        .pc-root {
          min-height: 100vh;
          background: var(--bg);
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%237c4d2f' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
          font-family: 'Lato', sans-serif;
          padding: 40px 16px 80px;
        }

        .pc-layout {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) { .pc-layout { grid-template-columns: 1fr; } }

        .pc-nav {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .pc-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--ink-muted);
          font-size: 13px;
          text-decoration: none;
          transition: color 0.15s;
          font-family: 'Lato', sans-serif;
        }
        .pc-back:hover { color: var(--accent); }

        .pc-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          background: var(--accent-light);
          padding: 4px 12px;
          border-radius: 20px;
        }

        /* ── Cards ── */
        .pc-card {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .pc-card:last-child { margin-bottom: 0; }

        .pc-card-header {
          padding: 24px 32px 18px;
          border-bottom: 1px solid var(--border);
        }
        .pc-heading {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 4px;
        }
        .pc-subheading { font-size: 13px; color: var(--ink-muted); font-weight: 300; }

        .pc-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 3px;
        }
        .pc-section-sub { font-size: 12px; color: var(--ink-muted); }

        .pc-card-body {
          padding: 24px 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ── Fields ── */
        .pc-field { display: flex; flex-direction: column; gap: 7px; }
        .pc-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }
        .pc-required { color: var(--accent); margin-left: 2px; }

        .pc-input {
          width: 100%;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: #fdfcfb;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .pc-input::placeholder { color: var(--ink-faint); }
        .pc-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(124,77,47,0.1);
        }

        .pc-textarea {
          min-height: 90px;
          resize: vertical;
          line-height: 1.7;
        }

        .pc-select {
          width: 100%;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: #fdfcfb;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px 36px 10px 14px;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237c4d2f' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          box-sizing: border-box;
        }
        .pc-select:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(124,77,47,0.1); }

        .pc-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .pc-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        /* ── Toggle ── */
        .pc-toggle-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          background: #fdfcfb;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          user-select: none;
        }
        .pc-toggle {
          width: 36px; height: 20px;
          background: var(--border);
          border-radius: 10px;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .pc-toggle.on { background: var(--accent); }
        .pc-toggle::after {
          content: '';
          position: absolute;
          top: 3px; left: 3px;
          width: 14px; height: 14px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .pc-toggle.on::after { transform: translateX(16px); }
        .pc-toggle-label { font-size: 13px; color: var(--ink); }
        .pc-toggle-hint { font-size: 11px; color: var(--ink-faint); margin-left: auto; }

        /* ── Days accordion ── */
        .pc-days-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          border-bottom: 1px solid var(--border);
        }
        .pc-days-count {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
          background: var(--accent-light);
          padding: 3px 10px;
          border-radius: 20px;
        }

        .pc-day-item {
          border-bottom: 1px solid var(--border);
        }
        .pc-day-item:last-child { border-bottom: none; }

        .pc-day-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 32px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }
        .pc-day-toggle:hover { background: #fdfcfb; }

        .pc-day-num {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--accent-light);
          color: var(--accent);
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pc-day-toggle-title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .pc-day-toggle-sub { font-size: 11px; color: var(--ink-faint); }

        .pc-day-toggle-actions { display: flex; gap: 6px; align-items: center; }
        .pc-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          color: var(--ink-faint);
          display: flex;
          align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .pc-icon-btn:hover { color: var(--red); background: #fdf0f0; }
        .pc-icon-btn.chevron { color: var(--ink-muted); }
        .pc-icon-btn.chevron:hover { color: var(--accent); background: var(--accent-light); }

        .pc-day-body {
          padding: 20px 32px 24px;
          background: #fdfcfb;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-top: 1px solid var(--border);
        }

        /* ── List fields (prayers/actions) ── */
        .pc-list-field { display: flex; flex-direction: column; gap: 8px; }
        .pc-list-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }
        .pc-list-label svg { color: var(--accent); opacity: 0.7; }

        .pc-list-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .pc-list-item .pc-input { flex: 1; }
        .pc-list-rm {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: var(--ink-faint);
          border-radius: 4px;
          flex-shrink: 0;
          margin-top: 4px;
          transition: color 0.15s;
        }
        .pc-list-rm:hover { color: var(--red); }

        .pc-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px dashed var(--border);
          border-radius: var(--radius);
          padding: 7px 14px;
          font-size: 12px;
          color: var(--ink-muted);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          font-family: 'Lato', sans-serif;
          width: 100%;
          justify-content: center;
        }
        .pc-add-btn:hover { border-color: var(--accent); color: var(--accent); }

        .pc-add-day-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: none;
          border: none;
          border-top: 1px solid var(--border);
          color: var(--accent);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          font-family: 'Lato', sans-serif;
          transition: background 0.15s;
        }
        .pc-add-day-btn:hover { background: var(--accent-light); }

        /* ── Sidebar ── */
        .pc-sidebar { display: flex; flex-direction: column; gap: 16px; }

        .pc-panel {
          background: var(--card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .pc-panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
        }
        .pc-panel-icon {
          width: 30px; height: 30px;
          border-radius: 7px;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .pc-panel-icon svg { width: 14px; height: 14px; }
        .pc-panel-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .pc-panel-subtitle { font-size: 11px; color: var(--ink-faint); }
        .pc-panel-body { padding: 16px 18px; }

        /* Photo */
        .pc-photo-zone {
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
        .pc-photo-zone:hover { border-color: var(--accent); }
        .pc-photo-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 16px;
          color: var(--ink-faint);
          text-align: center;
        }
        .pc-photo-placeholder svg { color: var(--accent); opacity: 0.5; width: 26px; height: 26px; }
        .pc-photo-placeholder strong { font-size: 12px; color: var(--ink-muted); font-weight: 600; }
        .pc-photo-placeholder span { font-size: 11px; }
        .pc-photo-preview-wrap { position: relative; width: 100%; height: 150px; }
        .pc-photo-overlay {
          position: absolute; inset: 0;
          background: rgba(28,26,23,0.5);
          display: flex; align-items: center; justify-content: center;
          gap: 6px; color: white; font-size: 12px; font-weight: 600;
          opacity: 0; transition: opacity 0.2s;
        }
        .pc-photo-zone:hover .pc-photo-overlay { opacity: 1; }
        .pc-photo-remove {
          position: absolute; top: 8px; right: 8px;
          width: 24px; height: 24px;
          background: rgba(28,26,23,0.65);
          border: none; border-radius: 50%; color: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10; transition: background 0.15s;
        }
        .pc-photo-remove:hover { background: var(--red); }

        /* Submit */
        .pc-submit {
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
        .pc-submit:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(124,77,47,0.32);
        }
        .pc-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .pc-hint {
          font-size: 11px;
          color: var(--ink-faint);
          text-align: center;
          line-height: 1.6;
          margin: 0;
        }

        .pc-stat {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          font-size: 12px;
        }
        .pc-stat:last-child { border-bottom: none; padding-bottom: 0; }
        .pc-stat-label { color: var(--ink-muted); }
        .pc-stat-value { font-weight: 700; color: var(--ink); }
        .pc-stat-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          background: var(--accent-light);
          color: var(--accent);
        }

        .pc-divider {
          height: 1px;
          background: var(--border);
          margin: 4px 0;
        }

        .pc-slug-hint {
          font-size: 11px;
          color: var(--ink-faint);
          font-style: italic;
        }

        .pc-days-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--accent-light);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .pc-days-display-num {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--accent);
          line-height: 1;
        }
        .pc-days-display-label {
          font-size: 11px;
          color: var(--ink-muted);
          line-height: 1.4;
        }

        /* JSON Import */
        .pc-json-textarea {
          width: 100%;
          min-height: 140px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: var(--ink);
          background: #fafaf8;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px 12px;
          outline: none;
          resize: vertical;
          line-height: 1.6;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .pc-json-textarea::placeholder { color: var(--ink-faint); font-family: 'Lato', sans-serif; font-size: 12px; }
        .pc-json-textarea:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(124,77,47,0.1);
        }
        .pc-json-textarea.error { border-color: var(--red); }
        .pc-json-textarea.success { border-color: #3d7a5a; }

        .pc-json-import-btn {
          width: 100%;
          padding: 10px;
          background: var(--accent-light);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--accent);
          font-family: 'Lato', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.15s, border-color 0.15s;
          margin-top: 8px;
        }
        .pc-json-import-btn:hover { background: #e8ddd4; border-color: var(--accent); }
        .pc-json-import-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .pc-json-status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          padding: 8px 10px;
          border-radius: var(--radius);
          margin-top: 8px;
        }
        .pc-json-status.success { background: #f0faf5; color: #3d7a5a; border: 1px solid #a8d5bc; }
        .pc-json-status.error { background: #fdf0f0; color: var(--red); border: 1px solid #e8b4b4; }
        .pc-json-clear-btn {
          background: none;
          border: none;
          font-size: 11px;
          color: var(--ink-faint);
          cursor: pointer;
          margin-left: auto;
          text-decoration: underline;
          padding: 0;
          font-family: 'Lato', sans-serif;
        }
        .pc-json-clear-btn:hover { color: var(--ink-muted); }
      `}</style>

            <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={photoInputRef}
                onChange={handlePhotoChange}
            />

            <div className="pc-root">
                <div className="pc-layout">

                    {/* Nav */}
                    <div className="pc-nav">
                        <Link href="/plan/list" className="pc-back">
                            <ChevronLeft size={14} /> All Plans
                        </Link>
                        <span className="pc-badge">New Plan</span>
                    </div>

                    {/* ── Left column ── */}
                    <div>

                        {/* Plan Info card */}
                        <div className="pc-card">
                            <div className="pc-card-header">
                                <h1 className="pc-heading">Create Plan</h1>
                                <p className="pc-subheading">Add a new spiritual plan to the collection</p>
                            </div>
                            <div className="pc-card-body">

                                <div className="pc-row">
                                    <div className="pc-field">
                                        <label className="pc-label">Name <span className="pc-required">*</span></label>
                                        <input
                                            className="pc-input"
                                            value={name}
                                            onChange={(e) => autoSlug(e.target.value)}
                                            placeholder="e.g. Anxiety Plan"
                                        />
                                    </div>
                                    <div className="pc-field">
                                        <label className="pc-label">Slug <span className="pc-required">*</span></label>
                                        <input
                                            className="pc-input"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                                            placeholder="auto-generated"
                                        />
                                        {slug && <span className="pc-slug-hint">/{slug}</span>}
                                    </div>
                                </div>

                                <div className="pc-row">
                                    <div className="pc-field">
                                        <label className="pc-label">Language <span className="pc-required">*</span></label>
                                        <select className="pc-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                            <option value="">Select language</option>
                                            {LANGUAGES.map((l) => (
                                                <option key={l.value} value={l.value}>{l.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="pc-field">
                                        <label className="pc-label">Category <span className="pc-required">*</span></label>
                                        <select className="pc-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                            <option value="">Select category</option>
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pc-field" style={{ maxWidth: 160 }}>
                                    <label className="pc-label">Total Days</label>
                                    <div className="pc-days-display">
                                        <span className="pc-days-display-num">{days.length}</span>
                                        <span className="pc-days-display-label">{days.length === 1 ? "day" : "days"} — set via JSON import</span>
                                    </div>
                                </div>

                                <div className="pc-field">
                                    <label className="pc-label">Description</label>
                                    <textarea
                                        className="pc-input pc-textarea"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Briefly describe what this plan is about..."
                                    />
                                </div>

                                <div className="pc-field">
                                    <label className="pc-label">Access</label>
                                    <div className="pc-toggle-wrap" onClick={() => setIsFree(!isFree)}>
                                        <div className={`pc-toggle ${isFree ? "on" : ""}`} />
                                        <span className="pc-toggle-label">{isFree ? "Free for everyone" : "Premium only"}</span>
                                        <span className="pc-toggle-hint">{isFree ? "Visible to all users" : "Requires subscription"}</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Daily Items card */}
                        <div className="pc-card">
                            <div className="pc-days-header">
                                <div>
                                    <div className="pc-section-title">Daily Items</div>
                                    <div className="pc-section-sub">One entry per day of the plan</div>
                                </div>
                                <span className="pc-days-count">{days.length} {days.length === 1 ? "day" : "days"}</span>
                            </div>

                            {days.map((day, idx) => (
                                <div key={idx} className="pc-day-item">
                                    <button
                                        className="pc-day-toggle"
                                        onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
                                    >
                                        <div className="pc-day-num">{day.dayNumber}</div>
                                        <div style={{ flex: 1, textAlign: "left" }}>
                                            <div className="pc-day-toggle-title">
                                                {day.title || <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>Untitled day</span>}
                                            </div>
                                            <div className="pc-day-toggle-sub">
                                                {[
                                                    day.scripture && "Scripture",
                                                    day.reflection && "Reflection",
                                                    day.prayers.filter(Boolean).length > 0 && `${day.prayers.filter(Boolean).length} prayer(s)`,
                                                    day.actions.filter(Boolean).length > 0 && `${day.actions.filter(Boolean).length} action(s)`,
                                                ].filter(Boolean).join(" · ") || "No content yet"}
                                            </div>
                                        </div>
                                        <div className="pc-day-toggle-actions">
                                            <span className="pc-icon-btn chevron">
                                                {expandedDay === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                            </span>
                                        </div>
                                    </button>

                                    {expandedDay === idx && (
                                        <div className="pc-day-body">

                                            <div className="pc-field">
                                                <label className="pc-label">Day Title <span className="pc-required">*</span></label>
                                                <input
                                                    className="pc-input"
                                                    value={day.title}
                                                    onChange={(e) => updateDay(idx, "title", e.target.value)}
                                                    placeholder="e.g. Finding Peace in Prayer"
                                                />
                                            </div>

                                            <div className="pc-field">
                                                <label className="pc-label"><BookOpen size={11} style={{ display: "inline", marginRight: 4 }} />Scripture</label>
                                                <input
                                                    className="pc-input"
                                                    value={day.scripture}
                                                    onChange={(e) => updateDay(idx, "scripture", e.target.value)}
                                                    placeholder="e.g. Philippians 4:6-7"
                                                />
                                            </div>

                                            <div className="pc-field">
                                                <label className="pc-label">Reflection</label>
                                                <textarea
                                                    className="pc-input pc-textarea"
                                                    value={day.reflection}
                                                    onChange={(e) => updateDay(idx, "reflection", e.target.value)}
                                                    placeholder="Main reflection for this day..."
                                                />
                                            </div>

                                            <div className="pc-field">
                                                <label className="pc-label"><User size={11} style={{ display: "inline", marginRight: 4 }} />Saint Reflection</label>
                                                <textarea
                                                    className="pc-input pc-textarea"
                                                    style={{ minHeight: 70 }}
                                                    value={day.saintReflection}
                                                    onChange={(e) => updateDay(idx, "saintReflection", e.target.value)}
                                                    placeholder="Optional quote or reflection from a saint..."
                                                />
                                            </div>

                                            {/* Prayers */}
                                            <div className="pc-list-field">
                                                <label className="pc-list-label">
                                                    <Sparkles size={11} /> Prayers
                                                </label>
                                                {day.prayers.map((p, pi) => (
                                                    <div key={pi} className="pc-list-item">
                                                        <input
                                                            className="pc-input"
                                                            value={p}
                                                            onChange={(e) => updateListItem(idx, "prayers", pi, e.target.value)}
                                                            placeholder={`Prayer ${pi + 1}`}
                                                        />
                                                        {day.prayers.length > 1 && (
                                                            <button className="pc-list-rm" onClick={() => removeListItem(idx, "prayers", pi)}>
                                                                <X size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button className="pc-add-btn" onClick={() => addListItem(idx, "prayers")}>
                                                    <Plus size={12} /> Add Prayer
                                                </button>
                                            </div>

                                            {/* Actions */}
                                            <div className="pc-list-field">
                                                <label className="pc-list-label">
                                                    <Zap size={11} /> Actions
                                                </label>
                                                {day.actions.map((a, ai) => (
                                                    <div key={ai} className="pc-list-item">
                                                        <input
                                                            className="pc-input"
                                                            value={a}
                                                            onChange={(e) => updateListItem(idx, "actions", ai, e.target.value)}
                                                            placeholder={`Action ${ai + 1}`}
                                                        />
                                                        {day.actions.length > 1 && (
                                                            <button className="pc-list-rm" onClick={() => removeListItem(idx, "actions", ai)}>
                                                                <X size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button className="pc-add-btn" onClick={() => addListItem(idx, "actions")}>
                                                    <Plus size={12} /> Add Action
                                                </button>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>

                    </div>

                    {/* ── Sidebar ── */}
                    <div className="pc-sidebar">

                        {/* Thumbnail */}
                        <div className="pc-panel">
                            <div className="pc-panel-header">
                                <div className="pc-panel-icon"><ImagePlus /></div>
                                <div>
                                    <div className="pc-panel-title">Thumbnail</div>
                                    <div className="pc-panel-subtitle">Optional · JPG, PNG, WEBP</div>
                                </div>
                            </div>
                            <div className="pc-panel-body">
                                <div className="pc-photo-zone" onClick={() => photoInputRef.current?.click()}>
                                    {photoPreview ? (
                                        <>
                                            <div className="pc-photo-preview-wrap">
                                                <Image src={photoPreview} alt="Preview" fill style={{ objectFit: "cover" }} />
                                                <div className="pc-photo-overlay"><ImagePlus size={13} /> Change</div>
                                            </div>
                                            <button
                                                className="pc-photo-remove"
                                                onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(""); }}
                                            >
                                                <X size={11} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="pc-photo-placeholder">
                                            <ImagePlus />
                                            <strong>Click to upload</strong>
                                            <span>PNG, JPG, WEBP · max 10MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="pc-panel">
                            <div className="pc-panel-header">
                                <div className="pc-panel-icon"><BookOpen /></div>
                                <div>
                                    <div className="pc-panel-title">Summary</div>
                                    <div className="pc-panel-subtitle">Plan overview</div>
                                </div>
                            </div>
                            <div className="pc-panel-body">
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Total Days</span>
                                    <span className="pc-stat-value">{days.length}</span>
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Category</span>
                                    {category
                                        ? <span className="pc-stat-pill">{category}</span>
                                        : <span className="pc-stat-value" style={{ color: "var(--ink-faint)" }}>—</span>}
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Language</span>
                                    <span className="pc-stat-value">
                                        {LANGUAGES.find((l) => l.value === language)?.label || "—"}
                                    </span>
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Access</span>
                                    <span className="pc-stat-pill" style={{ background: isFree ? "#e8f5ee" : "#fef0e8", color: isFree ? "#3d7a5a" : "#b05a20" }}>
                                        {isFree ? "Free" : "Premium"}
                                    </span>
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Days filled</span>
                                    <span className="pc-stat-value">
                                        {days.filter((d) => d.title.trim()).length} / {days.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* JSON Import */}
                        <div className="pc-panel">
                            <div className="pc-panel-header">
                                <div className="pc-panel-icon"><ClipboardPaste /></div>
                                <div>
                                    <div className="pc-panel-title">Import Days</div>
                                    <div className="pc-panel-subtitle">Paste JSON array to populate</div>
                                </div>
                            </div>
                            <div className="pc-panel-body">
                                <textarea
                                    className={`pc-json-textarea${jsonStatus === "error" ? " error" : jsonStatus === "success" ? " success" : ""}`}
                                    value={jsonInput}
                                    onChange={(e) => { setJsonInput(e.target.value); setJsonStatus(null); setJsonError(""); }}
                                    placeholder={`Paste your dailyItems JSON array here:\n[\n  {\n    "dayNumber": 1,\n    "title": "Day title",\n    "prayers": [...],\n    ...\n  }\n]`}
                                    spellCheck={false}
                                />
                                {jsonStatus === "success" && (
                                    <div className="pc-json-status success">
                                        <CheckCircle2 size={13} />
                                        <span>{days.length} day{days.length > 1 ? "s" : ""} imported</span>
                                        <button className="pc-json-clear-btn" onClick={() => { setJsonInput(""); setJsonStatus(null); }}>Clear</button>
                                    </div>
                                )}
                                {jsonStatus === "error" && (
                                    <div className="pc-json-status error">
                                        <AlertCircle size={13} />
                                        <span>{jsonError}</span>
                                    </div>
                                )}
                                <button
                                    className="pc-json-import-btn"
                                    disabled={!jsonInput.trim()}
                                    onClick={handleImportJson}
                                >
                                    <ClipboardPaste size={13} /> Import JSON
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pc-panel">
                            <div className="pc-panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <button className="pc-submit" disabled={!isValid || isLoading} onClick={handleCreate}>
                                    {isLoading
                                        ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                                        : "Create Plan"
                                    }
                                </button>
                                <p className="pc-hint">
                                    Name, slug, language & category required.<br />
                                    Each day needs a title.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}