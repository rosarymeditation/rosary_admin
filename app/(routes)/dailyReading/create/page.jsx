"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import Head from "next/head";
import { Terminal } from "lucide-react";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";

import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
const page = ({ params }) => {
  const [date, setDate] = useState(new Date());
  const [newImages, setNewImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState({});
  const router = useRouter();
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [contentEN, setContentEN] = useState("");
  const [contentES, setContentES] = useState("");
  const [audioEN, setAudioEN] = useState("");
  const [audioES, setAudioES] = useState("");
  const [reflection, setReflection] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [hasEnglishContent, setHasEnglishContent] = useState(false);
  const [hasSpanishContent, setHasSpanishContent] = useState(false);
  //setPreviewUrl
  const [previewUrl, setPreviewUrl] = useState("");
  // const [weight, setWeight] = useState("");
  // const [weightType, setWeightType] = useState("");
  // const [isPopular, setIsPopular] = useState("");
  // const [category, setCategory] = useState("");
  // const [isAvailable, setIsAvailable] = useState("");
  // const [canShow, setCanShow] = useState("");
  // const [selectedFiles, setSelectedFiles] = useState([]);
  // const [imagePreviews, setImagePreviews] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const id = params.id;
  //   // setProduct(name);
  //   //loadData(id);
  // }, []);

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    setDate(selectedDate); // update state

    // Call your API with the selected date (formatted if needed)
    const formatted = formatDate(selectedDate);
    console.log("Selected date:", formatted);

    // Example API call
    GlobalApi.checkReadingExist({ date: formatted })
      .then((res) => {
        if (!res.data.englishData) {
          setAudioEN(false);
          setAudioES(false);
          setHasEnglishContent(false);
          setHasSpanishContent(false);
          return;
        }
        console.log("API result:", res.data);
        setHasEnglishContent(res.data.hasEnglish);
        setHasSpanishContent(res.data.hasSpanish);
        setContentEN(res.data.englishData.content);
        setContentES(res.data.spanishData.content);
        console.log(res.data.englishData.readingAudio);
        setAudioEN(res.data.englishData.readingAudio);
        setAudioES(res.data.spanishData.readingAudio);
        // Optionally set contentEN, contentES, etc.
      })
      .catch((err) => {
        console.error("Error fetching reading:", err);
      });
  };
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleUpdate = async (e) => {
    const newDate = new Date(date);
    const formattedDate = formatDate(newDate);

    if (!contentEN) {
      toast("Reading in English is required");
      return;
    }
    if (!contentES) {
      toast("Reading in Spanish is required");
      return;
    }
    if (!date) {
      toast("Date is required");
      return;
    }

    setIsLoading(true); // 🔄 Show spinner

    try {
      const result = await GlobalApi.createDailyReading({
        contentEnglish: contentEN,
        contentSpanish: contentES,
        date: formattedDate,
      });

      if (!result.data.error) {
        toast.success(result.data.message || "Saved successfully");
      } else {
        toast.error(result.data.message || "Error occurred");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setContentEN("");
      setContentES("");
      setIsLoading(false); // ✅ Hide spinner
    }
  };
  return (
    <>
      <Head>
        <title>Create Reading</title>
      </Head>
      <div className="flex w-full items-baseline justify-center my-8">
        <div className="flex flex-col items-center  justify-center p-10 gap-3 border-gray-200 w-full ">
          <div className="lg:w-1/2 w-full   flex flex-col gap-4 items-center bg-gray-100 shadow-md p-4">
            <h2 className="font-bold text-3xl text-center">Create</h2>
            <h2 className="text-gray-500">Create</h2>

            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
            {/* <select
              onChange={handleSelectedLanguage}
              className="w-full"
              id="options"
              name="options"
            >
              <option value="">Select Language</option>
              <option value="6502946f6a369b86e4f201f2">Spanish</option>
              <option value="650294586a369b86e4f201f0">English</option>
            </select> */}
            {/* <select
              className="w-full"
              id="options"
              name="options"
              onChange={handleSelectedType}
            >
               <option value="">Select Type </option>
              <option value="6502ec837377d628e7187a53">CATHOLIC</option>
              <option value="6502ec907377d628e7187a55">OTHERS</option>
              <option value="65356b8812e66ebd41c5c6c3">NOVENA</option>
            </select> */}
            {hasEnglishContent && (
              <Alert>
                <CheckCircle2Icon className="h-4 w-4" />
                <AlertTitle>Reading already exists (English)</AlertTitle>
                <AlertDescription>
                  A reading for the selected date has already been created or
                  updated.
                </AlertDescription>
              </Alert>
            )}
            {audioEN && <div>Has audio</div>}
            <Textarea
              className="w-full h-72"
              onChange={(e) => setContentEN(e.target.value)}
              type="text"
              placeholder="Plain text in English not HTML formatted"
            />
            {hasSpanishContent && (
              <Alert>
                <CheckCircle2Icon className="h-4 w-4" />
                <AlertTitle>Reading already exists(Spanish)</AlertTitle>
                <AlertDescription>
                  A reading for the selected date has already been created or
                  updated.
                </AlertDescription>
              </Alert>
            )}
            {audioES && <div>Audio url: </div>}
            <Textarea
              className="w-full h-72"
              onChange={(e) => setContentES(e.target.value)}
              type="text"
              placeholder="Plain text in Spanish not HTML formatted"
            />

            <Button
              disabled={!contentEN || !contentES || isLoading}
              onClick={() => handleUpdate()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
            <p>
              <Link className="text-blue-500" href="/dailyReading/list">
                List
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
