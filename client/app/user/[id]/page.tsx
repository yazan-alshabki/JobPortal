"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import { FaBriefcase, FaGraduationCap, FaLink, FaPhone, FaGlobe, FaLanguage } from "react-icons/fa";
import { useParams } from "next/navigation";

function ClientFormattedDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (!dateString) return;
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-GB", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    setFormattedDate(formatted);
  }, [dateString]);

  if (!formattedDate) return <time suppressHydrationWarning />;

  return <time suppressHydrationWarning>{formattedDate}</time>;
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;
  return <>{children}</>;
}

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  profession?: string;
  aboutMe?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  phone?: string;
  links?: string[];
  languages?: string[];
  address?: string;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Icon className="text-indigo-500 w-5 h-5" />
      <div className="font-semibold min-w-[90px] text-indigo-700">{label}:</div>
      <div className="flex-1 text-gray-700">{value}</div>
    </div>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id || "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchUser() {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/v1/user/${userId}`, {
          withCredentials: true,
        });
        setUser(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-base">Loading user data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-20 text-red-600 text-base">
        {error}
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-20 text-gray-600 text-base">
        User not found.
      </div>
    );
  }
  

  return (
    <ClientOnly>
      <>
        <Header />

        <main className="max-w-5xl mx-auto mt-12 mb-16 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-12 border-b border-gray-200 pb-8">
            <Image
              src={user.profilePicture || "/user.png"}
              alt={user.name}
              width={140}
              height={140}
              className="rounded-full object-cover border-4 border-indigo-500 shadow-md w-32 h-32 sm:w-36 sm:h-36"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 mb-1">{user.name}</h1>
              <p className="text-indigo-600 italic text-lg mb-1">{user.profession || "Profession not specified"}</p>
              <p className="text-gray-600 break-words max-w-full">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            <section className="break-words whitespace-normal max-w-full overflow-x-auto">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b border-indigo-300 pb-2">Basic Information</h2>
              <InfoRow
                icon={FaPhone}
                label="Phone"
                value={
                  user.phone || (
                    <span className="italic text-gray-400 break-words max-w-full">No phone provided</span>
                  )
                }
              />

              <InfoRow
                icon={FaLink}
                label="Links"
                value={
                  user.links && user.links.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                      {user.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block max-w-full break-words whitespace-normal bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full shadow hover:bg-indigo-200 transition"
                          style={{ wordBreak: "break-word" }}
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="italic text-gray-400 break-words max-w-full">No links added yet</span>
                  )
                }
              />

              <InfoRow
                icon={FaGlobe}
                label="Address"
                value={
                  user.address || (
                    <span className="italic text-gray-400 break-words max-w-full">No address provided</span>
                  )
                }
              />

              <InfoRow
                icon={FaLanguage}
                label="Languages"
                value={
                  user.languages && user.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                      {user.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full shadow break-words whitespace-normal max-w-full"
                          style={{ wordBreak: "break-word" }}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="italic text-gray-400 break-words max-w-full">No languages added yet</span>
                  )
                }
              />
            </section>

            <section className="md:col-span-2 break-words max-w-full">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6 border-b border-indigo-300 pb-2">About Me</h2>

              <p className="text-gray-700 mb-8 whitespace-pre-line break-words max-w-full min-h-[100px]">
                {user.aboutMe || <span className="italic text-gray-400">No bio provided.</span>}
              </p>

              {user.skills && user.skills.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold text-indigo-600 mb-4">Skills</h3>
                  <ul className="flex flex-wrap gap-3 mb-8 max-w-full overflow-x-auto">
                    {user.skills.map((skill, idx) => (
                      <li
                        key={idx}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-indigo-700 transition break-words whitespace-normal max-w-full"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <section className="mb-10 max-w-full break-words">
                <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-700 mb-6">
                  <FaBriefcase className="text-indigo-500" /> Experience
                </h2>
                {user.experience && user.experience.length > 0 ? (
                  <div className="space-y-6 max-w-full">
                    {user.experience.map((exp, idx) => (
                      <article
                        key={idx}
                        className="group relative rounded-xl border border-indigo-300 bg-indigo-50 p-6 shadow hover:shadow-lg transition-shadow duration-300 break-words max-w-full"
                      >
                        <h3 className="text-xl font-semibold text-indigo-800 group-hover:text-indigo-900 transition-colors break-words max-w-full">
                          {exp.title}{" "}
                          <span className="font-normal text-indigo-600 break-words max-w-full">at {exp.company}</span>
                        </h3>
                        <time className="block text-sm text-indigo-400 mt-1 break-words max-w-full">
                          From <ClientFormattedDate dateString={exp.startDate} /> to {exp.endDate ? <ClientFormattedDate dateString={exp.endDate} /> : "Present"}
                        </time>
                        <p className="mt-3 text-indigo-700 whitespace-pre-line break-words max-w-full">{exp.description}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-gray-400">No experience added yet.</p>
                )}
              </section>

              <section className="max-w-full break-words">
                <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-700 mb-6">
                  <FaGraduationCap className="text-indigo-500" /> Education
                </h2>
                {user.education && user.education.length > 0 ? (
                  <div className="space-y-6 max-w-full">
                    {user.education.map((edu, idx) => (
                      <article
                        key={idx}
                        className="group relative rounded-xl border border-indigo-300 bg-indigo-50 p-6 shadow hover:shadow-lg transition-shadow duration-300 break-words max-w-full"
                      >
                        <h3 className="text-xl font-semibold text-indigo-800 group-hover:text-indigo-900 transition-colors break-words max-w-full">
                          {edu.degree}{" "}
                          <span className="font-normal text-indigo-600 break-words max-w-full">in {edu.fieldOfStudy}</span>
                        </h3>
                        <p className="text-indigo-700 break-words max-w-full">{edu.institution}</p>
                        <time className="block text-sm text-indigo-400 mt-1 break-words max-w-full">
                          From <ClientFormattedDate dateString={edu.startDate} /> to {edu.endDate ? <ClientFormattedDate dateString={edu.endDate} /> : "Present"}
                        </time>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-gray-400">No education added yet.</p>
                )}
              </section>
            </section>
          </div>
        </main>

        <Footer />
      </>
    </ClientOnly>
  );
}
