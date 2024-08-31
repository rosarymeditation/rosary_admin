"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import Head from "next/head";
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
  const [content, setContent] = useState("");
  const [reflection, setReflection] = useState("");
  const [selectedType, setSelectedType] = useState("");
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

  const handleSelectedLanguage = (event) => {
    console.log(event.target.value);
    setSelectedLanguage(event.target.value);
  };
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleUpdate = (e) => {
    console.log(date);

    const newDate = new Date(date);
    const formattedDate = formatDate(newDate);
    console.log(formattedDate);
    if (!content) {
      toast("Reading is required");
      return;
    }
    if (!reflection) {
      toast("Reflection is required");
      return;
    }
    if (!date) {
      toast("Date is required");
      return;
    }
    if (!selectedLanguage) {
      toast("Language is required");
      return;
    }
    GlobalApi.createDailyReading({
      content,
      summary: reflection,
      language: selectedLanguage,
      date: formattedDate,
    }).then((result) => {
      console.log(result.data);

      if (!result.data.error) {
        console.log("oeoeooe");
        toast(result.data.message);
      } else {
        toast(result.data.message);
      }
    });
    // const formData = new FormData();
    // if (!selectedLanguage) {
    //   toast("Select language.");
    //   return;
    // }

    // if (!selectedImage) {
    //   toast("Select image.");
    //   return;
    // }
    // formData.append("title", title);
    // formData.append("content", content);
    // formData.append("language", selectedLanguage);

    // formData.append("photo", selectedImage);

    // GlobalApi.createDistress(formData).then((result) => {
    //   console.log(result.data);

    //   if (!result.data.error) {
    //     console.log("oeoeooe");
    //     toast("Prayer has been updated.");
    //   }
    // });
  };
  return (
    <>
      <Head>
        <title>Create Distress</title>
      </Head>
      <div className="flex w-full items-baseline justify-center my-8">
        <div className="flex flex-col items-center  justify-center p-10 gap-3 border-gray-200 w-full ">
          <div className="lg:w-1/2 w-full   flex flex-col gap-4 items-center bg-gray-100 shadow-md p-4">
            <h2 className="font-bold text-3xl text-center">Create</h2>
            <h2 className="text-gray-500">Create</h2>

            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <select
              onChange={handleSelectedLanguage}
              className="w-full"
              id="options"
              name="options"
            >
              <option value="">Select Language</option>
              <option value="6502946f6a369b86e4f201f2">Spanish</option>
              <option value="650294586a369b86e4f201f0">English</option>
            </select>
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

            <Textarea
              className="w-full h-72"
              onChange={(e) => setContent(e.target.value)}
              type="text"
              placeholder="Content"
            />
            <Textarea
              className="w-full h-72"
              onChange={(e) => setReflection(e.target.value)}
              type="text"
              placeholder="Reflection"
            />
            <Button
              disabled={!content || isLoading}
              onClick={() => handleUpdate()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
            <p>
              <Link className="text-blue-500" href="/novena/list">
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
