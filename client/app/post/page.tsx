"use client";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobForm from "@/Components/JobPost/JobForm";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function page() {
  const { isAuthenticated, loading } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("http://localhost:8000/login");
    }
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow w-full px-4 sm:px-8">
        <h2 className="pt-8 mx-auto max-w-7xl text-2xl sm:text-3xl font-bold text-black">
          Create a Job Post
        </h2>

        <div className="pt-8 max-w-7xl mx-auto flex justify-center items-start">
          <JobForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default page;
