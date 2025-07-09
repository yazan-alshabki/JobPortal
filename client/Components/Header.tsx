"use client";

import { useGlobalContext } from "@/context/globalContext";
import { LogIn, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import Profile from "./Profile";

function Header() {
  const { isAuthenticated } = useGlobalContext();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="w-full bg-[#D7DEDC] text-gray-500 px-4 sm:px-8 py-4 sm:py-6 relative z-50">
      <div className="flex items-center justify-between w-full">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/logo.svg" alt="logo" width={45} height={45} />
          <h1 className="font-extrabold text-2xl text-[#7263f3] whitespace-nowrap">
            JobFindr
          </h1>
        </Link>

        {/* Center - Nav links (hidden on mobile) */}
        <ul className="hidden sm:flex flex-grow justify-center gap-6">
          <li>
            <Link
              href="/findwork"
              className={`py-2 px-4 rounded-md ${
                pathname === "/findwork"
                  ? "text-[#7263F3] border border-[#7263F3] bg-[#7263F3]/10"
                  : "hover:text-[#7263F3]"
              }`}
            >
              Find Work
            </Link>
          </li>
          <li>
            <Link
              href="/myjobs"
              className={`py-2 px-4 rounded-md ${
                pathname === "/myjobs"
                  ? "text-[#7263F3] border border-[#7263F3] bg-[#7263F3]/10"
                  : "hover:text-[#7263F3]"
              }`}
            >
              My Jobs
            </Link>
          </li>
          <li>
            <Link
              href="/post"
              className={`py-2 px-4 rounded-md ${
                pathname === "/post"
                  ? "text-[#7263F3] border border-[#7263F3] bg-[#7263F3]/10"
                  : "hover:text-[#7263F3]"
              }`}
            >
              Post a Job
            </Link>
          </li>
        </ul>

        {/* Right - Auth/Profile */}
        <div className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <Profile />
          ) : (
            <>
              <Link
                href="http://localhost:8000/login"
                className="flex items-center gap-2 py-2 px-4 rounded-md bg-[#7263F3] text-white border border-[#7263F3] hover:bg-[#7263F3]/90"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="http://localhost:8000/login"
                className="flex items-center gap-2 py-2 px-4 rounded-md border border-[#7263F3] text-[#7263F3] hover:bg-[#7263F3]/10"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden block p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7263f3]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-[#7263f3]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="fixed top-0 left-0 w-[80vw] max-w-xs h-full bg-[#D7DEDC] shadow-lg z-50 p-6 flex flex-col gap-6">
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/findwork"
                  className={`block py-2 px-4 rounded-md ${
                    pathname === "/findwork"
                      ? "text-[#7263F3] border border-[#7263F3] bg-[#7263F3]/10"
                      : "hover:text-[#7263F3]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Find Work
                </Link>
              </li>
              <li>
                <Link
                  href="/myjobs"
                  className={`block py-2 px-4 rounded-md ${
                    pathname === "/myjobs"
                      ? "text-[#7263F3] border border-[#7263F3] bg-[#7263F3]/10"
                      : "hover:text-[#7263F3]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  My Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/post"
                  className={`block py-2 px-4 rounded-md ${
                    pathname === "/post"
                      ? "text-[#7263F3] border border-[#7263F3] bg-[#7263F3]/10"
                      : "hover:text-[#7263F3]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Post a Job
                </Link>
              </li>
            </ul>

            <div className="mt-6">
              {isAuthenticated ? (
                <Profile />
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    href="http://localhost:8000/login"
                    className="flex items-center gap-2 py-2 px-4 rounded-md bg-[#7263F3] text-white border border-[#7263F3] hover:bg-[#7263F3]/90"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    href="http://localhost:8000/login"
                    className="flex items-center gap-2 py-2 px-4 rounded-md border border-[#7263F3] text-[#7263F3] hover:bg-[#7263F3]/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

export default Header;
