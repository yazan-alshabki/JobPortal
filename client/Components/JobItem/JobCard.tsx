// Components/JobItem/JobCard.tsx
"use client";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

interface JobProps {
  job: Job;
  activeJob?: boolean;
}

export default function JobCard({ job, activeJob }: JobProps) {
  const { likeJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();
  const [isLiked, setIsLiked] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const router = useRouter();

  const { title, salaryType, salary, createdBy, applicants, jobType, createdAt } =
    job;

  useEffect(() => {
    setFormattedDate(formatDates(createdAt));
  }, [createdAt]);

  useEffect(() => {
    setIsLiked(job.likes.includes(userProfile._id));
  }, [job.likes, userProfile._id]);

  const handleLike = (id: string) => {
    if (!isAuthenticated) return void router.push("/login");
    setIsLiked((v) => !v);
    likeJob(id);
  };

  const companyDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget nunc.";

  const jobTypeBg = (type: string) =>
    ({
      "Full Time": "bg-green-100 text-green-700",
      "Part Time": "bg-purple-100 text-purple-700",
      Contract: "bg-red-100 text-red-700",
      Internship: "bg-indigo-100 text-indigo-700",
      Temporary: "bg-yellow-100 text-yellow-700",
    }[type] || "bg-gray-100 text-gray-700");

  return (
    <div
      className={`p-6 rounded-xl flex flex-col gap-5 transition-shadow ${
        activeJob
          ? "bg-gray-50 shadow-md border-l-4 border-indigo-600"
          : "bg-white hover:shadow-lg"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          className="group flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={createdBy.profilePicture || "/user.png"}
              alt={createdBy.name}
              width={48}
              height={48}
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-base md:text-lg text-gray-900 truncate group-hover:underline">
              {title}
            </h4>
            <p className="text-xs text-gray-600 truncate">
              {createdBy.name} • {applicants.length}{" "}
              {applicants.length > 1 ? "Applicants" : "Applicant"}
            </p>
          </div>
        </div>
        <button
          aria-label={isLiked ? "Unlike Job" : "Like Job"}
          className={`text-2xl flex-shrink-0 transition-colors duration-200 ${
            isLiked ? "text-indigo-600" : "text-gray-400 hover:text-gray-500"
          }`}
          onClick={() => handleLike(job._id)}
        >
          {isLiked ? bookmark : bookmarkEmpty}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {jobType.map((type, i) => (
          <span
            key={i}
            className={`py-1 px-3 text-xs font-medium rounded-md ${jobTypeBg(
              type
            )}`}
          >
            {type}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-700 line-clamp-3">{companyDescription}</p>

      <Separator />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-lg font-semibold text-gray-900">
          {formatMoney(salary, "GBP")}{" "}
          <span className="text-base font-medium text-gray-500">
            /{" "}
            {salaryType === "Yearly"
              ? "Year"
              : salaryType === "Monthly"
              ? "Month"
              : salaryType === "Weekly"
              ? "Week"
              : "Hour"}
          </span>
        </p>
        <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
          <Calendar size={16} />
          <time
            dateTime={createdAt}
            className="truncate max-w-[6rem] sm:max-w-[8rem]"
            title={new Date(createdAt).toLocaleString()}
          >
            {formattedDate}
          </time>
        </div>
      </div>
    </div>
  );
}
