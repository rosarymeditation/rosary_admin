"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { EditIcon, Loader2, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Navbar from "@/components/nav";
import Head from "next/head";

const List = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [deletingId, setDeletingId] = useState(null); // Track which feed is being deleted

  // Fetch feeds
  useEffect(() => {
    setIsLoading(true);
    GlobalApi.feeds()
      .then((resp) => {
        setFeeds(resp.data.data);
      })
      .catch((error) => {
        toast("Error loading feeds.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Delete feed
  const handleDelete = async (id) => {
    setDeletingId(id);
    setIsLoading(true);
    try {
      const response = await GlobalApi.deleteFeed(id); // Assuming you have a delete API method
      if (!response.data.error) {
        toast("Feed deleted successfully.");
        setFeeds(feeds.filter((item) => item._id !== id)); // Update the local list
      } else {
        toast("Error deleting feed.");
      }
    } catch (error) {
      toast("Error deleting feed.");
    } finally {
      setIsLoading(false);
      setDeletingId(null); // Reset deleting state
    }
  };

  return (
    <>
      <Head>
        <title>Feed List</title>
      </Head>
      <Navbar />
      <div className="px-6">
        <div className="flex flex-col items-baseline justify-center p-10 gap-3 bg-slate-100 border border-gray-200">
          <h2>Feed List</h2>
          <Table>
            <TableHeader>
              <TableRow>
              
                <TableHead>Content</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead className="text-right"></TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : (
                feeds.map((item) => (
                  <TableRow key={item._id}>
                    {/* <TableCell className="font-medium">{item.title}</TableCell> */}
                    <TableCell>{item.content}</TableCell>
                    <TableCell>
                      {item.photo && (
                        <Image
                          src={item.photo}
                          alt={item.title}
                          width={100}
                          height={100}
                          className="object-cover rounded-md"
                        />
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      <Link href={`/feed/update/${item._id}`}>
                        <EditIcon className="text-green-600 cursor-pointer" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Trash2Icon
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleDelete(item._id)}
                        disabled={isLoading || deletingId === item._id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default List;
