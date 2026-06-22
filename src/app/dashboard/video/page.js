"use client";

import { motion } from "framer-motion";
import { FaPlay, FaEllipsisV } from "react-icons/fa";
import YouTubeVideoCard from "@/components/molecules/CourseCard"; // Adjust path if needed

// 1. Define the data right here in the file
const lessons = [
  {
    id: 1,
    title: "English Speaking Practice for Beginners",
    channel: "LanguageLab AI",
    views: "125K",
    uploaded: "2 weeks ago",
    duration: "12:45",
    thumbnail: "https://img.youtube.com/vi/7iobxzd_2wY/maxresdefault.jpg",
  },
  {
    id: 2,
    title: "Improve English Pronunciation Fast",
    channel: "LanguageLab AI",
    views: "210K",
    uploaded: "5 days ago",
    duration: "15:20",
    thumbnail: "https://img.youtube.com/vi/HAnw168huqA/maxresdefault.jpg",
  },
  // ... add your other items here
];

export default function VideoLessons() {
  return (
    <div className="p-6">
      <h1 className="mb-8 text-3xl font-black">English Video Lessons</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* 2. Now 'lessons' is defined and accessible */}
        {lessons.map((lesson) => (
          <YouTubeVideoCard key={lesson.id} {...lesson} />
        ))}
      </div>
    </div>
  );
}