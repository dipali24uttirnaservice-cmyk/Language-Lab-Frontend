"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import LearningModules from "@/components/organisms/LearningModules";

function CoursePageContent() {
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

export default function CoursePage() {
  return (
    <Suspense fallback={null}>
      <CoursePageContent />
    </Suspense>
  );
}
