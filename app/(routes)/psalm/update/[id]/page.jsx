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

const page = ({ params }) => {
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState({});
  const router = useRouter();
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [verse, setVerse] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [content, setContent] = useState("");
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
  const loadData = (id) => {
    GlobalApi.psalmById({
      id,
    }).then((resp) => {
      const psalm = resp.data.data;
      setTitle(psalm.title);
      setContent(psalm.content);
      setVerse(psalm.verse);
      setSelectedLanguage(psalm.language);
      setId(id);

      // setDescription(resp.data?.description);
      // setPrice(resp.data?.price);
      // setSalePrice(resp.data?.salePrice);
      // setWeight(resp.data?.weight);
      // setIsAvailable(resp.data?.isAvailable);
      // setCanShow(resp.data?.canShow);
      // setIsPopular(resp.data?.isPopular);
      // setCategory(resp.data?.category);
      // setWeightType(resp.data?.weightType);
    });
  };
  useEffect(() => {
    const id = params.id;
    // setProduct(name);
    loadData(id);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectedLanguage = (event) => {
    console.log(event.target.value);
    setSelectedLanguage(event.target.value);
  };
  const handleUpdate = (e) => {
    if (!selectedLanguage) {
      toast("Select language.");
      return;
    }

    if (!selectedImage) {
      toast("Select image.");
      return;
    }

    const data = {
      id: id,
      title: title,
      content: content,
      verse: verse,
    };
    GlobalApi.psalmUpdate(data).then((result) => {
      if (!result.data.error) {
        toast("Psalm has been updated.");
      }
    });
  };
  return (
    <>
      <Head>
      <title>Psalm Update</title>
    </Head>
      <div className="flex w-full items-baseline justify-center my-8">
        <div className="flex flex-col items-center  justify-center p-10 gap-3 border-gray-200 w-full ">
          <div className="lg:w-1/2 w-full   flex flex-col gap-4 items-center bg-gray-100 shadow-md p-4">
            <h2 className="font-bold text-3xl text-center">Update Psalm</h2>
            <h2 className="text-gray-500">Update Psalm</h2>

            <Input
              value={title}
              className="w-full"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />

            <Input
              value={verse}
              className="w-full"
              onChange={(e) => setVerse(e.target.value)}
              placeholder="Verse"
            />

            <select
              onChange={handleSelectedLanguage}
              value={selectedLanguage}
              className="w-full"
              id="options"
              name="options"
            >
              <option value="6502946f6a369b86e4f201f2">Spanish</option>
              <option value="650294586a369b86e4f201f0">English</option>
            </select>

            <Textarea
              className="w-full h-72"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              type="text"
              placeholder="Content"
            />
            <Button
              disabled={!(title && content) || isLoading}
              onClick={() => handleUpdate()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
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
