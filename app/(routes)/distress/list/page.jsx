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
import { Input } from "@/components/ui/input";
import { EditIcon, Loader2, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Navbar from "@/components/nav";

const List = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [distress, setDistress] = useState([]);
  useEffect(() => {
    GlobalApi.distressList().then((resp) => {
      console.log(resp)
      setDistress(resp.data.data);
    });
  }, []);

  return (
    <> 
      <Head>
      <title>Distress List</title>
     
    </Head>
    <Navbar/>
    <div className="px-6">
    <div className="flex flex-col  items-baseline  justify-center p-10 gap-3 bg-slate-100 border border-gray-200">
    <h2>Distress List</h2>
      <Table>
        
        <TableHeader>
          <TableRow>
            <TableHead classNamee="w-[300px]">Title</TableHead>
            {/* <TableHead>Content</TableHead> */}
            <TableHead>Lanugage</TableHead>
          
            <TableHead className="text-right"></TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {distress.map((item) => {
         return   (
         <TableRow>
              <TableCell className="font-medium">{item.title}</TableCell>
              {/* <TableCell>£{item.content}</TableCell> */}
              <TableCell>{item.language.name}</TableCell>
              <TableCell className="p-2"><Link href={`/distress/update/${item._id}`}><EditIcon className="text-green-600 cursor-pointer"/></Link> </TableCell>
              <TableCell><Trash2Icon className=" text-red-600 cursor-pointer"/></TableCell>
            </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  </div></>
   
  );
};

export default List;
