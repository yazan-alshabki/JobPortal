// Components/Filters.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useJobsContext } from "@/context/jobsContext";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import formatMoney from "@/utils/formatMoney";
import { Input } from "./ui/input";
import { X } from "lucide-react";

export default function Filters() {
  const {
    handleFilterChange,
    filters,
    setFilters,
    minSalary,
    maxSalary,
    setMinSalary,
    setMaxSalary,
    searchJobs,
    setSearchQuery,
    searchQuery,
  } = useJobsContext();

  const clearAllFilters = () => {
    setFilters({
      fullTime: false,
      partTime: false,
      contract: false,
      internship: false,
      temporary: false,
    });
    setSearchQuery({ tags: "", location: "", title: "", skills: [] });
    setMinSalary(0);
    setMaxSalary(200000);
  };

  useEffect(() => {
    searchJobs(
      searchQuery.tags,
      searchQuery.location,
      searchQuery.title,
      minSalary,
      maxSalary,
      searchQuery.skills
    );
  }, [searchQuery, minSalary, maxSalary]);

  const [skillInput, setSkillInput] = useState("");
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const key = skillInput.trim();
    if (!key) return;
    const skills = searchQuery.skills || [];
    if (!skills.includes(key)) {
      setSearchQuery((prev: any) => ({
        ...prev,
        skills: [...skills, key],
      }));
    }
    setSkillInput("");
  };
  const handleRemoveSkill = (skill: string) => {
    setSearchQuery((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((s: string) => s !== skill),
    }));
  };

  return (
    <aside className="w-full sm:w-80 lg:w-64 bg-white p-6 rounded-2xl shadow-lg space-y-8">
      {/* Job Type */}
      <section>
        <div className="flex justify-between mb-3">
          <h3 className="text-xl font-semibold">Job Type</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={clearAllFilters}
          >
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "fullTime", label: "Full Time" },
            { id: "partTime", label: "Part Time" },
            { id: "contract", label: "Contract" },
            { id: "internship", label: "Internship" },
            { id: "temporary", label: "Temporary" },
          ].map(({ id, label }) => (
            <label key={id} className="flex items-center space-x-2">
              <Checkbox
                id={id}
                checked={filters[id]}
                onCheckedChange={() => handleFilterChange(id)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Salary Range */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Salary Range</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Min:</span>
              <span className="text-sm font-medium">
                {formatMoney(minSalary, "GBP")}
              </span>
            </div>
            <Slider
              min={0}
              max={200000}
              step={50}
              value={[minSalary]}
              onValueChange={([val]) => {
                setMinSalary(val);
                if (val > maxSalary) setMaxSalary(val);
              }}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Max:</span>
              <span className="text-sm font-medium">
                {formatMoney(maxSalary, "GBP")}
              </span>
            </div>
            <Slider
              min={0}
              max={200000}
              step={50}
              value={[maxSalary]}
              onValueChange={([val]) => {
                setMaxSalary(val);
                if (val < minSalary) setMinSalary(val);
              }}
            />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Skills</h3>
        <form onSubmit={handleAddSkill} className="flex space-x-2">
          <Input
            placeholder="Add skill"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.isArray(searchQuery.skills) &&
            searchQuery.skills.map((skill: string) => (
              <div
                key={skill}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-600"
                  aria-label={`Remove ${skill}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
        </div>
      </section>
    </aside>
  );
}
