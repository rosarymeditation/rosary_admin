"use client";

import GlobalApi from "@/app/_utils/GlobalApi";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";

const Page = ({ params }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();
  const [biography, setBiography] = useState("");
  const [reflection, setReflection] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [teaser, setTeaser] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasEnglishContent, setHasEnglishContent] = useState(false);
  const [hasSpanishContent, setHasSpanishContent] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const { id } = params;
    if (id) {
      // Load data if needed
    }
  }, [params]);

  useEffect(() => {
    // Check if data exists in localStorage
    const token = localStorage.getItem("authToken"); // or any other data you're storing in localStorage

    if (!token) {
      // If data exists, navigate to the feed page
      router.push("/");
    }
  }, [router]);
  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    setDate(selectedDate); // update state

    // Call your API with the selected date (formatted if needed)
    const formatted = formatDate(selectedDate);
    console.log("Selected date:", formatted);

    // Example API call
    GlobalApi.checkIfSaintExist({ date: formatted })
      .then((res) => {
        console.log(res)
        if (!res.data.englishData) {

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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  // const handleDateSelect = (selectedDate) => {
  //   if (!selectedDate) return;

  //   setDate(selectedDate); // update state

  //   // Call your API with the selected date (formatted if needed)
  //   const formatted = formatDate(selectedDate);
  //   console.log("Selected date:", formatted);


  // };
  const handleUpdate = async () => {
    const newDate = new Date(date);
    const formattedDate = formatDate(newDate);
    // if (!selectedImage) {
    //   toast("Select an image.");
    //   return;
    // }
    if (!content) {
      toast("Content is required");
      return;
    }


    if (!date) {
      toast("Date is required");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();

    formData.append("content", content);
    formData.append("photo", selectedImage);
    formData.append("date", formattedDate);

    try {
      const result = await GlobalApi.postSaint(formData);
      if (!result.data.error) {
        toast("Saint has been updated.");
      }
    } catch (error) {
      toast("Error updating feed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Saint</title>
      </Head>
      <div className="flex w-full items-center justify-center my-8">
        <div className="flex flex-col items-center justify-center p-10 gap-6 border-gray-200 w-full max-w-2xl bg-white shadow-lg rounded-lg">
          <h2 className="font-bold text-3xl text-center">Create Post</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
          {previewUrl && (
            <Image
              className="object-cover w-full h-52 rounded-md"
              width={300}
              height={200}
              src={previewUrl}
              alt="Preview"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded-md"
          />
          {hasEnglishContent && (
            <Alert>
              <CheckCircle2Icon className="h-4 w-4" />
              <AlertTitle>Saint already exists (English)</AlertTitle>
              <AlertDescription>
                Saint of the day for the selected date has already been created or
                updated.
              </AlertDescription>
            </Alert>
          )}
          {hasSpanishContent && (
            <Alert>
              <CheckCircle2Icon className="h-4 w-4" />
              <AlertTitle>Saint already exists(Spanish)</AlertTitle>
              <AlertDescription>
                Saint of the day for the selected date has already been created or
                updated.
              </AlertDescription>
            </Alert>
          )}


          <label>Content</label>
          <Textarea
            className="w-full h-40 p-2 border rounded-md"
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            require
          />

          <Button
            disabled={!content || isLoading}
            onClick={handleUpdate}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>

          <Link href="/feed/list" className="text-blue-500 hover:underline">
            Go to List
          </Link>
        </div>
      </div>
    </>
  );
};

export default Page;
