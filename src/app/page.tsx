import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PopularCourses from "@/components/landing/PopularCourses";
import JoinSection from "@/components/landing/JoinSection";
import OnlineBanner from "@/components/landing/OnlineBanner";
import MentorsSection from "@/components/landing/MentorsSection";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <Navbar />
      <HeroSection />
      <PopularCourses />
      <JoinSection />
      <OnlineBanner />
      <MentorsSection />
    </main>
  );
}
