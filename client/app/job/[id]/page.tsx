"use client";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

const languageOptions = [
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "nl", label: "Dutch", flag: "🇳🇱" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "zh-CN", label: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "zh-TW", label: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
];
type SplitTranslationViewProps = {
  original: string;
  translated: string;
  language: string; // add this

};
function stripHtmlTags(htmlString: string): string {
  if (typeof window !== "undefined") {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = htmlString;
    return tmp.textContent || tmp.innerText || "";
  } else {
    // SSR fallback (simple regex)
    return htmlString.replace(/<[^>]*>/g, "");
  }
}
function htmlToPlainText(html: any) {
  // Replace <br> and </p> with new lines
  let text = html.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  // Remove all other tags
  text = text.replace(/<[^>]+>/g, "");
  // Trim excessive blank lines
  text = text.replace(/\n\s*\n/g, "\n");
  return text.trim();
}


function page() {
  const { jobs, likeJob, applyToJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();
  const params = useParams();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedDescription, setTranslatedDescription] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");



  function SplitTranslationView({ original, translated, language }: SplitTranslationViewProps) {
    const rtlLanguages = ["ar", "he", "fa", "ur"];
    const isRTL = rtlLanguages.includes(language);

    return (
      <div className="space-y-6">
        {/* Full translated text at the bottom */}
        <div
          className="mt-6 p-4 border rounded bg-green-50 whitespace-pre-wrap"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <h3 className="font-semibold mb-2">Full Translated Text</h3>
          {translated}
        </div>
      </div>
    );
  }



  async function handleTranslate() {
    setIsTranslating(true);
    try {
      const plainText = htmlToPlainText(description);

      const res = await fetch("http://localhost:8000/api/v1/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: plainText,
          language: selectedLanguage,
        }),
      });

      if (!res.ok) {
        throw new Error("Translation API error");
      }

      const data = await res.json();

      if (data.success && data.translatedText && data.translatedText.translations) {
        setTranslatedDescription(data.translatedText.translations.translation);
      } else {
        alert("Translation failed: unexpected API response");
      }
    } catch (error) {
      console.error(error);
      alert("Error translating text");
    }
    setIsTranslating(false);
  }


  const { id } = params;

  const [isLiked, setIsLiked] = React.useState(false);
  const [isApplied, setIsApplied] = React.useState(false);

  const job = jobs.find((job: Job) => job._id === id);
  const otherJobs = jobs.filter((job: Job) => job._id !== id);
  const isMyJob = job?.createdBy?._id === userProfile?._id;
  useEffect(() => {
    if (job && userProfile && userProfile._id) {
      if (job.applicants.length > 0) {
        setIsApplied(
          job.applicants.some(
            (applicant: any) =>
              applicant.user?.toString() === userProfile._id.toString()
          )
        );
      } else {
        setIsApplied(false);
      }
    } else {
      setIsApplied(false);
    }
  }, [job, userProfile]);

  React.useEffect(() => {
    if (job) {
      setIsLiked(job.likes.includes(userProfile._id));
    }
  }, [job, userProfile._id]);

  React.useEffect(() => {
    if (job?.createdAt) {
      setFormattedDate(formatDates(job.createdAt));
    }
  }, [job?.createdAt]);

  // Now early return if no job
  if (!job) return null;

  const {
    title,
    location,
    description,
    salary,
    createdBy,
    applicants,
    jobType,
    createdAt,
    salaryType,
    negotiable,
  } = job;


  const { name, profilePicture } = createdBy;

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  return (
    <main>
      <Header />

      <div className="p-8 mb-8 mx-auto w-[90%] rounded-md flex flex-col md:flex-row gap-8">
        {/* Left sidebar - Job cards */}
        <div className="md:w-[26%] w-full flex flex-col gap-8 mb-8 md:mb-0">
          <JobCard activeJob job={job} />
          {otherJobs.map((job: Job) => (
            <JobCard job={job} key={job._id} />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white p-6 rounded-md">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 relative overflow-hidden rounded-md flex items-center justify-center bg-gray-200">
                  <Image
                    src={profilePicture || "/user.png"}
                    alt={name || "User"}
                    width={45}
                    height={45}
                    className="rounded-md"
                  />
                </div>

                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-sm">Recruiter</p>
                </div>
              </div>
              <button
                className={`text-2xl ${isLiked ? "text-[#7263f3]" : "text-gray-400"}`}
                onClick={() => {
                  isAuthenticated
                    ? handleLike(job._id)
                    : router.push("http://localhost:8000/login");
                }}
              >
                {isLiked ? bookmark : bookmarkEmpty}
              </button>
            </div>

            <h1 className="text-2xl font-semibold">{title}</h1>
            <div className="flex gap-4 items-center">
              <p className="text-gray-500">{location}</p>
            </div>

            <div className="mt-2 flex gap-4 justify-between items-center flex-wrap">
              <p className="flex-1 min-w-[120px] py-2 px-4 flex flex-col items-center justify-center gap-1 bg-green-500/20 rounded-xl">
                <span className="text-sm">Salary</span>

                <span>
                  <span className="font-bold">{formatMoney(salary, "GBP")}</span>
                  <span className="font-medium text-gray-500 text-lg">
                    /
                    {salaryType
                      ? salaryType === "Yearly"
                        ? "Year"
                        : salaryType === "Monthly"
                          ? "Month"
                          : salaryType === "Weekly"
                            ? "Week"
                            : "Hour"
                      : ""}
                  </span>
                </span>
              </p>

              <p className="flex-1 min-w-[120px] py-2 px-4 flex flex-col items-center justify-center gap-1 bg-purple-500/20 rounded-xl">
                <span className="text-sm">Posted</span>
                <span className="font-bold">{formattedDate || "Loading..."}</span>
              </p>

              <p className="flex-1 min-w-[120px] py-2 px-4 flex flex-col items-center justify-center gap-1 bg-blue-500/20 rounded-xl">
                <span className="text-sm">Applicants</span>
                <span className="font-bold">{applicants.length}</span>
              </p>

              <p className="flex-1 min-w-[120px] py-2 px-4 flex flex-col items-center justify-center gap-1 bg-yellow-500/20 rounded-xl">
                <span className="text-sm">Job Type</span>
                <span className="font-bold">{jobType[0]}</span>
              </p>
            </div>

            <h2 className="font-bold text-2xl mt-2">Job Description</h2>
          </div>

          <div
            className="wysiwyg mt-2"
            dangerouslySetInnerHTML={{ __html: description }}
          ></div>
          <div className="mt-4">
            {translatedDescription ? (
              <SplitTranslationView
                original={description}
                translated={translatedDescription}
                language={selectedLanguage} // pass selected language
              />
            ) : (
              <div
                className="wysiwyg"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="p-2 border rounded w-full sm:w-auto"
            >
              {languageOptions.map(({ code, label, flag }) => (
                <option key={code} value={code}>
                  {flag} {label}
                </option>
              ))}
            </select>

            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="bg-[#7263f3] text-white py-2 px-6 rounded hover:bg-[#594bcf] disabled:opacity-50 w-full sm:w-auto"
            >
              {isTranslating ? "Translating..." : "Translate"}
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="md:w-[26%] w-full flex flex-col gap-8 mt-8 md:mt-0">
          {isMyJob ? (
            <button
              className="bg-blue-600 text-white py-4 rounded-full hover:bg-blue-700"
              onClick={() => router.push(`/dashboard/jobs/${job._id}/applications`)}
            >
              View Applications
            </button>
          ) : (
            <button
              className={`text-white py-4 rounded-full hover:bg-[#7263f3]/90 hover:text-white ${isApplied ? "bg-green-500" : "bg-[#7263f3]"
                }`}
              onClick={() => {
                if (isAuthenticated) {
                  if (!isApplied) {
                    applyToJob(job._id);
                    setIsApplied(true);
                    if (job && userProfile) {
                      job.applicants.push({ user: userProfile._id });
                    }
                  } else {
                    toast.error("You have already applied to this job");
                  }
                } else {
                  router.push("http://localhost:8000/login");
                }
              }}
            >
              {isApplied ? "Applied" : "Apply Now"}
            </button>
          )}

          <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
            <h3 className="text-lg font-semibold">Other Information</h3>

            <div className="flex flex-col gap-2">
              <p>
                <span className="font-bold">Posted:</span> {formattedDate || "Loading..."}
              </p>

              <p>
                <span className="font-bold">Salary negotiable: </span>
                <span className={`${negotiable ? "text-green-500" : "text-red-500"}`}>
                  {negotiable ? "Yes" : "No"}
                </span>
              </p>

              <p>
                <span className="font-bold">Location:</span> {location}
              </p>

              <p>
                <span className="font-bold">Job Type:</span> {jobType[0]}
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
            <h3 className="text-lg font-semibold">Tags</h3>
            <p>Other relevant tags for the job position.</p>

            <div className="flex flex-wrap gap-4">
              {job.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-1 rounded-full text-sm font-medium flex items-center bg-red-500/20 text-red-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
            <h3 className="text-lg font-semibold">Skills</h3>
            <p>
              This is a {jobType[0]} position. The successful candidate will be responsible for the following:
            </p>

            <div className="flex flex-wrap gap-4">
              {job.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-1 rounded-full text-sm font-medium flex items-center bg-indigo-500/20 text-[#7263f3]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>

  );
}

export default page;
