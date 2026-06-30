"use client";

import { useParams } from "next/navigation";
import LearningModules from "@/components/organisms/LearningModules";

export default function CoursePage() {
  const { courseId } = useParams();

  return <LearningModules courseId={courseId} />;
}