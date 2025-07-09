"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { FaBriefcase, FaGraduationCap, FaUser, FaEdit } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";


// Your types - adjust if needed
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

interface UserProfile {
    profilePicture?: File | string | undefined;
    name: string;
    email: string;
    profession?: string;
    skills: string[];
    aboutMe?: string;
    experience: Experience[];
    education: Education[];
    phone?: string,
    languages?: string[],
    links?: string[],
    phonePrefix?: string,
    address: string,
}

type InfoRowProps = {
    label: string;
    value?: string | number | React.ReactNode | null;
    className?: string;
    emptyPlaceholder?: React.ReactNode;
};

const InfoRow: React.FC<InfoRowProps> = ({
    label,
    value,
    className = "",
    emptyPlaceholder = "—",
}) => {
    const isText = typeof value === "string" || typeof value === "number";

    return (
        <div className={`mb-4 ${className}`}>
            <p className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                {label}
            </p>
            {isText ? (
                <p className="text-gray-600">{value ?? emptyPlaceholder}</p>
            ) : (
                <div className="text-gray-600">{value ?? emptyPlaceholder}</div>
            )}
        </div>
    );
};


// Assuming you have Input, Textarea, Button, Card components available

export default function SettingsPage() {
    const [experienceErrors, setExperienceErrors] = useState<Record<number, Partial<Experience>>>({});
    const [educationErrors, setEducationErrors] = useState<Record<number, Partial<Education>>>({});
    const [globalErrors, setGlobalErrors] = useState<string[]>([]);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [originalProfile, setOriginalProfile] = useState(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const [phonePrefix, setPhonePrefix] = useState(() => {
        if (!profile?.phonePrefix) return "+1";
        if (profile.phonePrefix.startsWith("+")) {
            const match = profile.phonePrefix.match(/^\+\d+/);
            return match ? match[0] : "+1";
        }
        return "+1";
    });
    const [phone, setPhone] = useState(profile?.phone?.replace(/^\+\d+\s?/, "") || "");
    useEffect(() => {
        if (profile?.phone) {
            const stripped = profile.phone.replace(/^\+\d+\s?/, "");
            setPhone(stripped);
        }
    }, [profile?.phone]);
    useEffect(() => {
        if (profile?.phonePrefix?.startsWith("+")) {
            const match = profile.phonePrefix.match(/^\+\d+/);
            setPhonePrefix(match ? match[0] : "+1");
        }
    }, [profile?.phonePrefix]);

    const [newLanguage, setNewLanguage] = useState("");

    const imageUrl =
        profilePicturePreview ||
        (typeof profile?.profilePicture === "string" ? profile?.profilePicture : undefined) ||
        "/default.png";

    useEffect(() => {
        setGlobalErrors([]);
        setShowErrorPopup(false);
    }, []);

    useEffect(() => {
        if (globalErrors.length > 0) {
            setShowErrorPopup(true);
            const timer = setTimeout(() => {
                setShowErrorPopup(false);
                setGlobalErrors([]); // clear errors after popup disappears
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [globalErrors]);
    useEffect(() => {
        if (typeof window !== 'undefined' && profile?.profilePicture instanceof File) {
            const url = URL.createObjectURL(profile.profilePicture);
            setProfilePicturePreview(url);
            return () => URL.revokeObjectURL(url); // clean up
        }
    }, [profile?.profilePicture]);

    useEffect(() => {
        axios.get("/api/v1/me").then((res) => {
            const data = res.data;
            data.experience = data.experience?.length ? data.experience : [];
            data.education = data.education?.length ? data.education : [];
            data.skills = data.skills || [];
            setProfile(data);
        });
    }, []);
    useEffect(() => {
        return () => {
            if (profilePicturePreview) {
                URL.revokeObjectURL(profilePicturePreview);
            }
        };
    }, [profilePicturePreview]);

    function addLanguage(lang: string) {
        if (!lang) return;
        if (profile?.languages) {
            console.log(profile);
            if (profile.languages.includes(lang)) return;
            setProfile({
                ...profile,
                languages: [...profile.languages, lang],
            });
        }
    }

    function removeLanguage(index: number) {
        setProfile({
            ...profile!,
            languages: (profile!.languages ?? []).filter((_, i) => i !== index),
        });
    }

    // --- Links handlers ---
    function handleLinkChange(index: number, value: string) {
        const updatedLinks = [...(profile?.links ?? [])]; // fallback to empty array
        updatedLinks[index] = value;
        setProfile({
            ...profile!,
            links: updatedLinks,
        });
    }

    function removeLink(index: number) {
        setProfile({
            ...profile!,
            links: (profile?.links ?? []).filter((_, i) => i !== index),
        });
    }

    function addLink(p0: string) {
        setProfile({
            ...profile!,
            links: [...profile?.links!, ""],
        });
    }

    const handleSave = async () => {
        if (!profile) return;

        const experienceErrors: string[] = [];
        const educationErrors: string[] = [];
        const personalErrors: string[] = [];
        const linkErrors: string[] = [];
        const phoneErrors: string[] = []

        if (!profile.name) personalErrors.push("Name is required");
        if (!profile.profession) personalErrors.push("Profession is required");
        console.log(phone + " " + phonePrefix);
        if (phone) {
            if (!/^\d{7,15}$/.test(phone)) {
                phoneErrors.push("Phone number must be a number and consist of at least 7 digits");
            }
        }
        profile.links?.forEach((link, idx) => {
            const prefix = `Link #${idx + 1}:`;
            if (!link) linkErrors.push(`${prefix} Link is required`);
        });
        profile.experience.forEach((exp, idx) => {
            if (!exp.title) experienceErrors.push(`Experience #${idx + 1}: Title is required`);
            if (!exp.company) experienceErrors.push(`Experience #${idx + 1}: Company is required`);
            if (!exp.startDate) experienceErrors.push(`Experience #${idx + 1}: Start date is required`);
            if (!exp.endDate) experienceErrors.push(`Experience #${idx + 1}: End date is required`);
            if (exp.startDate && exp.endDate) {
                const start = new Date(exp.startDate);
                const end = new Date(exp.endDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize to midnight

                if (end <= start) {
                    experienceErrors.push(`Experience #${idx + 1}: End date must be later than Start date`);
                }

                if (start > today) {
                    experienceErrors.push(`Experience #${idx + 1}: Start date cannot be in the future`);
                }

                if (end > today) {
                    experienceErrors.push(`Experience #${idx + 1}: End date cannot be in the future`);
                }
            }
            if (!exp.description) experienceErrors.push(`Experience #${idx + 1}: Description is required`);
        });

        profile.education.forEach((edu, idx) => {
            if (!edu.institution) educationErrors.push(`Education #${idx + 1}: Institution is required`);
            if (!edu.degree) educationErrors.push(`Education #${idx + 1}: Degree is required`);
            if (!edu.fieldOfStudy) educationErrors.push(`Education #${idx + 1}: Field of study is required`);
            if (!edu.startDate) educationErrors.push(`Education #${idx + 1}: Start date is required`);
            if (!edu.endDate) educationErrors.push(`Education #${idx + 1}: End date is required`);
            if (edu.startDate && edu.endDate) {
                const start = new Date(edu.startDate);
                const end = new Date(edu.endDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // normalize to midnight for comparison

                if (end <= start) {
                    educationErrors.push(`Education #${idx + 1}: End date must be later than Start date`);
                }

                if (start > today) {
                    educationErrors.push(`Education #${idx + 1}: Start date cannot be in the future`);
                }

                if (end > today) {
                    educationErrors.push(`Education #${idx + 1}: End date cannot be in the future`);
                }
            }

        });

        const errors = [...personalErrors, ...experienceErrors, ...educationErrors, ...linkErrors, ...phoneErrors];

        if (errors.length > 0) {
            setGlobalErrors(errors);
            setShowSuccessPopup(false); // ensure only one popup
            setShowErrorPopup(true);
            setTimeout(() => setShowErrorPopup(false), 6000);
            return;
        }

        // If valid
        setGlobalErrors([]);
        setShowErrorPopup(false);
        try {
            const formData = new FormData();

            // Append all profile fields manually
            formData.append("name", profile.name);
            if (profile.profession) {
                formData.append("profession", profile.profession);
            }
            if (profile.aboutMe) {
                formData.append("aboutMe", profile.aboutMe);

            }

            // Add skills array (as JSON)
            formData.append("skills", JSON.stringify(profile.skills));

            // Add experience array
            formData.append("experience", JSON.stringify(profile.experience));

            // Add education array
            formData.append("education", JSON.stringify(profile.education));

            // Add languages array
            formData.append("languages", JSON.stringify(profile.languages));

            // Add links array
            formData.append("links", JSON.stringify(profile.links));

            // Add links array
            if (profile.phone) {
                formData.append("phone", profile.phone);
            }
            if (profile.address) {
                formData.append("address", profile.address);
            }


            if (profile.phonePrefix) {
                formData.append("phonePrefix", profile.phonePrefix);
            }



            // If there's a new image selected, add it (you must store it in state when selected)
            if (profilePictureFile) {
                formData.append("profilePicture", profilePictureFile);
            }

            await axios.put("/api/v1/update", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setEditing(false);
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 6000);
        } catch (err: any) {
            // Try to extract error message from server response
            const errorMessage =
                err?.response?.data?.message || "An unexpected error occurred. Please try again.";

            // Show popup with error message
            setGlobalErrors([errorMessage]);
            setShowSuccessPopup(false);
            setShowErrorPopup(true);
            setTimeout(() => {
                setShowErrorPopup(false);
                setGlobalErrors([]);
            }, 6000);
        }
    };



    const handleChange = (field: keyof UserProfile, value: any) => {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    };

    const handleExpChange = (index: number, key: keyof Experience, value: any) => {
        if (!profile) return;
        const updated = [...profile.experience];
        updated[index][key] = value;

        const updatedErrors = { ...experienceErrors };
        if (updatedErrors[index]?.[key]) {
            delete updatedErrors[index][key];
            if (Object.keys(updatedErrors[index]).length === 0) {
                delete updatedErrors[index];
            }
        }

        setExperienceErrors(updatedErrors);
        setProfile({ ...profile, experience: updated });
    };

    const handleEduChange = (index: number, key: keyof Education, value: any) => {
        if (!profile) return;
        const updated = [...profile.education];
        updated[index][key] = value;

        const updatedErrors = { ...educationErrors };
        if (updatedErrors[index]?.[key]) {
            delete updatedErrors[index][key];
            if (Object.keys(updatedErrors[index]).length === 0) {
                delete updatedErrors[index];
            }
        }

        setEducationErrors(updatedErrors);
        setProfile({ ...profile, education: updated });
    };

    const removeExperience = (index: number) => {
        if (!profile) return;
        const updated = profile.experience.filter((_, i) => i !== index);
        setProfile({ ...profile, experience: updated });
    };

    const removeEducation = (index: number) => {
        if (!profile) return;
        const updated = profile.education.filter((_, i) => i !== index);
        setProfile({ ...profile, education: updated });
    };

    const addSkill = () => {
        if (!profile) return;
        const skill = newSkill.trim();
        if (skill && !profile.skills.includes(skill)) {
            setProfile({ ...profile, skills: [...profile.skills, skill] });
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        if (!profile) return;
        setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skillToRemove) });
    };

    const handlePictureUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);

        setProfilePictureFile(file);
        setProfilePicturePreview(imageUrl);
    };
    const handleGenerateCV = async () => {

        const Errors: string[] = []
        if (profile) {
            if (!profile.name || !profile.name.length) Errors.push("Name is required to CV");
            if (!profile.address || !profile.address.length) Errors.push("Address is required to CV");
            if (!profile.email) Errors.push("Email is required to CV");
            if (!profile.experience.length) Errors.push("Experience is required to CV");
            if (!profile.education.length) Errors.push("Education is required to CV");
            if (!profile.languages || !profile.languages.length) Errors.push("Languages is required to CV");
            if (!profile.phone || !profile.phone.length) Errors.push("Phone is required to CV");
            if (!profile.profession || !profile.profession.length) Errors.push("Profession is required to CV");
            if (!profile.skills || !profile.skills.length) Errors.push("Skills is required to CV");
            if (!profile.aboutMe || !profile.aboutMe.length) Errors.push("About Me is required to CV");

            if (Errors.length > 0) {
                setGlobalErrors(Errors);
                setShowSuccessPopup(false); // ensure only one popup
                setShowErrorPopup(true);
                setTimeout(() => setShowErrorPopup(false), 6000);
                return;
            }
            try {
                window.open("http://localhost:8000/api/v1/cv-download", "_blank");

            } catch (err: any) {
                // Try to extract error message from server response
                const errorMessage =
                    err?.response?.data?.message || "An unexpected error occurred. Please try again.";

                // Show popup with error message
                setGlobalErrors([errorMessage]);
                setShowSuccessPopup(false);
                setShowErrorPopup(true);
                setTimeout(() => {
                    setShowErrorPopup(false);
                    setGlobalErrors([]);
                }, 6000);
            }


        }

    }

    if (!profile) {
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#7263f3] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-base">Fetching profile data...</p>
          </div>
        );
      }
      
    return (
        <>
            {showErrorPopup && globalErrors.length > 0 && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm w-full sm:max-w-xs sm:w-auto">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Please fix the following:</h3>
                    <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 max-h-40 overflow-y-auto">
                        {globalErrors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}{showSuccessPopup && (
                <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm w-full sm:max-w-xs sm:w-auto text-sm sm:text-base">
                    ✅ Profile updated successfully!
                </div>
            )}

            <Header />

            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="p-4 sm:p-6 shadow-xl space-y-6 bg-white rounded-lg">
                    <h1 className="text-2xl sm:text-3xl font-bold text-center">Profile</h1>

                    {/* Profile Picture */}
                    <>
                        {/* Profile Picture Box */}
                        <div className="flex justify-center px-4 sm:px-0">
                            <div
                                className="
        relative 
        w-32 h-32 sm:w-40 sm:h-40 
        rounded-full
        bg-gradient-to-tr from-indigo-500 to-purple-600
        p-1 shadow-xl
        transition-transform duration-300 hover:scale-105
        cursor-pointer
        flex-shrink-0
      "
                                aria-label="User profile picture"
                                role="img"
                                onClick={() => setIsOpen(true)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") setIsOpen(true);
                                }}
                            >
                                <div className="bg-white rounded-full w-full h-full overflow-hidden relative">
                                    {profile.profilePicture ? (
                                        <img
                                            src={imageUrl}
                                            alt={`${profile.name || "User"}'s profile`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-indigo-400">
                                            <FaUserCircle
                                                className="text-8xl sm:text-9xl select-none opacity-70"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fullscreen Image Viewer Modal */}
                        {isOpen && (
                            <div
                                className="
        fixed inset-0
        bg-black bg-opacity-80
        z-50
        flex items-center justify-center
        p-4
        sm:p-8
        cursor-pointer
        overflow-auto
      "
                                onClick={() => setIsOpen(false)}
                                role="dialog"
                                aria-modal="true"
                                tabIndex={-1}
                            >
                                <img
                                    src={imageUrl}
                                    alt="Full profile view"
                                    className="max-w-full max-h-full rounded-lg border-4 border-white shadow-2xl select-none"
                                    draggable={false}
                                    onClick={(e) => e.stopPropagation()}
                                /* Prevent modal close when clicking the image */
                                />
                            </div>
                        )}
                    </>



                    {editing ? (
                        <>
                            {/* Upload Section */}
                            <div className="flex justify-center px-4 sm:px-0">
                                <label
                                    htmlFor="profile-upload"
                                    className={`
      cursor-pointer 
      px-6 py-2 
      bg-indigo-600 text-white 
      rounded 
      hover:bg-indigo-700 
      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1
      transition
      ${uploading ? "opacity-50 cursor-not-allowed hover:bg-indigo-600" : ""}
      max-w-full
      whitespace-nowrap
      text-center
      sm:text-sm
      md:text-base
      inline-block
    `}
                                    aria-disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Change Profile Picture"}
                                </label>
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePictureUpload}
                                    disabled={uploading}
                                />
                            </div>


                            {/* Basic Info */}
                            <div className="max-w-xl mx-auto px-4 sm:px-0">
                                <h2 className="text-xl font-semibold border-b pb-2 mb-6">Personal Information</h2>
                                <div className="space-y-6">
                                    <input
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                                        placeholder="Name"
                                        value={profile.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                    />
                                    <input
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-sm sm:text-base"
                                        placeholder="Email"
                                        value={profile.email}
                                        disabled
                                    />
                                    <input
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                                        placeholder="Profession"
                                        value={profile.profession || ""}
                                        onChange={(e) => handleChange("profession", e.target.value)}
                                    />
                                    <input
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                                        placeholder="Address"
                                        value={profile.address || ""}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                    />

                                    {/* Skills Input with Tags */}
                                    <div>
                                        <label className="block font-semibold mb-2 text-sm sm:text-base">Skills</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {profile.skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-2 text-xs sm:text-sm"
                                                >
                                                    {skill}
                                                    <button
                                                        onClick={() => removeSkill(skill)}
                                                        className="text-indigo-800 hover:text-indigo-900 font-bold"
                                                        type="button"
                                                        aria-label={`Remove ${skill}`}
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-grow border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                                                placeholder="Add a skill"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addSkill();
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={addSkill}
                                                type="button"
                                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm sm:text-base flex-shrink-0"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base resize-y min-h-[80px]"
                                        placeholder="About Me"
                                        value={profile.aboutMe || ""}
                                        onChange={(e) => handleChange("aboutMe", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Phone with country prefix */}
                            <div className="mt-4 max-w-md mx-auto px-4 sm:px-0">
                                <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                                    Phone Number
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center">
                                    <select
                                        value={profile.phonePrefix || ""}
                                        onChange={(e) => handleChange("phonePrefix", e.target.value)}
                                        className="w-full sm:w-40 border border-gray-300 rounded px-2 py-2 text-sm sm:text-base"
                                        aria-label="Select country phone prefix"
                                    >
                                        {/* Example prefixes, you can extend or use a package */}
                                        <option value="+1">🇺🇸 +1 United States</option>
                                        <option value="+1">🇨🇦 +1 Canada</option>
                                        <option value="+93">🇦🇫 +93 Afghanistan</option>
                                        <option value="+355">🇦🇱 +355 Albania</option>
                                        <option value="+213">🇩🇿 +213 Algeria</option>
                                        <option value="+376">🇦🇩 +376 Andorra</option>
                                        <option value="+244">🇦🇴 +244 Angola</option>
                                        <option value="+672">🇦🇮 +672 Anguilla</option>
                                        <option value="+54">🇦🇷 +54 Argentina</option>
                                        <option value="+374">🇦🇲 +374 Armenia</option>
                                        <option value="+297">🇦🇼 +297 Aruba</option>
                                        <option value="+61">🇦🇺 +61 Australia</option>
                                        <option value="+43">🇦🇹 +43 Austria</option>
                                        <option value="+994">🇦🇿 +994 Azerbaijan</option>
                                        <option value="+387">🇧🇦 +387 Bosnia and Herzegovina</option>
                                        <option value="+880">🇧🇩 +880 Bangladesh</option>
                                        <option value="+32">🇧🇪 +32 Belgium</option>
                                        <option value="+226">🇧🇫 +226 Burkina Faso</option>
                                        <option value="+359">🇧🇬 +359 Bulgaria</option>
                                        <option value="+973">🇧🇭 +973 Bahrain</option>
                                        <option value="+257">🇧🇮 +257 Burundi</option>
                                        <option value="+55">🇧🇷 +55 Brazil</option>
                                        <option value="+975">🇧🇹 +975 Bhutan</option>
                                        <option value="+267">🇧🇼 +267 Botswana</option>
                                        <option value="+501">🇧🇿 +501 Belize</option>
                                        <option value="+236">🇨🇫 +236 Central African Republic</option>
                                        <option value="+56">🇨🇱 +56 Chile</option>
                                        <option value="+237">🇨🇲 +237 Cameroon</option>
                                        <option value="+86">🇨🇳 +86 China</option>
                                        <option value="+57">🇨🇴 +57 Colombia</option>
                                        <option value="+269">🇰🇲 +269 Comoros</option>
                                        <option value="+243">🇨🇩 +243 Congo (DRC)</option>
                                        <option value="+242">🇨🇬 +242 Congo (Republic)</option>
                                        <option value="+682">🇨🇰 +682 Cook Islands</option>
                                        <option value="+506">🇨🇷 +506 Costa Rica</option>
                                        <option value="+225">🇨🇮 +225 Côte d’Ivoire</option>
                                        <option value="+385">🇭🇷 +385 Croatia</option>
                                        <option value="+53">🇨🇺 +53 Cuba</option>
                                        <option value="+357">🇨🇾 +357 Cyprus</option>
                                        <option value="+420">🇨🇿 +420 Czech Republic</option>
                                        <option value="+45">🇩🇰 +45 Denmark</option>
                                        <option value="+253">🇩🇯 +253 Djibouti</option>
                                        <option value="+1767">🇩🇲 +1767 Dominica</option>
                                        <option value="+1809">🇩🇴 +1809 Dominican Republic</option>
                                        <option value="+593">🇪🇨 +593 Ecuador</option>
                                        <option value="+20">🇪🇬 +20 Egypt</option>
                                        <option value="+503">🇸🇻 +503 El Salvador</option>
                                        <option value="+372">🇪🇪 +372 Estonia</option>
                                        <option value="+251">🇪🇹 +251 Ethiopia</option>
                                        <option value="+679">🇫🇯 +679 Fiji</option>
                                        <option value="+358">🇫🇮 +358 Finland</option>
                                        <option value="+33">🇫🇷 +33 France</option>
                                        <option value="+241">🇬🇦 +241 Gabon</option>
                                        <option value="+220">🇬🇲 +220 Gambia</option>
                                        <option value="+995">🇬🇪 +995 Georgia</option>
                                        <option value="+49">🇩🇪 +49 Germany</option>
                                        <option value="+233">🇬🇭 +233 Ghana</option>
                                        <option value="+350">🇬🇮 +350 Gibraltar</option>
                                        <option value="+30">🇬🇷 +30 Greece</option>
                                        <option value="+299">🇬🇱 +299 Greenland</option>
                                        <option value="+502">🇬🇹 +502 Guatemala</option>
                                        <option value="+224">🇬🇳 +224 Guinea</option>
                                        <option value="+245">🇬🇼 +245 Guinea-Bissau</option>
                                        <option value="+592">🇬🇾 +592 Guyana</option>
                                        <option value="+509">🇭🇹 +509 Haiti</option>
                                        <option value="+504">🇭🇳 +504 Honduras</option>
                                        <option value="+36">🇭🇺 +36 Hungary</option>
                                        <option value="+354">🇮🇸 +354 Iceland</option>
                                        <option value="+91">🇮🇳 +91 India</option>
                                        <option value="+62">🇮🇩 +62 Indonesia</option>
                                        <option value="+98">🇮🇷 +98 Iran</option>
                                        <option value="+964">🇮🇶 +964 Iraq</option>
                                        <option value="+353">🇮🇪 +353 Ireland</option>
                                        <option value="+44">🇮🇲 +44 Isle of Man</option>
                                        <option value="+972">🇮🇱 +972 Israel</option>
                                        <option value="+39">🇮🇹 +39 Italy</option>
                                        <option value="+1876">🇯🇲 +1876 Jamaica</option>
                                        <option value="+81">🇯🇵 +81 Japan</option>
                                        <option value="+962">🇯🇴 +962 Jordan</option>
                                        <option value="+7">🇰🇿 +7 Kazakhstan</option>
                                        <option value="+254">🇰🇪 +254 Kenya</option>
                                        <option value="+686">🇰🇮 +686 Kiribati</option>
                                        <option value="+965">🇰🇼 +965 Kuwait</option>
                                        <option value="+996">🇰🇬 +996 Kyrgyzstan</option>
                                        <option value="+856">🇱🇦 +856 Laos</option>
                                        <option value="+371">🇱🇻 +371 Latvia</option>
                                        <option value="+961">🇱🇧 +961 Lebanon</option>
                                        <option value="+266">🇱🇸 +266 Lesotho</option>
                                        <option value="+231">🇱🇷 +231 Liberia</option>
                                        <option value="+218">🇱🇾 +218 Libya</option>
                                        <option value="+423">🇱🇮 +423 Liechtenstein</option>
                                        <option value="+370">🇱🇹 +370 Lithuania</option>
                                        <option value="+352">🇱🇺 +352 Luxembourg</option>
                                        <option value="+853">🇲🇴 +853 Macau</option>
                                        <option value="+389">🇲🇰 +389 North Macedonia</option>
                                        <option value="+261">🇲🇬 +261 Madagascar</option>
                                        <option value="+265">🇲🇼 +265 Malawi</option>
                                        <option value="+60">🇲🇾 +60 Malaysia</option>
                                        <option value="+960">🇲🇻 +960 Maldives</option>
                                        <option value="+223">🇲🇱 +223 Mali</option>
                                        <option value="+356">🇲🇹 +356 Malta</option>
                                        <option value="+692">🇲🇭 +692 Marshall Islands</option>
                                        <option value="+596">🇲🇶 +596 Martinique</option>
                                        <option value="+222">🇲🇷 +222 Mauritania</option>
                                        <option value="+230">🇲🇺 +230 Mauritius</option>
                                        <option value="+262">🇲🇷 +262 Mayotte</option>
                                        <option value="+52">🇲🇽 +52 Mexico</option>
                                        <option value="+377">🇲🇨 +377 Monaco</option>
                                        <option value="+976">🇲🇳 +976 Mongolia</option>
                                        <option value="+1664">🇲🇸 +1664 Montserrat</option>
                                        <option value="+212">🇲🇦 +212 Morocco</option>
                                        <option value="+258">🇲🇿 +258 Mozambique</option>
                                        <option value="+95">🇲🇲 +95 Myanmar</option>
                                        <option value="+264">🇳🇦 +264 Namibia</option>
                                        <option value="+674">🇳🇷 +674 Nauru</option>
                                        <option value="+977">🇳🇵 +977 Nepal</option>
                                        <option value="+31">🇳🇱 +31 Netherlands</option>
                                        <option value="+599">🇳🇱 +599 Netherlands Antilles</option>
                                        <option value="+687">🇳🇨 +687 New Caledonia</option>
                                        <option value="+64">🇳🇿 +64 New Zealand</option>
                                        <option value="+505">🇳🇮 +505 Nicaragua</option>
                                        <option value="+227">🇳🇪 +227 Niger</option>
                                        <option value="+234">🇳🇬 +234 Nigeria</option>
                                        <option value="+683">🇳🇫 +683 Norfolk Island</option>
                                        <option value="+672">🇳🇺 +672 Niue</option>
                                        <option value="+850">🇰🇵 +850 North Korea</option>
                                        <option value="+47">🇳🇴 +47 Norway</option>
                                        <option value="+968">🇴🇲 +968 Oman</option>
                                        <option value="+92">🇵🇰 +92 Pakistan</option>
                                        <option value="+680">🇵🇼 +680 Palau</option>
                                        <option value="+970">🇵🇸 +970 Palestine</option>
                                        <option value="+507">🇵🇦 +507 Panama</option>
                                        <option value="+675">🇵🇬 +675 Papua New Guinea</option>
                                        <option value="+595">🇵🇾 +595 Paraguay</option>
                                        <option value="+51">🇵🇪 +51 Peru</option>
                                        <option value="+63">🇵🇭 +63 Philippines</option>
                                        <option value="+48">🇵🇱 +48 Poland</option>
                                        <option value="+351">🇵🇹 +351 Portugal</option>
                                        <option value="+1787">🇵🇷 +1787 Puerto Rico</option>
                                        <option value="+974">🇶🇦 +974 Qatar</option>
                                        <option value="+40">🇷🇴 +40 Romania</option>
                                        <option value="+7">🇷🇺 +7 Russia</option>
                                        <option value="+250">🇷🇼 +250 Rwanda</option>
                                        <option value="+290">🇸🇭 +290 Saint Helena</option>
                                        <option value="+1869">🇰🇳 +1869 Saint Kitts and Nevis</option>
                                        <option value="+1758">🇱🇨 +1758 Saint Lucia</option>
                                        <option value="+508">🇵🇲 +508 Saint Pierre and Miquelon</option>
                                        <option value="+1784">🇻🇨 +1784 Saint Vincent and the Grenadines</option>
                                        <option value="+685">🇼🇸 +685 Samoa</option>
                                        <option value="+378">🇸🇲 +378 San Marino</option>
                                        <option value="+239">🇸🇹 +239 Sao Tome and Principe</option>
                                        <option value="+966">🇸🇦 +966 Saudi Arabia</option>
                                        <option value="+221">🇸🇳 +221 Senegal</option>
                                        <option value="+381">🇷🇸 +381 Serbia</option>
                                        <option value="+248">🇸🇨 +248 Seychelles</option>
                                        <option value="+232">🇸🇱 +232 Sierra Leone</option>
                                        <option value="+65">🇸🇬 +65 Singapore</option>
                                        <option value="+421">🇸🇰 +421 Slovakia</option>
                                        <option value="+386">🇸🇮 +386 Slovenia</option>
                                        <option value="+677">🇸🇧 +677 Solomon Islands</option>
                                        <option value="+27">🇿🇦 +27 South Africa</option>
                                        <option value="+500">🇬🇸 +500 South Georgia and the South Sandwich Islands</option>
                                        <option value="+82">🇰🇷 +82 South Korea</option>
                                        <option value="+34">🇪🇸 +34 Spain</option>
                                        <option value="+94">🇱🇰 +94 Sri Lanka</option>
                                        <option value="+249">🇸🇩 +249 Sudan</option>
                                        <option value="+597">🇸🇷 +597 Suriname</option>
                                        <option value="+268">🇸🇿 +268 Swaziland</option>
                                        <option value="+46">🇸🇪 +46 Sweden</option>
                                        <option value="+41">🇨🇭 +41 Switzerland</option>
                                        <option value="+963">🇸🇾 +963 Syria</option>
                                        <option value="+886">🇹🇼 +886 Taiwan</option>
                                        <option value="+992">🇹🇯 +992 Tajikistan</option>
                                        <option value="+255">🇹🇿 +255 Tanzania</option>
                                        <option value="+66">🇹🇭 +66 Thailand</option>
                                        <option value="+670">🇹🇱 +670 Timor-Leste</option>
                                        <option value="+228">🇹🇬 +228 Togo</option>
                                        <option value="+690">🇹🇰 +690 Tokelau</option>
                                        <option value="+676">🇹🇴 +676 Tonga</option>
                                        <option value="+1868">🇹🇹 +1868 Trinidad and Tobago</option>
                                        <option value="+216">🇹🇳 +216 Tunisia</option>
                                        <option value="+90">🇹🇷 +90 Turkey</option>
                                        <option value="+993">🇹🇲 +993 Turkmenistan</option>
                                        <option value="+1649">🇹🇨 +1649 Turks and Caicos Islands</option>
                                        <option value="+688">🇹🇻 +688 Tuvalu</option>
                                        <option value="+256">🇺🇬 +256 Uganda</option>
                                        <option value="+380">🇺🇦 +380 Ukraine</option>
                                        <option value="+971">🇦🇪 +971 United Arab Emirates</option>
                                        <option value="+44">🇬🇧 +44 United Kingdom</option>
                                        <option value="+1">🇺🇸 +1 United States</option>
                                        <option value="+598">🇺🇾 +598 Uruguay</option>
                                        <option value="+998">🇺🇿 +998 Uzbekistan</option>
                                        <option value="+678">🇻🇺 +678 Vanuatu</option>
                                        <option value="+58">🇻🇪 +123123158 Venezuela</option>
                                        <option value="+84">🇻🇳 +84 Vietnam</option>
                                        <option value="+681">🇼🇫 +681 Wallis and Futuna</option>
                                        <option value="+967">🇾🇪 +967 Yemen</option>
                                        <option value="+260">🇿🇲 +260 Zambia</option>
                                        <option value="+263">🇿🇼 +263 Zimbabwe</option>

                                        {/* add more as needed */}
                                    </select>
                                    <input
                                        type="tel"
                                        placeholder="Phone number"
                                        value={profile.phone || ""}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        className="flex-grow w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="mt-4 max-w-md mx-auto px-4 sm:px-0">
                                <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                                    Languages
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {profile.languages?.map((lang, i) => (
                                        <span
                                            key={i}
                                            className="inline-block bg-indigo-200 text-indigo-800 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full shadow-sm cursor-pointer hover:bg-indigo-300 transition"
                                            onClick={() => removeLanguage(i)}
                                            title="Click to remove"
                                        >
                                            {lang} &times;
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add a language and press Enter"
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && newLanguage.trim()) {
                                            e.preventDefault();
                                            addLanguage(newLanguage.trim());
                                            setNewLanguage("");
                                        }
                                    }}
                                    className="mt-3 w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                />
                            </div>

                            <div className="max-w-3xl mx-auto px-4 sm:px-0">
                                {/* Links */}
                                <div className="mt-4">
                                    <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                                        Links (LinkedIn, GitHub, etc.)
                                    </label>
                                    {profile.links?.map((link, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-3 w-full">
                                        <input
                                          type="url"
                                          placeholder="https://example.com"
                                          value={link}
                                          onChange={(e) => handleLinkChange(i, e.target.value)}
                                          className="flex-grow border border-gray-300 rounded px-3 py-2"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeLink(i)}
                                          className="text-red-600 hover:text-red-800 font-bold px-3 py-1 rounded"
                                          aria-label="Remove link"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                      
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const hasEmptyLink = profile.links?.some(link => !link?.trim());
                                            if (!hasEmptyLink) {
                                                setProfile({
                                                    ...profile,
                                                    links: [...(profile.links || []), ""],
                                                });
                                            }
                                        }}
                                        className="mt-2 px-5 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 text-sm sm:text-base"
                                    >
                                        + Add Link
                                    </button>
                                </div>

                                {/* Experience */}
                                <div>
                                    <h2 className="text-xl font-semibold border-b pb-2 mt-8 mb-5">Experience</h2>
                                    {profile.experience.map((exp, index) => (
                                        <div
                                            key={index}
                                            className="mb-6 p-4 relative border rounded-md shadow-sm bg-gray-50"
                                        >
                                            <button
                                                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-lg"
                                                onClick={() => removeExperience(index)}
                                                type="button"
                                                aria-label="Remove experience"
                                            >
                                                &times;
                                            </button>
                                            <div className="space-y-3">
                                                <input
                                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                                    placeholder="Title"
                                                    value={exp.title}
                                                    onChange={(e) => handleExpChange(index, "title", e.target.value)}
                                                />
                                                <input
                                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                                    placeholder="Company"
                                                    value={exp.company}
                                                    onChange={(e) => handleExpChange(index, "company", e.target.value)}
                                                />
                                                <div className="flex flex-col sm:flex-row gap-6 mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold text-gray-700 min-w-[48px]">
                                                            From:
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={exp.startDate?.slice(0, 10) || ""}
                                                            onChange={(e) => handleExpChange(index, "startDate", e.target.value)}
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold text-gray-700 min-w-[32px]">
                                                            To:
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={exp.endDate?.slice(0, 10) || ""}
                                                            onChange={(e) => handleExpChange(index, "endDate", e.target.value)}
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
                                                    placeholder="Enter the tasks one line at a time, and press Enter after each line .."
                                                    value={exp.description}
                                                    onChange={(e) => handleExpChange(index, "description", e.target.value)}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setProfile({
                                                ...profile,
                                                experience: [
                                                    ...profile.experience,
                                                    { title: "", company: "", startDate: "", endDate: "", description: "" },
                                                ],
                                            })
                                        }
                                        type="button"
                                        className="mt-2 px-5 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 text-sm sm:text-base"
                                    >
                                        + Add Experience
                                    </button>
                                </div>

                                {/* Education */}
                                <div>
                                    <h2 className="text-xl font-semibold border-b pb-2 mt-8 mb-5">Education</h2>
                                    {profile.education.map((edu, index) => (
                                        <div
                                            key={index}
                                            className="mb-6 p-4 relative border rounded-md shadow-sm bg-gray-50"
                                        >
                                            <button
                                                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-lg"
                                                onClick={() => removeEducation(index)}
                                                type="button"
                                                aria-label="Remove education"
                                            >
                                                &times;
                                            </button>
                                            <div className="space-y-3">
                                                <input
                                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                                    placeholder="Institution"
                                                    value={edu.institution}
                                                    onChange={(e) => handleEduChange(index, "institution", e.target.value)}
                                                />
                                                <input
                                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                                    placeholder="Degree"
                                                    value={edu.degree}
                                                    onChange={(e) => handleEduChange(index, "degree", e.target.value)}
                                                />
                                                <input
                                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                                    placeholder="Field of Study"
                                                    value={edu.fieldOfStudy}
                                                    onChange={(e) => handleEduChange(index, "fieldOfStudy", e.target.value)}
                                                />
                                                <div className="flex flex-col sm:flex-row gap-6 mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold text-gray-700 min-w-[48px]">
                                                            From:
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={edu.startDate?.slice(0, 10) || ""}
                                                            onChange={(e) => handleEduChange(index, "startDate", e.target.value)}
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold text-gray-700 min-w-[32px]">
                                                            To:
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={edu.endDate?.slice(0, 10) || ""}
                                                            onChange={(e) => handleEduChange(index, "endDate", e.target.value)}
                                                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setProfile({
                                                ...profile,
                                                education: [
                                                    ...profile.education,
                                                    { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" },
                                                ],
                                            })
                                        }
                                        type="button"
                                        className="mt-2 px-5 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 text-sm sm:text-base"
                                    >
                                        + Add Education
                                    </button>
                                </div>

                                {/* Save / Cancel Buttons */}
                                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">
                                    <button
                                        onClick={() => {
                                            setProfile(originalProfile); // Revert changes
                                            setEditing(false);
                                        }}
                                        type="button"
                                        className="px-5 py-2 border border-gray-400 rounded hover:bg-gray-100 w-full sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        type="button"
                                        className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full sm:w-auto"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>


                        </>
                    ) : (

                        <div className="max-w-screen-md mx-auto bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-10 font-sans select-none">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                                <InfoRow
                                    label="Name"
                                    value={
                                        profile.name ? (
                                            <span className="text-indigo-700 font-bold text-xl">{profile.name}</span>
                                        ) : (
                                            <span className="italic text-gray-400">Unnamed User</span>
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Email"
                                    value={
                                        profile.email ? (
                                            <span className="text-gray-700">{profile.email}</span>
                                        ) : (
                                            <span className="italic text-gray-400">No email provided</span>
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Links"
                                    value={
                                        profile.links && profile.links.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.links.map((link, i) => (
                                                    <a
                                                        key={i}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm hover:bg-indigo-200 transition"
                                                    >
                                                        {link}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="italic text-gray-400">No links added yet</span>
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Phone"
                                    value={
                                        profile.phone ? (
                                            <span className="text-gray-700">{profile.phonePrefix + " " + profile.phone}</span>
                                        ) : (
                                            <span className="italic text-gray-400">No phone provided</span>
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Address"
                                    value={
                                        profile.address ? (
                                            <span className="text-gray-700">{profile.address}</span>
                                        ) : (
                                            <span className="italic text-gray-400">No address provided</span>
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Profession"
                                    value={
                                        profile.profession ? (
                                            <span className="italic text-indigo-600">{profile.profession}</span>
                                        ) : (
                                            <span className="italic text-gray-400">Not specified</span>
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Skills"
                                    value={
                                        profile.skills?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.skills.map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-block bg-indigo-200 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm hover:scale-105 transform transition"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="italic text-gray-400">No skills added yet</span>
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Languages"
                                    value={
                                        profile.languages && profile.languages.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.languages.map((lang, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm"
                                                    >
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="italic text-gray-400">No languages added yet</span>
                                        )
                                    }
                                />

                                <div className="sm:col-span-2">
                                    <h3 className="text-lg font-semibold mb-2 text-indigo-700 tracking-wide border-b border-indigo-300 pb-1">
                                        About Me
                                    </h3>
                                    <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                                        {profile.aboutMe || "No bio provided."}
                                    </div>
                                </div>
                            </div>

                            {/* Experience */}
                            <section>
                                <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-700 mb-6 tracking-wide">
                                    <FaBriefcase className="text-indigo-500" />
                                    Experience
                                </h2>
                                {profile.experience?.length > 0 ? (
                                    <div className="space-y-6">
                                        {profile.experience.map((exp, i) => (
                                            <article
                                                key={i}
                                                className="group relative rounded-xl border border-indigo-300 bg-white p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                                            >
                                                <h3 className="text-xl font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                                                    {exp.title} <span className="font-normal text-gray-600">at {exp.company}</span>
                                                </h3>
                                                <time className="block text-sm text-indigo-400 mt-1">
                                                    From {exp.startDate?.slice(0, 10)} to {exp.endDate?.slice(0, 10)}
                                                </time>
                                                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="italic text-gray-400">No experience added yet.</p>
                                )}
                            </section>

                            {/* Education */}
                            <section>
                                <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-700 mb-6 tracking-wide">
                                    <FaGraduationCap className="text-indigo-500" />
                                    Education
                                </h2>
                                {profile.education?.length > 0 ? (
                                    <div className="space-y-6">
                                        {profile.education.map((edu, i) => (
                                            <article
                                                key={i}
                                                className="group relative rounded-xl border border-indigo-300 bg-white p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                                            >
                                                <h3 className="text-xl font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                                                    {edu.degree} <span className="font-normal text-gray-600">in {edu.fieldOfStudy}</span>
                                                </h3>
                                                <p className="text-gray-700">{edu.institution}</p>
                                                <time className="block text-sm text-indigo-400 mt-1">
                                                    From {edu.startDate?.slice(0, 10)} to {edu.endDate?.slice(0, 10)}
                                                </time>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="italic text-gray-400">No education added yet.</p>
                                )}
                            </section>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleGenerateCV}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-indigo-600 font-semibold rounded-2xl shadow-md hover:bg-gray-100 transition w-full sm:w-auto"
                                >
                                    Generate CV
                                </button>

                                <button
                                    onClick={() => {
                                        setOriginalProfile(JSON.parse(JSON.stringify(profile)));
                                        setEditing(true);
                                    }}
                                    type="button"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-2xl shadow-lg hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition w-full sm:w-auto"
                                    aria-label="Edit profile"
                                >
                                    <FaEdit />
                                    Edit Profile
                                </button>
                            </div>
                        </div>




                    )}
                </div>
            </div>
            <Footer />

        </>
    );
}

