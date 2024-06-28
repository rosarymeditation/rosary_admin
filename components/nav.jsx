"use client"
import React from 'react'
import { useState } from 'react';
import Link from 'next/link';



const Navbar = () => {
    const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [moreDropdownOpen2, setMoreDropdownOpen2] = useState(false);
    return (
        <nav className="bg-white shadow-lg w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-4">
              {/* Logo */}
              <div>
               
                  <Link href="/" className="flex items-center py-5 px-2 text-gray-700">
                    <svg
                      className="h-6 w-6 mr-1 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 11V3m0 8a4 4 0 100 8 4 4 0 000-8zm6-8l2 2m0 0l-2 2m2-2H6"
                      />
                    </svg>
                    <span className="font-bold">Logo</span>
                  </Link>
                
              </div>
            </div>
            {/* Primary Navbar items */}
            <div className="hidden md:flex items-center space-x-1">
             
                <Link href="/" className="py-5 px-3 text-gray-700 hover:text-gray-900">
                  Home
                
              </Link>
              
              {/* Dropdown 1 */}
              <div className="relative">
                <button
                  className="py-5 px-3 text-gray-700 hover:text-gray-900 inline-flex items-center"
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                >
                  Psalm
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {servicesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-20">
                   
                      <Link href="/psalm/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Create
                      </Link>
                   
                  
                      <Link  href="/psalm/list" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        List
                      </Link>
                   
                  </div>
                )}
              </div>
  
              {/* Dropdown 2 */}
              <div className="relative">
                <button
                  className="py-5 px-3 text-gray-700 hover:text-gray-900 inline-flex items-center"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                >
                  Prayers
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {moreDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-20">
                    
                      <Link  href="/prayer/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Create
                      </Link>
                    
                   
                      <Link href="/prayer/list" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        List
                      </Link>
                    
                  </div>
                )}
              </div>

               {/* Dropdown 2 */}
               <div className="relative">
                <button
                  className="py-5 px-3 text-gray-700 hover:text-gray-900 inline-flex items-center"
                  onClick={() => setMoreDropdownOpen2(!moreDropdownOpen)}
                >
                 Distress Prayers
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {moreDropdownOpen2 && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-20">
                    
                      <Link  href="/distress/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Create
                      </Link>
                    
                   
                      <Link href="/distress/list" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        List
                      </Link>
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  };
  
export default Navbar
