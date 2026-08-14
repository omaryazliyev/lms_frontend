import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PopularCourses from "@/components/landing/PopularCourses";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <Navbar />
      <HeroSection />
      <PopularCourses />
    </main>
  );
}
