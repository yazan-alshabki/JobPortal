"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJobsContext } from "@/context/jobsContext";
import { useGlobalContext } from "@/context/globalContext";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { Job } from "@/types/types";
import toast from "react-hot-toast";

function ApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { jobs } = useJobsContext();
  const { userProfile } = useGlobalContext();

  const [job, setJob] = useState<Job | null>(null);
  const [applicantProfiles, setApplicantProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Add a flag to check if we are on client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateStatus = async (
    applicantId: string,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    try {
      toast.success(`Processing... !`, { duration: 4000 });

      const res = await fetch(
        `http://localhost:8000/api/v1/jobs/${id}/applicants/${applicantId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setApplicantProfiles((prev) =>
          prev.map((a) => (a._id === applicantId ? { ...a, status: newStatus } : a))
        );
        toast.success(`${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} successfully!`, { duration: 4000 });

      } else {
        toast.error("Failed to update status.", { duration: 6000 });
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  useEffect(() => {
    if (!jobs.length || !userProfile?._id) return;

    const foundJob = jobs.find((job: any) => job._id === id);
    if (!foundJob) return;

    if (foundJob.createdBy._id !== userProfile._id) {
      router.push("/dashboard");
      return;
    }

    setJob(foundJob);

    async function fetchApplicants() {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/jobs/${id}/applicants`);
        const data = await res.json();
        if (data.success) {
          setApplicantProfiles(data.applicants);
        }
      } catch (err) {
        console.error("Failed to fetch applicants", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplicants();
  }, [id, jobs, userProfile, router]);

  // Don't render UI on server, only render after client mount to avoid hydration mismatch
  if (!isClient) return null;

  if (!job || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-gray-700">
          { !job ? "Loading job details..." : "Loading applicants..." }
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 p-4 sm:p-6 w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
          Applicants for &quot;{job.title}&quot;
        </h1>

        {applicantProfiles.length === 0 ? (
          <p className="text-center text-gray-500">No applicants yet.</p>
        ) : (
          <ul className="space-y-4">
            {applicantProfiles.map((user) => (
              <li
                key={user._id}
                className="bg-white p-4 sm:p-6 rounded-md shadow flex flex-col sm:flex-row sm:items-center justify-between"
              >
                <div className="mb-4 sm:mb-0">
                  <a
                    href={`/user/${user._id}`}
                    className="font-semibold text-blue-600 hover:underline text-lg block"
                  >
                    {user.name}
                  </a>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs mt-1">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        user.status === "approved"
                          ? "text-green-600"
                          : user.status === "rejected"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </p>
                </div>

                {/* Buttons show only if pending */}
                {user.status === "pending" && (
                  <div className="flex gap-3 justify-start sm:justify-end flex-wrap">
                    <button
                      onClick={() => updateStatus(user._id, "approved")}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full sm:w-auto"
                      disabled={processing === user._id}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(user._id, "rejected")}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition w-full sm:w-auto"
                      disabled={processing === user._id}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ApplicationsPage;
