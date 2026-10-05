"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import BulkUploadStudent from "@/components/students/BulkUploadStudent";
import IndividualStudentForm from "@/components/students/IndividualStudentForm";
import { studentApi } from "@/services/student/studentApi";

function AddStudentPageContent() {
  const params = useSearchParams();

  const type = params.get("type");
  const studentId = params.get("id");

  const [segmentOptions, setSegmentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    const loadStudentOptions = async () => {
      try {
        const response = await studentApi.getStudents();

        const students =
          response.data.data.students || [];

        const segments = [
          ...new Set(
            students
              .map((student) => student.segment)
              .filter(Boolean)
          ),
        ];

        const years = [
          ...new Set(
            students
              .map((student) => student.year)
              .filter(Boolean)
          ),
        ].sort((a, b) => Number(a) - Number(b));

        setSegmentOptions(segments);
        setYearOptions(years);

      } catch (error) {
        console.error(
          "Failed to load student options",
          error
        );
      }
    };

    loadStudentOptions();
  }, []);


  return (
    <>
      {type === "individual" && (
        <IndividualStudentForm
          studentId={studentId}
          segmentOptions={segmentOptions}
          yearOptions={yearOptions}
        />
      )}

      {type === "bulk" && (
        <BulkUploadStudent />
      )}
    </>
  );
}

export default function AddStudentPage() {
  return (
    <Suspense fallback={null}>
      <AddStudentPageContent />
    </Suspense>
  );
}