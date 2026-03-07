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

  const { id } = params; // Retrieve the ID from params

  useEffect(() => {
    if (id) {
      // You might want to load the existing data for the post to be updated
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await GlobalApi.getFeed(id); // Assuming a function to get feed data
          console.log(response);
          const feed = response.data.data;

          setContent(feed.content);
          setPreviewUrl(feed.url); // Adjust based on your API response structure
        } catch (error) {
          toast("Error loading feed data.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    // if (!selectedImage && !previewUrl) {
    //   // Ensure you have either a selected image or existing image URL
    //   toast("Select an image.");
    //   return;
    // }

    setIsLoading(true);
    const formData = new FormData();

    formData.append("content", content);
    if (selectedImage) formData.append("photo", selectedImage); // Only append the new image if it's selected

    try {
      const result = await GlobalApi.updateFeed(id, formData); // Use PUT request to update the feed
      if (!result.data.error) {
        toast("Feed has been updated.");
        router.push("/feed/list"); // Redirect to the feed list after successful update
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
        <title>Feed Update</title>
      </Head>
      <div className="flex w-full items-center justify-center my-8">
        <div className="flex flex-col items-center justify-center p-10 gap-6 border-gray-200 w-full max-w-2xl bg-white shadow-lg rounded-lg">
          <h2 className="font-bold text-3xl text-center">Feed Update</h2>
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
          <Textarea
            className="w-full h-40 p-2 border rounded-md"
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            required
            value={content}
          />
          <Button
            disabled={!content || isLoading}
            onClick={handleUpdate}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {isLoading ? "Updating..." : "Update"}
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
