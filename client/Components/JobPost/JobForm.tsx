"use client";
import { useGlobalContext } from "@/context/globalContext";
import React from "react";
import JobTitle from "./JobTitle";
import JobDetails from "./JobDetails";
import JobSkills from "./JobSkills ";
import JobLocation from "./JobLocation";
import { useJobsContext } from "@/context/jobsContext";

function JobForm() {
  const {
    jobTitle,
    jobDescription,
    salaryType,
    activeEmploymentTypes,
    salary,
    location,
    skills,
    negotiable,
    tags,
    resetJobForm,
  } = useGlobalContext();

  const { createJob } = useJobsContext();

  const sections = ["About", "Job Details", "Skills", "Location", "Summary"];
  const [currentSection, setCurrentSection] = React.useState(sections[0]);
  const [globalErrors, setGlobalErrors] = React.useState<string[]>([]);
  const [showErrorPopup, setShowErrorPopup] = React.useState(false);

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const renderStages = () => {
    switch (currentSection) {
      case "About":
        return <JobTitle />;
      case "Job Details":
        return <JobDetails />;
      case "Skills":
        return <JobSkills />;
      case "Location":
        return <JobLocation />;
      default:
        return null;
    }
  };

  const getCompletedColor = (section: string) => {
    switch (section) {
      case "About":
        return jobTitle && activeEmploymentTypes.length > 0
          ? "bg-[#7263F3] text-white"
          : "bg-gray-300";
      case "Job Details":
        return jobDescription && salary > 0
          ? "bg-[#7263F3] text-white"
          : "bg-gray-300";
      case "Skills":
        return skills.length > 0 && tags.length > 0
          ? "bg-[#7263F3] text-white"
          : "bg-gray-300";
      case "Location":
        return location.address && location.city && location.country
          ? "bg-[#7263F3] text-white"
          : "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  const validateCurrentSection = () => {
    let errors: string[] = [];

    switch (currentSection) {
      case "About":
        if (!jobTitle) errors.push("Job title is required.");
        if (activeEmploymentTypes.length === 0)
          errors.push("Select at least one employment type.");
        break;
      case "Job Details":
        if (!jobDescription) errors.push("Job description is required.");
        if (!salary || salary <= 0)
          errors.push("Salary must be greater than 0.");
        break;
      case "Skills":
        if (skills.length === 0) errors.push("Add at least one skill.");
        if (tags.length === 0) errors.push("Add at least one tag.");
        break;
      case "Location":
        if (!location.address) errors.push("Address field is required.");
        if (!location.city) errors.push("City field is required.");
        if (!location.country) errors.push("Country field is required.");
        break;
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let allErrors: string[] = [];

    const validations = [
      {
        section: "About",
        errors: () => {
          const errs = [];
          if (!jobTitle) errs.push("Job title is required.");
          if (activeEmploymentTypes.length === 0)
            errs.push("Select at least one employment type.");
          return errs;
        },
      },
      {
        section: "Job Details",
        errors: () => {
          const errs = [];
          if (!jobDescription) errs.push("Job description is required.");
          if (!salary || salary <= 0)
            errs.push("Salary must be greater than 0.");
          return errs;
        },
      },
      {
        section: "Skills",
        errors: () => {
          const errs = [];
          if (skills.length === 0) errs.push("Add at least one skill.");
          if (tags.length === 0) errs.push("Add at least one tag.");
          return errs;
        },
      },
      {
        section: "Location",
        errors: () => {
          const errs = [];
          if (!location.address) errs.push("Address field is required.");
          if (!location.city) errs.push("City field is required.");
          if (!location.country) errs.push("Country field is required.");
          return errs;
        },
      },
    ];

    validations.forEach((v) => {
      const errs = v.errors();
      if (errs.length > 0) {
        allErrors.push(...errs);
      }
    });

    if (allErrors.length > 0) {
      setGlobalErrors(allErrors);
      setShowErrorPopup(true);
      const firstErrorSection = validations.find((v) => v.errors().length > 0)?.section;
      if (firstErrorSection) {
        setCurrentSection(firstErrorSection);
      }
      return;
    }

    createJob({
      title: jobTitle,
      description: jobDescription,
      salaryType,
      jobType: activeEmploymentTypes,
      salary,
      location: `${location.address ? location.address + ", " : ""}${location.city ? location.city + ", " : ""}${location.country}`,
      skills,
      negotiable,
      tags,
    });

    resetJobForm();
    setShowErrorPopup(false);
  };

  const formIsValid = () =>
    jobTitle &&
    activeEmploymentTypes.length > 0 &&
    jobDescription &&
    salary > 0 &&
    skills.length > 0 &&
    tags.length > 0 &&
    location.address &&
    location.city &&
    location.country;

  React.useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => setShowErrorPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 pb-10">
      {showErrorPopup && globalErrors.length > 0 && (
        <div className="fixed top-6 right-6 bg-red-100 border border-red-400 text-red-800 px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm w-full">
          <h3 className="font-semibold mb-1">Please fix the following:</h3>
          <ul className="list-disc list-inside text-sm space-y-1 max-h-40 overflow-y-auto">
            {globalErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sidebar */}
      <div className="lg:w-1/4 w-full flex lg:flex-col flex-row flex-wrap gap-2 bg-white rounded-md shadow-sm p-2">
        {sections.map((section, index) => (
          <button
            key={index}
            className={`pl-4 py-3 relative flex items-center gap-2 font-medium w-full
              ${currentSection === section ? "text-[#7263F3]" : "text-gray-500"}`}
            onClick={() => handleSectionChange(section)}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center border border-gray-400/60 justify-center text-sm ${
                currentSection === section ? "text-white" : "text-gray-500"
              } ${getCompletedColor(section)}`}
            >
              {index + 1}
            </span>
            <span className="truncate">{section}</span>
            {currentSection === section && (
              <span className="w-1 h-full absolute left-0 top-0 bg-[#7263F3] rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Form container */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 bg-white rounded-lg shadow-md p-4 sm:p-6"
      >
        <div className="w-full">{renderStages()}</div>

        <div className="flex justify-end gap-4 mt-6 flex-wrap">
          {currentSection !== "Summary" && (
            <button
              type="button"
              className={`px-6 py-2 rounded-md w-full sm:w-auto text-center transition-colors ${
                validateCurrentSection().valid
                  ? "bg-[#7263F3] text-white hover:bg-[#5b4eea]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => {
                const { valid, errors } = validateCurrentSection();

                if (!valid) {
                  setGlobalErrors(errors);
                  setShowErrorPopup(true);
                  return;
                }

                setShowErrorPopup(false);
                const currentIndex = sections.indexOf(currentSection);
                setCurrentSection(sections[currentIndex + 1]);
              }}
            >
              Next
            </button>
          )}

          {currentSection === "Summary" && (
            <button
              type="submit"
              className={`px-6 py-2 rounded-md font-medium w-full sm:w-auto text-center transition-colors ${
                formIsValid()
                  ? "bg-[#7263F3] text-white hover:bg-[#5b4eea]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Post Job
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default JobForm;
