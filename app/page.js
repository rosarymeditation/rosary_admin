"use client";
import Navbar from "@/components/nav";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link, Repeat, UserRoundX } from "lucide-react";
import GlobalApi from "./_utils/GlobalApi";
const Home = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    // GlobalApi.listOrder().then((resp) => {
    //   setOrders(resp.data.data);
    // });
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
     
    </main>
  );
};

export default Home;
