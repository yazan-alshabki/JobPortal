"use client";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import MyJob from "@/Components/JobItem/MyJob";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Page() {
  const { userJobs, jobs } = useJobsContext();
  const { isAuthenticated, loading, userProfile } = useGlobalContext();

  const [activeTab, setActiveTab] = React.useState("posts");

  const userId = userProfile?._id;
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("http://localhost:8000/login");
    }
  }, [isAuthenticated]);

  const likedJobs = jobs.filter((job: Job) => job.likes.includes(userId));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 text-base">Loading content, please wait...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="mt-8 w-[90%] max-w-7xl mx-auto flex flex-col">
          {/* Responsive buttons container: stack on small, inline on md+ */}
          <div className="self-center flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8">
            <button
              className={`border border-gray-400 px-6 py-2 rounded-full font-medium w-full sm:w-auto
            ${activeTab === "posts"
                  ? "border-transparent bg-[#7263F3] text-white"
                  : "border-gray-400"
                }`}
              onClick={() => setActiveTab("posts")}
            >
              My Job Posts
            </button>
            <button
              className={`border border-gray-400 px-6 py-2 rounded-full font-medium w-full sm:w-auto
            ${activeTab === "likes"
                  ? "border-transparent bg-[#7263F3] text-white"
                  : "border-gray-400"
                }`}
              onClick={() => setActiveTab("likes")}
            >
              Liked Jobs
            </button>
          </div>

          {activeTab === "posts" && userJobs.length === 0 && (
            <div className="min-h-[60vh] flex items-center justify-center">
              <p className="text-2xl font-bold text-center">No job posts found.</p>
            </div>
          )}

          {activeTab === "likes" && likedJobs.length === 0 && (
            <div className="min-h-[60vh] flex items-center justify-center">
              <p className="text-2xl font-bold text-center">No liked jobs found.</p>
            </div>
          )}

          <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activeTab === "posts" &&
              userJobs.map((job: Job) => <MyJob key={job._id} job={job} />)}

            {activeTab === "likes" &&
              likedJobs.map((job: Job) => <MyJob key={job._id} job={job} />)}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Page;
