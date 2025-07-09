// app/page.tsx
"use client";
import Filters from "@/Components/Filters";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import SearchForm from "@/Components/SearchForm";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { grip, list, table } from "@/utils/Icons";
import Image from "next/image";
import React from "react";

export default function Page() {
  const { jobs, filters } = useJobsContext();
  const [columns, setColumns] = React.useState(3);

  const toggleGridColumns = () =>
    setColumns((c) => (c === 3 ? 2 : c === 2 ? 1 : 3));
  const getIcon = () => (columns === 3 ? grip : columns === 2 ? table : list);

  const filteredJobs =
    filters.fullTime ||
      filters.partTime ||
      filters.contract ||
      filters.internship ||
      filters.temporary
      ? jobs.filter((job: Job) => {
        if (filters.fullTime && job.jobType.includes("Full Time")) return true;
        if (filters.partTime && job.jobType.includes("Part Time")) return true;
        if (filters.contract && job.jobType.includes("Contract")) return true;
        if (filters.internship && job.jobType.includes("Internship")) return true;
        if (filters.temporary && job.jobType.includes("Temporary")) return true;
        return false;
      })
      : jobs;

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative bg-[#D7DEDC] overflow-hidden py-24 px-6 sm:px-16 text-center">
        <div className="max-w-4xl mx-auto text-black relative z-10">
          {/* Heading with higher z-index so images stay behind */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#7263f3] relative z-20">
            Find Your Next Job Here
          </h1>

          {/* Search form */}
          <div className="w-full px-6 sm:px-12 lg:px-20 relative z-30">
  <SearchForm />
</div>
        </div>

        {/* Background images behind the heading but above bg */}
        <Image
          src="/woman-on-phone.jpg"
          alt="hero"
          width={200}
          height={500}
          className="clip-path w-[10rem] sm:w-[15rem] absolute -z-10 top-0 right-12 sm:right-[10rem] h-full object-cover"
        />
        <Image
          src="/team.jpg"
          alt="hero"
          width={200}
          height={500}
          className="clip-path-2 rotate-6 w-[10rem] sm:w-[15rem] absolute -z-10 top-0 right-28 sm:right-[32rem] h-full object-cover"
        />
      </section>


      <div className="w-full max-w-[90rem] mx-auto mb-14 px-4 sm:px-0">
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleGridColumns}
            className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition"
          >
            <span>
              {columns === 3
                ? "Grid"
                : columns === 2
                  ? "Table"
                  : "List"}{" "}
              View
            </span>
            <span className="text-lg">{getIcon()}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start lg:w-64">
            <Filters />
          </aside>

          {/* Jobs */}
          <div
            className={`flex-1 grid gap-8 ${columns === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : columns === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              }`}
          >
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job: Job) => (
                <JobCard key={job._id} job={job} />
              ))
            ) : (
              <p className="text-2xl font-bold mt-4">No Jobs Found!</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
