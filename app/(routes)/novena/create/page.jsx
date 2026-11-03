"use client";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
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
    Heart,
    Calendar,
    Trash2,
    ClipboardPaste,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import GlobalApi from "@/app/_utils/GlobalApi";

// Where to go after a successful create. Change to match your admin routes.
const LIST_ROUTE = "/novena/list";

const INTENTION = "{{intention}}";

// `code` is what the API expects (same mapping the Plan page uses: Spanish = "1", English = "0")
const LANGUAGES = [
    { label: "English", code: "0", suffix: "en" },
    { label: "Spanish", code: "1", suffix: "es" },
    { label: "Portuguese", code: "2", suffix: "pt" },
];

const SUBJECT_TYPES = [
    { value: "saint", label: "Saint" },
    { value: "marian", label: "Marian" },
    { value: "christ", label: "Christ" },
    { value: "holy_spirit", label: "Holy Spirit" },
    { value: "intention", label: "Intention" },
    { value: "feast", label: "Feast" },
    { value: "other", label: "Other" },
];

const FORMAT_TYPES = [
    { value: "novena", label: "Novena (9 days)" },
    { value: "triduum", label: "Triduum (3 days)" },
    { value: "octave", label: "Octave (8 days)" },
    { value: "extended", label: "Extended devotion" },
    { value: "custom", label: "Custom prayer journey" },
];

const TONES = [
    { value: "traditional", label: "Traditional" },
    { value: "contemporary", label: "Contemporary" },
    { value: "gentle", label: "Gentle" },
];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DEFAULT_OPENING = ["In the name of the Father, and of the Son, and of the Holy Spirit. Amen."];
const DEFAULT_CLOSING = [
    "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
    "Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
    "Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.",
];

const emptyDay = (dayNumber) => ({
    dayNumber,
    title: "",
    scripture: "",
    reflection: "",
    petition: "",
    prayers: [""],
    actions: [""],
});

const slugify = (s) =>
    s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

const mapDays = (arr) =>
    arr.map((d, i) => ({
        dayNumber: i + 1,
        title: d.title ?? "",
        scripture: d.scripture ?? "",
        reflection: d.reflection ?? "",
        petition: d.petition ?? "",
        prayers: Array.isArray(d.prayers) && d.prayers.length ? d.prayers : [""],
        actions: Array.isArray(d.actions) && d.actions.length ? d.actions : [""],
    }));

// ── Small reusable pieces ────────────────────────────────────

function Toggle({ on, onChange, label, hint }) {
    return (
        <div className="pc-toggle-wrap" onClick={() => onChange(!on)}>
            <div className={`pc-toggle ${on ? "on" : ""}`} />
            <span className="pc-toggle-label">{label}</span>
            <span className="pc-toggle-hint">{hint}</span>
        </div>
    );
}

function ListEditor({ label, icon, items, onChange, placeholder, addLabel, multiline, keepOne }) {
    const update = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
    const remove = (i) => onChange(items.filter((_, j) => j !== i));
    const canRemove = keepOne ? items.length > 1 : true;

    return (
        <div className="pc-list-field">
            <label className="pc-list-label">
                {icon} {label}
            </label>
            {items.map((item, i) => (
                <div key={i} className="pc-list-item">
                    {multiline ? (
                        <textarea
                            className="pc-input pc-textarea"
                            style={{ minHeight: 70 }}
                            value={item}
                            onChange={(e) => update(i, e.target.value)}
                            placeholder={`${placeholder} ${i + 1}`}
                        />
                    ) : (
                        <input
                            className="pc-input"
                            value={item}
                            onChange={(e) => update(i, e.target.value)}
                            placeholder={`${placeholder} ${i + 1}`}
                        />
                    )}
                    {canRemove && (
                        <button type="button" className="pc-list-rm" onClick={() => remove(i)}>
                            <X size={13} />
                        </button>
                    )}
                </div>
            ))}
            <button type="button" className="pc-add-btn" onClick={() => onChange([...items, ""])}>
                <Plus size={12} /> {addLabel}
            </button>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────

export default function NovenaCreatePage() {
    const router = useRouter();

    // Identity
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [translationKey, setTranslationKey] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [keyTouched, setKeyTouched] = useState(false);
    const [language, setLanguage] = useState("");

    // Subject
    const [subjectType, setSubjectType] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [formatType, setFormatType] = useState("novena");
    const [tone, setTone] = useState("traditional");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");

    // Access & publishing
    const [isFree, setIsFree] = useState(false);
    const [isAiGenerated, setIsAiGenerated] = useState(true);
    const [isActive, setIsActive] = useState(false);

    // Feast
    const [feastKind, setFeastKind] = useState("none");
    const [feastMonth, setFeastMonth] = useState("");
    const [feastDay, setFeastDay] = useState("");
    const [feastOffset, setFeastOffset] = useState("");

    // Fixed prayers
    const [openingPrayers, setOpeningPrayers] = useState(DEFAULT_OPENING);
    const [closingPrayers, setClosingPrayers] = useState(DEFAULT_CLOSING);

    // Photo
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const photoInputRef = useRef(null);

    // Days
    const [days, setDays] = useState(() => Array.from({ length: 9 }, (_, i) => emptyDay(i + 1)));
    const [expandedDay, setExpandedDay] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    // JSON import
    const [jsonInput, setJsonInput] = useState("");
    const [jsonStatus, setJsonStatus] = useState(null); // null | "success" | "error"
    const [jsonError, setJsonError] = useState("");

    // ── Helpers ──────────────────────────────────────────────

    const suffixFor = (code) => {
        const l = LANGUAGES.find((x) => x.code === code);
        return l ? `-${l.suffix}` : "";
    };

    const handleName = (val) => {
        setName(val);
        const base = slugify(val);
        if (!keyTouched) setTranslationKey(base);
        if (!slugTouched) setSlug(base + suffixFor(language));
    };

    const handleLanguage = (code) => {
        setLanguage(code);
        if (!slugTouched) setSlug(slugify(name) + suffixFor(code));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const updateDay = (idx, field, value) =>
        setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));

    const addDay = () => {
        setDays((prev) => [...prev, emptyDay(prev.length + 1)]);
        setExpandedDay(days.length);
    };

    const removeDay = (idx) => {
        if (days.length === 1) return;
        setDays((prev) => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, dayNumber: i + 1 })));
        setExpandedDay(-1);
    };

    const handleImportJson = () => {
        setJsonStatus(null);
        setJsonError("");
        try {
            const parsed = JSON.parse(jsonInput);

            // Accept a bare array of days, or a full novena object
            const isFull = !Array.isArray(parsed) && parsed && Array.isArray(parsed.dailyItems);
            const dayArr = Array.isArray(parsed) ? parsed : isFull ? parsed.dailyItems : null;
            if (!dayArr || dayArr.length === 0) {
                throw new Error("No days found");
            }
            setDays(mapDays(dayArr));
            setExpandedDay(0);

            if (isFull) {
                if (parsed.name) {
                    setName(parsed.name);
                }
                if (parsed.slug) { setSlug(parsed.slug); setSlugTouched(true); }
                if (parsed.translationKey) { setTranslationKey(parsed.translationKey); setKeyTouched(true); }
                if (parsed.description !== undefined) setDescription(parsed.description);
                if (parsed.subjectType) setSubjectType(parsed.subjectType);
                if (parsed.subjectName) setSubjectName(parsed.subjectName);
                if (parsed.formatType) setFormatType(parsed.formatType);
                if (parsed.tone) setTone(parsed.tone);
                if (parsed.tags) setTags(Array.isArray(parsed.tags) ? parsed.tags.join(", ") : String(parsed.tags));
                if (typeof parsed.isFree === "boolean") setIsFree(parsed.isFree);
                if (typeof parsed.isAiGenerated === "boolean") setIsAiGenerated(parsed.isAiGenerated);
                if (Array.isArray(parsed.openingPrayers) && parsed.openingPrayers.length) setOpeningPrayers(parsed.openingPrayers);
                if (Array.isArray(parsed.closingPrayers) && parsed.closingPrayers.length) setClosingPrayers(parsed.closingPrayers);
                if (parsed.feast && parsed.feast.kind) {
                    setFeastKind(parsed.feast.kind);
                    setFeastMonth(parsed.feast.month ? String(parsed.feast.month) : "");
                    setFeastDay(parsed.feast.day ? String(parsed.feast.day) : "");
                    setFeastOffset(
                        typeof parsed.feast.easterOffsetDays === "number" ? String(parsed.feast.easterOffsetDays) : ""
                    );
                }
                // Language and visibility are left for you to choose
            }

            setJsonStatus("success");
            toast.success(
                isFull
                    ? `Imported novena with ${dayArr.length} days. Choose a language before saving.`
                    : `Imported ${dayArr.length} day${dayArr.length > 1 ? "s" : ""}.`
            );
        } catch (e) {
            setJsonStatus("error");
            setJsonError("Invalid JSON. Paste a days array or a full novena object.");
        }
    };

    // ── Validation ────────────────────────────────────────────

    const problems = [];
    if (!name.trim()) problems.push("Add a name");
    if (!language) problems.push("Choose a language");
    if (!slug) problems.push("Add a slug");
    if (!translationKey) problems.push("Add a translation key");
    if (!subjectType) problems.push("Choose a subject type");
    if (!subjectName.trim()) problems.push("Add a subject name");
    if (formatType === "novena" && days.length !== 9)
        problems.push(`A novena needs exactly 9 days (you have ${days.length})`);
    if (days.some((d) => !d.title.trim())) problems.push("Give every day a title");
    if (feastKind === "fixed" && (!feastMonth || !feastDay)) problems.push("Set the feast month and day");
    if (feastKind === "movable" && feastOffset === "") problems.push("Set the days after Easter");

    const isValid = problems.length === 0;

    // ── Submit ────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!isValid) {
            toast.error(problems[0]);
            return;
        }

        const cleanDays = days.map((d, i) => ({
            ...d,
            dayNumber: i + 1,
            prayers: d.prayers.filter((p) => p.trim()),
            actions: d.actions.filter((a) => a.trim()),
        }));

        let feast = { kind: "none" };
        if (feastKind === "fixed") {
            feast = { kind: "fixed", month: Number(feastMonth), day: Number(feastDay) };
        } else if (feastKind === "movable") {
            feast = { kind: "movable", easterOffsetDays: Number(feastOffset) };
        }

        const formData = new FormData();
        formData.append("code", LANGUAGES.find((l) => l.code === language)?.code ?? "0");
        formData.append("slug", slug);
        formData.append("translationKey", translationKey);
        formData.append("name", name.trim());
        formData.append("description", description);
        formData.append("subjectType", subjectType);
        formData.append("subjectName", subjectName.trim());
        formData.append("formatType", formatType);
        formData.append("tone", tone);
        formData.append("tags", tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).join(","));
        formData.append("totalDays", days.length);
        formData.append("feast", JSON.stringify(feast));
        formData.append("openingPrayers", JSON.stringify(openingPrayers.filter((p) => p.trim())));
        formData.append("closingPrayers", JSON.stringify(closingPrayers.filter((p) => p.trim())));
        formData.append("dailyItems", JSON.stringify(cleanDays));
        formData.append("isFree", isFree);
        formData.append("isAiGenerated", isAiGenerated);
        formData.append("isActive", isActive);
        if (photoFile) formData.append("photo", photoFile);

        if (typeof GlobalApi.createNovena !== "function") {
            toast.error("createNovena is missing from GlobalApi. Add it and export it.");
            return;
        }

        setIsLoading(true);
        try {
            await GlobalApi.createNovena(formData);
            toast.success(isActive ? "Novena created and published." : "Novena saved as hidden.");
            router.push(LIST_ROUTE);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create novena. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────

    return (
        <>
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

        .pc-root { min-height: 100vh; background: var(--bg); font-family: 'Lato', sans-serif; padding: 40px 16px 80px; }
        .pc-layout { max-width: 940px; margin: 0 auto; display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
        @media (max-width: 768px) { .pc-layout { grid-template-columns: 1fr; } }

        .pc-nav { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .pc-back { display: inline-flex; align-items: center; gap: 6px; color: var(--ink-muted); font-size: 13px; text-decoration: none; transition: color 0.15s; }
        .pc-back:hover { color: var(--accent); }
        .pc-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); background: var(--accent-light); padding: 4px 12px; border-radius: 20px; }

        .pc-card { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; margin-bottom: 20px; }
        .pc-card-header { padding: 24px 32px 18px; border-bottom: 1px solid var(--border); }
        .pc-heading { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--ink); margin: 0 0 4px; }
        .pc-subheading { font-size: 13px; color: var(--ink-muted); font-weight: 300; }
        .pc-section-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin: 0 0 3px; }
        .pc-section-sub { font-size: 12px; color: var(--ink-muted); }
        .pc-card-body { padding: 24px 32px 28px; display: flex; flex-direction: column; gap: 18px; }

        .pc-field { display: flex; flex-direction: column; gap: 7px; }
        .pc-label { font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--ink-muted); }
        .pc-required { color: var(--accent); margin-left: 2px; }
        .pc-help { font-size: 11px; color: var(--ink-faint); line-height: 1.5; }

        .pc-input { width: 100%; font-family: 'Lato', sans-serif; font-size: 14px; color: var(--ink); background: #fdfcfb; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .pc-input::placeholder { color: var(--ink-faint); }
        .pc-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(124,77,47,0.1); }
        .pc-textarea { min-height: 90px; resize: vertical; line-height: 1.7; }

        .pc-select { width: 100%; font-family: 'Lato', sans-serif; font-size: 14px; color: var(--ink); background: #fdfcfb; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 36px 10px 14px; outline: none; appearance: none; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237c4d2f' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; box-sizing: border-box; }
        .pc-select:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(124,77,47,0.1); }

        .pc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 520px) { .pc-row { grid-template-columns: 1fr; } }

        .pc-toggle-wrap { display: flex; align-items: center; gap: 10px; padding: 11px 14px; background: #fdfcfb; border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; user-select: none; }
        .pc-toggle { width: 36px; height: 20px; background: var(--border); border-radius: 10px; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .pc-toggle.on { background: var(--accent); }
        .pc-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .pc-toggle.on::after { transform: translateX(16px); }
        .pc-toggle-label { font-size: 13px; color: var(--ink); }
        .pc-toggle-hint { font-size: 11px; color: var(--ink-faint); margin-left: auto; text-align: right; }

        .pc-days-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; border-bottom: 1px solid var(--border); }
        .pc-days-count { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: var(--accent-light); padding: 3px 10px; border-radius: 20px; }
        .pc-day-item { border-bottom: 1px solid var(--border); }
        .pc-day-toggle { width: 100%; display: flex; align-items: center; gap: 14px; padding: 14px 32px; background: none; border: none; cursor: pointer; text-align: left; transition: background 0.1s; }
        .pc-day-toggle:hover { background: #fdfcfb; }
        .pc-day-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent-light); color: var(--accent); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pc-day-toggle-title { font-size: 14px; font-weight: 600; color: var(--ink); }
        .pc-day-toggle-sub { font-size: 11px; color: var(--ink-faint); }
        .pc-icon-btn { background: none; border: none; cursor: pointer; padding: 5px; border-radius: 4px; color: var(--ink-muted); display: flex; align-items: center; transition: color 0.15s, background 0.15s; }
        .pc-icon-btn:hover { color: var(--accent); background: var(--accent-light); }
        .pc-icon-btn.danger { color: var(--ink-faint); }
        .pc-icon-btn.danger:hover { color: var(--red); background: #fdf0f0; }
        .pc-day-body { padding: 20px 32px 24px; background: #fdfcfb; display: flex; flex-direction: column; gap: 16px; border-top: 1px solid var(--border); }
        .pc-day-footer { display: flex; justify-content: flex-end; }
        .pc-remove-day { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; font-size: 12px; color: var(--ink-faint); cursor: pointer; font-family: 'Lato', sans-serif; padding: 4px 0; }
        .pc-remove-day:hover { color: var(--red); }

        .pc-list-field { display: flex; flex-direction: column; gap: 8px; }
        .pc-list-label { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--ink-muted); }
        .pc-list-label svg { color: var(--accent); opacity: 0.7; }
        .pc-list-item { display: flex; gap: 8px; align-items: flex-start; }
        .pc-list-item .pc-input { flex: 1; }
        .pc-list-rm { background: none; border: none; cursor: pointer; padding: 6px; color: var(--ink-faint); border-radius: 4px; flex-shrink: 0; margin-top: 4px; transition: color 0.15s; }
        .pc-list-rm:hover { color: var(--red); }
        .pc-add-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: 1px dashed var(--border); border-radius: var(--radius); padding: 7px 14px; font-size: 12px; color: var(--ink-muted); cursor: pointer; transition: border-color 0.15s, color 0.15s; font-family: 'Lato', sans-serif; width: 100%; justify-content: center; }
        .pc-add-btn:hover { border-color: var(--accent); color: var(--accent); }
        .pc-add-day-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: none; border: none; color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; font-family: 'Lato', sans-serif; transition: background 0.15s; }
        .pc-add-day-btn:hover { background: var(--accent-light); }

        .pc-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .pc-panel { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
        .pc-panel-header { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-bottom: 1px solid var(--border); }
        .pc-panel-icon { width: 30px; height: 30px; border-radius: 7px; background: var(--accent-light); display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; }
        .pc-panel-icon svg { width: 14px; height: 14px; }
        .pc-panel-title { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); }
        .pc-panel-subtitle { font-size: 11px; color: var(--ink-faint); }
        .pc-panel-body { padding: 16px 18px; }

        .pc-photo-zone { border: 2px dashed var(--border); border-radius: var(--radius); cursor: pointer; transition: border-color 0.15s; overflow: hidden; min-height: 130px; display: flex; align-items: center; justify-content: center; position: relative; }
        .pc-photo-zone:hover { border-color: var(--accent); }
        .pc-photo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 16px; color: var(--ink-faint); text-align: center; }
        .pc-photo-placeholder svg { color: var(--accent); opacity: 0.5; width: 26px; height: 26px; }
        .pc-photo-placeholder strong { font-size: 12px; color: var(--ink-muted); font-weight: 600; }
        .pc-photo-placeholder span { font-size: 11px; }
        .pc-photo-preview-wrap { position: relative; width: 100%; height: 150px; }
        .pc-photo-overlay { position: absolute; inset: 0; background: rgba(28,26,23,0.5); display: flex; align-items: center; justify-content: center; gap: 6px; color: white; font-size: 12px; font-weight: 600; opacity: 0; transition: opacity 0.2s; }
        .pc-photo-zone:hover .pc-photo-overlay { opacity: 1; }
        .pc-photo-remove { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: rgba(28,26,23,0.65); border: none; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: background 0.15s; }
        .pc-photo-remove:hover { background: var(--red); }

        .pc-submit { width: 100%; padding: 13px; background: var(--accent); border: none; border-radius: var(--radius); color: white; font-family: 'Lato', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 2px 8px rgba(124,77,47,0.25); }
        .pc-submit:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(124,77,47,0.32); }
        .pc-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .pc-problems { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
        .pc-problems li { font-size: 11px; color: var(--ink-muted); display: flex; align-items: center; gap: 6px; }
        .pc-problems li::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        .pc-ready { font-size: 11px; color: #3d7a5a; text-align: center; margin: 0; }

        .pc-stat { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
        .pc-stat:last-child { border-bottom: none; padding-bottom: 0; }
        .pc-stat-label { color: var(--ink-muted); }
        .pc-stat-value { font-weight: 700; color: var(--ink); text-align: right; }
        .pc-stat-pill { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: var(--accent-light); color: var(--accent); }

        .pc-slug-hint { font-size: 11px; color: var(--ink-faint); font-style: italic; }
        .pc-days-display { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--accent-light); border: 1px solid var(--border); border-radius: var(--radius); }
        .pc-days-display-num { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--accent); line-height: 1; }
        .pc-days-display-label { font-size: 11px; color: var(--ink-muted); line-height: 1.4; }

        .pc-json-textarea { width: 100%; min-height: 140px; font-family: 'Courier New', monospace; font-size: 11px; color: var(--ink); background: #fafaf8; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; outline: none; resize: vertical; line-height: 1.6; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .pc-json-textarea::placeholder { color: var(--ink-faint); font-family: 'Lato', sans-serif; font-size: 12px; }
        .pc-json-textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(124,77,47,0.1); }
        .pc-json-textarea.error { border-color: var(--red); }
        .pc-json-textarea.success { border-color: #3d7a5a; }
        .pc-json-import-btn { width: 100%; padding: 10px; background: var(--accent-light); border: 1px solid var(--border); border-radius: var(--radius); color: var(--accent); font-family: 'Lato', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background 0.15s, border-color 0.15s; margin-top: 8px; }
        .pc-json-import-btn:hover { background: #e8ddd4; border-color: var(--accent); }
        .pc-json-import-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pc-json-status { display: flex; align-items: center; gap: 7px; font-size: 11px; padding: 8px 10px; border-radius: var(--radius); margin-top: 8px; }
        .pc-json-status.success { background: #f0faf5; color: #3d7a5a; border: 1px solid #a8d5bc; }
        .pc-json-status.error { background: #fdf0f0; color: var(--red); border: 1px solid #e8b4b4; }
        .pc-json-clear-btn { background: none; border: none; font-size: 11px; color: var(--ink-faint); cursor: pointer; margin-left: auto; text-decoration: underline; padding: 0; font-family: 'Lato', sans-serif; }
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
                        <Link href={LIST_ROUTE} className="pc-back">
                            <ChevronLeft size={14} /> All Novenas
                        </Link>
                        <span className="pc-badge">New Novena</span>
                    </div>

                    {/* ── Left column ── */}
                    <div>

                        {/* Novena info */}
                        <div className="pc-card">
                            <div className="pc-card-header">
                                <h1 className="pc-heading">Create Novena</h1>
                                <p className="pc-subheading">Add a novena or other multi-day devotion</p>
                            </div>
                            <div className="pc-card-body">

                                <div className="pc-row">
                                    <div className="pc-field">
                                        <label className="pc-label">Name <span className="pc-required">*</span></label>
                                        <input
                                            className="pc-input"
                                            value={name}
                                            onChange={(e) => handleName(e.target.value)}
                                            placeholder="e.g. Novena to St. Jude"
                                        />
                                    </div>
                                    <div className="pc-field">
                                        <label className="pc-label">Language <span className="pc-required">*</span></label>
                                        <select className="pc-select" value={language} onChange={(e) => handleLanguage(e.target.value)}>
                                            <option value="">Select language</option>
                                            {LANGUAGES.map((l) => (
                                                <option key={l.code} value={l.code}>{l.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pc-row">
                                    <div className="pc-field">
                                        <label className="pc-label">Slug <span className="pc-required">*</span></label>
                                        <input
                                            className="pc-input"
                                            value={slug}
                                            onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                                            placeholder="auto-generated"
                                        />
                                        <span className="pc-slug-hint">Unique across all languages</span>
                                    </div>
                                    <div className="pc-field">
                                        <label className="pc-label">Translation key <span className="pc-required">*</span></label>
                                        <input
                                            className="pc-input"
                                            value={translationKey}
                                            onChange={(e) => { setTranslationKey(slugify(e.target.value)); setKeyTouched(true); }}
                                            placeholder="auto-generated"
                                        />
                                        <span className="pc-slug-hint">Same value for the English and Spanish versions</span>
                                    </div>
                                </div>

                                <div className="pc-row">
                                    <div className="pc-field">
                                        <label className="pc-label">Subject type <span className="pc-required">*</span></label>
                                        <select className="pc-select" value={subjectType} onChange={(e) => setSubjectType(e.target.value)}>
                                            <option value="">Select type</option>
                                            {SUBJECT_TYPES.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="pc-field">
                                        <label className="pc-label">Subject name <span className="pc-required">*</span></label>
                                        <input
                                            className="pc-input"
                                            value={subjectName}
                                            onChange={(e) => setSubjectName(e.target.value)}
                                            placeholder="e.g. St. Jude Thaddeus"
                                        />
                                    </div>
                                </div>

                                <div className="pc-row">
                                    <div className="pc-field">
                                        <label className="pc-label">Format</label>
                                        <select className="pc-select" value={formatType} onChange={(e) => setFormatType(e.target.value)}>
                                            {FORMAT_TYPES.map((f) => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </select>
                                        <span className="pc-help">
                                            Only use Novena for exactly 9 days; the server rejects anything else.
                                        </span>
                                    </div>
                                    <div className="pc-field">
                                        <label className="pc-label">Tone</label>
                                        <select className="pc-select" value={tone} onChange={(e) => setTone(e.target.value)}>
                                            {TONES.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pc-field">
                                    <label className="pc-label">Tags</label>
                                    <input
                                        className="pc-input"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="healing, family, hopeless-causes"
                                    />
                                    <span className="pc-help">Comma-separated, lowercase keys. Used for browse filters.</span>
                                </div>

                                <div className="pc-field">
                                    <label className="pc-label">Description</label>
                                    <textarea
                                        className="pc-input pc-textarea"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="One or two sentences shown on the novena card..."
                                    />
                                </div>

                                <div className="pc-field">
                                    <label className="pc-label">Access</label>
                                    <Toggle
                                        on={isFree}
                                        onChange={setIsFree}
                                        label={isFree ? "Free for everyone" : "Premium only"}
                                        hint={isFree ? "Visible to all users" : "Requires subscription"}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Feast */}
                        <div className="pc-card">
                            <div className="pc-days-header">
                                <div>
                                    <div className="pc-section-title">Feast</div>
                                    <div className="pc-section-sub">Powers the Starting soon row. The last day is the eve of the feast.</div>
                                </div>
                                <Calendar size={18} color="#7c4d2f" />
                            </div>
                            <div className="pc-card-body">
                                <div className="pc-field">
                                    <label className="pc-label">Feast type</label>
                                    <select className="pc-select" value={feastKind} onChange={(e) => setFeastKind(e.target.value)}>
                                        <option value="none">No feast (available any time)</option>
                                        <option value="fixed">Fixed date (same day every year)</option>
                                        <option value="movable">Movable (days after Easter)</option>
                                    </select>
                                </div>

                                {feastKind === "fixed" && (
                                    <div className="pc-row">
                                        <div className="pc-field">
                                            <label className="pc-label">Month <span className="pc-required">*</span></label>
                                            <select className="pc-select" value={feastMonth} onChange={(e) => setFeastMonth(e.target.value)}>
                                                <option value="">Select month</option>
                                                {MONTHS.map((m, i) => (
                                                    <option key={m} value={i + 1}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="pc-field">
                                            <label className="pc-label">Day <span className="pc-required">*</span></label>
                                            <input
                                                className="pc-input"
                                                type="number"
                                                min={1}
                                                max={31}
                                                value={feastDay}
                                                onChange={(e) => setFeastDay(e.target.value)}
                                                placeholder="1 to 31"
                                            />
                                        </div>
                                    </div>
                                )}

                                {feastKind === "movable" && (
                                    <div className="pc-field">
                                        <label className="pc-label">Days after Easter <span className="pc-required">*</span></label>
                                        <input
                                            className="pc-input"
                                            type="number"
                                            value={feastOffset}
                                            onChange={(e) => setFeastOffset(e.target.value)}
                                            placeholder="e.g. 49"
                                        />
                                        <span className="pc-help">
                                            Divine Mercy Sunday 7, Ascension (Thursday) 39, Pentecost 49, Sacred Heart 68. Negative numbers count back from Easter.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fixed prayers */}
                        <div className="pc-card">
                            <div className="pc-days-header">
                                <div>
                                    <div className="pc-section-title">Fixed prayers</div>
                                    <div className="pc-section-sub">Shown on every day, so they are stored once</div>
                                </div>
                            </div>
                            <div className="pc-card-body">
                                <ListEditor
                                    label="Opening prayers"
                                    icon={<Sparkles size={11} />}
                                    items={openingPrayers}
                                    onChange={setOpeningPrayers}
                                    placeholder="Opening prayer"
                                    addLabel="Add opening prayer"
                                    multiline
                                />
                                <ListEditor
                                    label="Closing prayers"
                                    icon={<Sparkles size={11} />}
                                    items={closingPrayers}
                                    onChange={setClosingPrayers}
                                    placeholder="Closing prayer"
                                    addLabel="Add closing prayer"
                                    multiline
                                />
                            </div>
                        </div>

                        {/* Daily items */}
                        <div className="pc-card">
                            <div className="pc-days-header">
                                <div>
                                    <div className="pc-section-title">Daily items</div>
                                    <div className="pc-section-sub">One entry per day of the novena</div>
                                </div>
                                <span className="pc-days-count">{days.length} {days.length === 1 ? "day" : "days"}</span>
                            </div>

                            {days.map((day, idx) => (
                                <div key={idx} className="pc-day-item">
                                    <button
                                        type="button"
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
                                                    day.petition && "Petition",
                                                    day.prayers.filter(Boolean).length > 0 && `${day.prayers.filter(Boolean).length} prayer(s)`,
                                                    day.actions.filter(Boolean).length > 0 && `${day.actions.filter(Boolean).length} action(s)`,
                                                ].filter(Boolean).join(", ") || "No content yet"}
                                            </div>
                                        </div>
                                        <span className="pc-icon-btn">
                                            {expandedDay === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                        </span>
                                    </button>

                                    {expandedDay === idx && (
                                        <div className="pc-day-body">

                                            <div className="pc-field">
                                                <label className="pc-label">Day title <span className="pc-required">*</span></label>
                                                <input
                                                    className="pc-input"
                                                    value={day.title}
                                                    onChange={(e) => updateDay(idx, "title", e.target.value)}
                                                    placeholder="e.g. The Gift of Wisdom"
                                                />
                                            </div>

                                            <div className="pc-field">
                                                <label className="pc-label"><BookOpen size={11} style={{ display: "inline", marginRight: 4 }} />Scripture</label>
                                                <input
                                                    className="pc-input"
                                                    value={day.scripture}
                                                    onChange={(e) => updateDay(idx, "scripture", e.target.value)}
                                                    placeholder="e.g. Acts 2:1-4"
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
                                                <label className="pc-label"><Heart size={11} style={{ display: "inline", marginRight: 4 }} />Petition</label>
                                                <textarea
                                                    className="pc-input pc-textarea"
                                                    style={{ minHeight: 70 }}
                                                    value={day.petition}
                                                    onChange={(e) => updateDay(idx, "petition", e.target.value)}
                                                    placeholder="Prayer asking for intercession or help..."
                                                />
                                                <span className="pc-help">
                                                    Use {INTENTION} where the user's own intention should appear.
                                                </span>
                                            </div>

                                            <ListEditor
                                                label="Extra prayers"
                                                icon={<Sparkles size={11} />}
                                                items={day.prayers}
                                                onChange={(v) => updateDay(idx, "prayers", v)}
                                                placeholder="Prayer"
                                                addLabel="Add prayer"
                                                keepOne
                                            />

                                            <ListEditor
                                                label="Actions"
                                                icon={<Zap size={11} />}
                                                items={day.actions}
                                                onChange={(v) => updateDay(idx, "actions", v)}
                                                placeholder="Action"
                                                addLabel="Add action"
                                                keepOne
                                            />

                                            {days.length > 1 && (
                                                <div className="pc-day-footer">
                                                    <button type="button" className="pc-remove-day" onClick={() => removeDay(idx)}>
                                                        <Trash2 size={13} /> Remove day {day.dayNumber}
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    )}
                                </div>
                            ))}

                            <button type="button" className="pc-add-day-btn" onClick={addDay}>
                                <Plus size={14} /> Add day
                            </button>
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
                                    <div className="pc-panel-subtitle">Optional. JPG, PNG, WEBP</div>
                                </div>
                            </div>
                            <div className="pc-panel-body">
                                <div className="pc-photo-zone" onClick={() => photoInputRef.current?.click()}>
                                    {photoPreview ? (
                                        <>
                                            <div className="pc-photo-preview-wrap">
                                                <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                <div className="pc-photo-overlay"><ImagePlus size={13} /> Change</div>
                                            </div>
                                            <button
                                                type="button"
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
                                            <span>PNG, JPG, WEBP, max 10MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Publishing */}
                        <div className="pc-panel">
                            <div className="pc-panel-header">
                                <div className="pc-panel-icon"><CheckCircle2 /></div>
                                <div>
                                    <div className="pc-panel-title">Publishing</div>
                                    <div className="pc-panel-subtitle">Who sees it, and how it's labelled</div>
                                </div>
                            </div>
                            <div className="pc-panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <Toggle
                                    on={isActive}
                                    onChange={setIsActive}
                                    label={isActive ? "Published" : "Hidden"}
                                    hint={isActive ? "Live in the app" : "Review first"}
                                />
                                <Toggle
                                    on={isAiGenerated}
                                    onChange={setIsAiGenerated}
                                    label="AI-generated"
                                    hint={isAiGenerated ? "Label allowed" : "Off"}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="pc-panel">
                            <div className="pc-panel-header">
                                <div className="pc-panel-icon"><BookOpen /></div>
                                <div>
                                    <div className="pc-panel-title">Summary</div>
                                    <div className="pc-panel-subtitle">Novena overview</div>
                                </div>
                            </div>
                            <div className="pc-panel-body">
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Total days</span>
                                    <span className="pc-stat-value">{days.length}</span>
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Subject</span>
                                    {subjectName
                                        ? <span className="pc-stat-value">{subjectName}</span>
                                        : <span className="pc-stat-value" style={{ color: "var(--ink-faint)" }}>Not set</span>}
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Type</span>
                                    {subjectType
                                        ? <span className="pc-stat-pill">{SUBJECT_TYPES.find((s) => s.value === subjectType)?.label}</span>
                                        : <span className="pc-stat-value" style={{ color: "var(--ink-faint)" }}>Not set</span>}
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Language</span>
                                    <span className="pc-stat-value">
                                        {LANGUAGES.find((l) => l.code === language)?.label || "Not set"}
                                    </span>
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Feast</span>
                                    <span className="pc-stat-value">
                                        {feastKind === "none" && "None"}
                                        {feastKind === "fixed" && (feastMonth && feastDay ? `${MONTHS[feastMonth - 1]} ${feastDay}` : "Incomplete")}
                                        {feastKind === "movable" && (feastOffset !== "" ? `Easter ${Number(feastOffset) >= 0 ? "+" : ""}${feastOffset}` : "Incomplete")}
                                    </span>
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Access</span>
                                    <span className="pc-stat-pill" style={{ background: isFree ? "#e8f5ee" : "#fef0e8", color: isFree ? "#3d7a5a" : "#b05a20" }}>
                                        {isFree ? "Free" : "Premium"}
                                    </span>
                                </div>
                                <div className="pc-stat">
                                    <span className="pc-stat-label">Days titled</span>
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
                                    <div className="pc-panel-title">Import JSON</div>
                                    <div className="pc-panel-subtitle">A days array or a full novena</div>
                                </div>
                            </div>
                            <div className="pc-panel-body">
                                <textarea
                                    className={`pc-json-textarea${jsonStatus === "error" ? " error" : jsonStatus === "success" ? " success" : ""}`}
                                    value={jsonInput}
                                    onChange={(e) => { setJsonInput(e.target.value); setJsonStatus(null); setJsonError(""); }}
                                    placeholder={`Paste either a dailyItems array or a full novena object with name, slug, feast, dailyItems, etc.\n\nLanguage and visibility are not imported; choose them here.`}
                                    spellCheck={false}
                                />
                                {jsonStatus === "success" && (
                                    <div className="pc-json-status success">
                                        <CheckCircle2 size={13} />
                                        <span>Imported {days.length} day{days.length > 1 ? "s" : ""}</span>
                                        <button type="button" className="pc-json-clear-btn" onClick={() => { setJsonInput(""); setJsonStatus(null); }}>Clear</button>
                                    </div>
                                )}
                                {jsonStatus === "error" && (
                                    <div className="pc-json-status error">
                                        <AlertCircle size={13} />
                                        <span>{jsonError}</span>
                                    </div>
                                )}
                                <button
                                    type="button"
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
                                <button type="button" className="pc-submit" disabled={!isValid || isLoading} onClick={handleCreate}>
                                    {isLoading
                                        ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                                        : isActive ? "Publish novena" : "Save novena"}
                                </button>
                                {problems.length > 0 ? (
                                    <ul className="pc-problems">
                                        {problems.slice(0, 4).map((p) => <li key={p}>{p}</li>)}
                                        {problems.length > 4 && <li>{problems.length - 4} more</li>}
                                    </ul>
                                ) : (
                                    <p className="pc-ready">Ready to save.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}