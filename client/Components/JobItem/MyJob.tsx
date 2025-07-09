"use client";
import React, { useEffect, useState } from "react";
import { Job } from "@/types/types";
import { useJobsContext } from "@/context/jobsContext";
import Image from "next/image";
import { CardTitle } from "../ui/card";
import { formatDates } from "@/utils/fotmatDates";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

interface JobProps {
  job: Job;
}

function MyJob({ job }: JobProps) {
  const { deleteJob, likeJob } = useJobsContext();
  const { userProfile, isAuthenticated, getUserProfile } = useGlobalContext();
  const [isLiked, setIsLiked] = React.useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const router = useRouter();

  useEffect(() => {
    setFormattedDate(formatDates(job.createdAt));
  }, [job.createdAt]);

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  useEffect(() => {
    if (isAuthenticated && job.createdBy._id) {
      getUserProfile(job.createdBy._id);
    }
  }, [isAuthenticated, job.createdBy._id]);

  useEffect(() => {
    if (userProfile?._id) {
      setIsLiked(job.likes.includes(userProfile?._id));
    }
  }, [job.likes, userProfile._id]);

  return (
    <div className="p-6 sm:p-8 bg-white rounded-xl flex flex-col gap-4 sm:gap-6 shadow-md break-words min-w-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div
          className="flex items-center gap-4 cursor-pointer min-w-0"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          <Image
            alt="logo"
            src={job.createdBy.profilePicture || "/user.png"}
            width={48}
            height={48}
            className="rounded-full shadow-sm shrink-0"
          />
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg font-bold truncate">
              {job.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {job.createdBy.name}
            </p>
          </div>
        </div>

        <button
          className={`text-2xl self-start sm:self-center shrink-0 ${
            isLiked ? "text-[#7263f3]" : "text-gray-400"
          }`}
          onClick={() =>
            isAuthenticated
              ? handleLike(job._id)
              : router.push("http://localhost:8000/login")
          }
        >
          {isLiked ? bookmark : bookmarkEmpty}
        </button>
      </div>

      {/* Job Info */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground break-words">
          {job.location}
        </p>
        <p className="text-sm text-muted-foreground">
          Posted {formattedDate || "Loading..."}
        </p>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col gap-2 max-w-full">
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="break-words">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="break-words">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Delete button only visible for job creator */}
          {job.createdBy._id === userProfile?._id && (
            <div className="self-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={() => deleteJob(job._id)}
              >
                <Trash size={16} />
                <span className="sr-only">Delete job</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyJob;
