"use client";

import { useSearchParams } from "next/navigation";
import BulkUploadStudent from "@/components/students/BulkUploadStudent";
import IndividualStudentForm from "@/components/students/IndividualStudentForm";

export default function AddStudentPage() {
  const params = useSearchParams();

  const type = params.get("type");
  const studentId = params.get("id");

  return (
    <>
      {type === "individual" && (
        <IndividualStudentForm studentId={studentId} />
      )}

      {type === "bulk" && <BulkUploadStudent />}
    </>
  );
}