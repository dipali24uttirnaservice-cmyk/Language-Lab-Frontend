"use client";

import { useParams, useSearchParams } from "next/navigation";
import LearningModules from "@/components/organisms/LearningModules";

export default function CoursePage() {
  const { courseId } = useParams();
  const searchParams = useSearchParams();

  const courseName = searchParams.get("courseName");

  return (
    <LearningModules
      courseId={courseId}
      courseName={courseName}
    />
  );
}