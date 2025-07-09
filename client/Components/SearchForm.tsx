"use client";
import { useJobsContext } from "@/context/jobsContext";
import { location } from "@/utils/Icons";
import { Search } from "lucide-react";
import React from "react";

function SearchForm() {
  const { searchJobs, handleSearchChange, searchQuery } = useJobsContext();

  return (
    <form
    onSubmit={(e) => {
      e.preventDefault();
      searchJobs(
        searchQuery.tags,
        searchQuery.location,
        searchQuery.title
      );
    }}
    className="w-full max-w-6xl mx-auto bg-white border border-gray-200 shadow-md rounded-2xl px-6 py-8 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 transition"
  >
    {/* Title / Keywords */}
    <div className="w-full lg:flex-1 relative">
      <input
        type="text"
        name="title"
        value={searchQuery.title}
        onChange={(e) => handleSearchChange("title", e.target.value)}
        placeholder="Job Title or Keywords"
        className="w-full py-4 pl-12 pr-4 rounded-full text-base lg:text-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
    </div>
  
    {/* Divider */}
    <div className="hidden lg:block h-10 border-l border-gray-300" />
  
    {/* Location */}
    <div className="w-full lg:flex-1 relative">
      <input
        type="text"
        name="location"
        value={searchQuery.location}
        onChange={(e) => handleSearchChange("location", e.target.value)}
        placeholder="Location"
        className="w-full py-4 pl-12 pr-4 rounded-full text-base lg:text-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
        {location}
      </span>
    </div>
  
    {/* Button */}
    <button
      type="submit"
      className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base lg:text-lg px-10 py-3 rounded-full transition whitespace-nowrap"
    >
      Search
    </button>
  </form>
  

  );
}

export default SearchForm;
