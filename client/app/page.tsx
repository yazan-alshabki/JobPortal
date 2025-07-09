"use client";

import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import Image from "next/image";

import { Input } from "@/Components/ui/input";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

// Dynamically import lucide icons with no SSR to fix hydration issues
const BriefcaseIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.Briefcase),
  { ssr: false }
);
const BuildingIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.Building),
  { ssr: false }
);
const UsersIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.Users),
  { ssr: false }
);
const CheckCircleIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.CheckCircleIcon),
  { ssr: false }
);
const SearchIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.SearchIcon),
  { ssr: false }
);

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
const [searchedUsers, setSearchedUsers] = useState([]);
const [hasSearched, setHasSearched] = useState(false);

async function handleUserSearch(e: React.FormEvent) {
  e.preventDefault();
  if (!searchTerm) return;

  setHasSearched(true); // Mark that search has been done

  try {
    const res = await axios.get(
      `http://localhost:8000/api/v1/search-users`,
      {
        params: { q: searchTerm },
        withCredentials: true,
      }
    );
    setSearchedUsers(res.data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", err.response?.data || err.message);
    } else {
      console.error(err);
    }
  }
}


  const features = [
    {
      Icon: BriefcaseIcon,
      title: "Diverse Opportunities",
      description:
        "Access thousands of job listings across various industries and experience levels.",
      benefits: [
        "100,000+ active job listings",
        "50+ job categories",
        "Remote and on-site options",
      ],
      cta: "Explore Jobs",
      ctaLink: "/findwork",
    },
    {
      Icon: BuildingIcon,
      title: "Top Companies",
      description:
        "Connect with leading companies, from innovative startups to Fortune 500 corporations.",
      benefits: [
        "500+ verified employers",
        "Exclusive partnerships",
        "Direct application process",
      ],
      cta: "View Companies",
      ctaLink: "/findwork",
    },
    {
      Icon: UsersIcon,
      title: "Talent Pool",
      description:
        "Employers can access a diverse pool of qualified candidates for their open positions.",
      benefits: [
        "1M+ registered job seekers",
        "Advanced search filters",
        "AI-powered matching",
      ],
      cta: "Post a Job",
      ctaLink: "/post",
    },
  ];

  return (
    <main>
      <Header />
      <div className="relative px-16 bg-[#D7DEDC] overflow-hidden">
        {/* Background image container */}
        <Image
          src="/woman-on-phone.jpg"
          alt="woman"
          width={300}
          height={600}
          className="clip-path w-[15rem] absolute z-0 top-[0] right-[10rem] h-full object-cover opacity-60"
        />
        <Image
          src="/team.jpg"
          alt="team"
          width={300}
          height={600}
          className="clip-path-2 rotate-6 w-[15rem] absolute z-0 top-[0] right-[32rem] h-full object-cover opacity-60"
        />

        {/* Hero content */}
        <section className="relative z-10 py-24 text-center px-6 sm:px-16">
          <div className="max-w-4xl mx-auto text-black">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#7263f3]">
              Find Your Dream Job or Perfect Candidate
            </h1>
            <p className="text-xl mb-8">
              Connect with thousands of employers and job seekers on our platform
            </p>
            <div className="max-w-2xl mx-auto flex gap-4">
            <form onSubmit={handleUserSearch} className="max-w-2xl mx-auto flex gap-4">
              <Input
                type="text"
                placeholder="Search for employees"
                className="flex-grow bg-white text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" className="bg-[#7263f3] text-white flex gap-2">
                <SearchIcon className="w-5 h-5" />
                Search Users
              </Button>
            </form>

              
              
            </div>
            
          </div>
        </section>
      </div>
 {/* Show results if found */}
{searchedUsers.length > 0 && (
  <section className="py-12 bg-white border-t">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">Search Results</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {searchedUsers.map((user: any) => (
          <div key={user._id} className="bg-[#f5f5f5] rounded-lg p-4 shadow-md text-left">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={user.profilePicture || "/user.png"}
                alt={user.name}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <Button asChild className="w-full bg-[#7263f3] text-white hover:bg-[#594bcf]">
              <Link href={`http://localhost:3000/user/${user._id}`}>View Profile</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
{hasSearched && searchedUsers.length === 0 && (
  <section className="py-12 bg-white border-t">
    <div className="container mx-auto px-4 text-center">
      <p className="text-xl font-semibold text-gray-600">
        There were no users with this name.
      </p>
    </div>
  </section>
)}

      
      <section className="py-20 bg-[#f0f5fa]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose{" "}
            <span className="text-[#7263f3] font-extrabold">JobFindr</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="flex flex-col h-full rounded-xl border-none"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.Icon className="w-6 h-6 text-[#7263f3]" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={feature.ctaLink}>{feature.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Badge
              variant={"outline"}
              className="text-sm font-medium border-gray-400"
            >
              Trusted by 10,000+ companies worldwide
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-[7rem] bg-[#d7dedc]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button size={"lg"} asChild>
              <Link href={"/findwork"}>Find Work</Link>
            </Button>
            <Button size={"lg"} variant={"outline"} asChild>
              <Link href={"/post"}>Post a Job</Link>
            </Button>
          </div>
        </div>
      </section>
    
      <Footer />

    </main>
  );
}
