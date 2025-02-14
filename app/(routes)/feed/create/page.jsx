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

const Page = ({ params }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    // if (!selectedImage) {
    //   toast("Select an image.");
    //   return;
    // }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("photo", selectedImage);

    try {
      const result = await GlobalApi.postFeed(formData);
      if (!result.data.error) {
        toast("Feed has been updated.");
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
        <title>Create Post</title>
      </Head>
      <div className="flex w-full items-center justify-center my-8">
        <div className="flex flex-col items-center justify-center p-10 gap-6 border-gray-200 w-full max-w-2xl bg-white shadow-lg rounded-lg">
          <h2 className="font-bold text-3xl text-center">Create Post</h2>
          {previewUrl && (
            <Image
              className="object-cover w-full h-52 rounded-md"
              width={300}
              height={200}
              src={previewUrl}
              alt="Preview"
            />
          )}
          {/* <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border p-2 rounded-md"
          /> */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded-md"
          />
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
