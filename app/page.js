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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with", { email, password });
    GlobalApi.signIn({
      email,
      password,
    }).then((resp) => {
      const token = resp.data.token;
      localStorage.setItem("authToken", token);
      window.location.href = "/feed/create";
    });
  };

  useEffect(() => {
    // Check if data exists in localStorage
    const token = localStorage.getItem("authToken"); // or any other data you're storing in localStorage

    if (token) {
      // If data exists, navigate to the feed page
      router.push("/feed/create");
    }
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-96 shadow-lg p-6 bg-white rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
