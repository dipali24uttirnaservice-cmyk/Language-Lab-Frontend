"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/organisms/DataTable";
import TableActions from "@/components/molecules/TableActions";
import { studentApi } from "@/services/student/studentApi";
import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";
import StudentViewModal from "./StudentViewModal";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import { courseApi } from "@/services/course/courseApi";
export default function StudentsPage() {

  const searchParams = useSearchParams();

const studentId = searchParams.get("id");

const mode = studentId ? "edit" : "add";
const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
const [selectedStudents, setSelectedStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
const [year, setYear] = useState("");
const [previewData, setPreviewData] = useState([]);
const [selectedFile, setSelectedFile] = useState(null);
const [showPreview, setShowPreview] = useState(false);
const [viewOpen, setViewOpen] = useState(false);
const [viewStudent, setViewStudent] = useState(null);
  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
const [showAddOptions, setShowAddOptions] = useState(false);
const showSelection = Boolean(segment && year);



const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedCourses, setSelectedCourses] = useState([]);const [courses, setCourses] = useState([]);
const [coursesModalOpen, setCoursesModalOpen] = useState(false);
const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentApi.getStudents();
const studentList = response.data.data.students || [];

setStudents(studentList); 
  } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const segmentOptions = useMemo(() => {
  return [...new Set(students.map((s) => s.segment).filter(Boolean))];
}, [students]);

const yearOptions = useMemo(() => {
  return [...new Set(students.map((s) => s.year).filter(Boolean))].sort(
    (a, b) => a - b
  );
}, [students]);

const filteredData = useMemo(() => {
  const keyword = search.trim().toLowerCase();

  return students.filter((student) => {
    const matchesSearch = [
      student.full_name,
      student.email,
      student.phone,
      student.roll_no,
      student.enrollment_no,
      student.segment,
      ...(student.purchased_courses || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(keyword);

    const matchesSegment =
      !segment || student.segment === segment;

    const matchesYear =
      !year || Number(student.year) === Number(year);

    return matchesSearch && matchesSegment && matchesYear;
  });
}, [students, search, segment, year]);

const toggleCourse = (courseId) => {
  setSelectedCourses((prev) =>
    prev.includes(courseId)
      ? prev.filter((id) => id !== courseId)
      : [...prev, courseId]
  );
};

const handleSelectStudent = (id) => {
  setSelectedStudents((prev) => {
    let updated;

    if (prev.includes(id)) {
      updated = prev.filter((x) => x !== id);
    } else {
      updated = [...prev, id];
    }

    if (updated.length > 0 && prev.length === 0) {
      openAssignModal();
    }

    if (updated.length === 0) {
      setShowAssignModal(false);
    }

    return updated;
  });
};

const handleSelectAll = (studentsOnPage) => {
  const ids = studentsOnPage.map((s) => s._id);

  const allSelected = ids.every((id) =>
    selectedStudents.includes(id)
  );

  if (allSelected) {
    setSelectedStudents((prev) =>
      prev.filter((id) => !ids.includes(id))
    );
    setShowAssignModal(false);
  } else {
    setSelectedStudents((prev) => {
      const updated = [...new Set([...prev, ...ids])];

      if (prev.length === 0) {
        openAssignModal();
      }

      return updated;
    });
  }
};

const openAssignModal = async () => {
  try {
    const response = await courseApi.getCourses();

    setCourses(response.data.data.courses || []);
    setShowAssignModal(true);
  } catch (error) {
    console.log(error);
  }
};


  const handleAdd = () => {
  setShowAddOptions(true);
};

const handleEdit = (id) => {
  router.push(
    `/institute-dashboard/students/add?type=individual&id=${id}`
  );
};

  const handleDelete = (id) => {
    setDeleteModal({ open: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await studentApi.deleteStudent(deleteModal.id);
      setStatusData({
        open: true,
        type: "success",
        title: "Deleted",
        message: "Student record removed successfully.",
      });
      loadStudents();
    } catch (error) {
      setStatusData({
        open: true,
        type: "error",
        title: "Error",
        message: "Failed to delete student.",
      });
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

const columns = [
  
  
 {
    title: "Student",
    key: "student",
    render: (row) => (
      <button
        onClick={() => handleView(row)}
        className="text-left group"
      >
        <span className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
          {row.full_name}
        </span>

        <p className="text-xs text-slate-500">
          {row.email}
        </p>
      </button>
    ),
  },

  {
    title: "Roll No & Enrollment No",
    key: "roll_no",
    render: (row) => (
      <div>
        <p className="font-medium text-slate-700">
          {row.roll_no}
        </p>

        <p className="text-xs text-slate-500">
          {row.enrollment_no}
        </p>
      </div>
    ),
  },

  {
    title: "Segment & Year",
    key: "segment_year",
    render: (row) => (
      <div>
        <p className="font-medium">
          {row.segment}
        </p>

        <p className="text-xs text-slate-500">
          Year {row.year}
        </p>
      </div>
    ),
  },
  
{
  title: "Courses",
  key: "purchased_courses",
  render: (row) => {
    const count = row.purchased_courses?.length || 0;

    return (
      <button
        disabled={count === 0}
        onClick={() => {
          setSelectedStudent(row);
          setCoursesModalOpen(true);
        }}
        className={`rounded-full px-3 py-1 text-sm font-medium transition ${
          count > 0
            ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            : "bg-slate-100 text-slate-500 cursor-default"
        }`}
      >
        {count} {count === 1 ? "Course" : "Courses"}
      </button>
    );
  },
},


  {
    title: "Status",
    key: "status",
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          row.is_active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {row.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },

  {
    title: "Actions",
    key: "actions",
    render: (row) => (
      <TableActions
        onView={() => handleView(row)}
        onEdit={() => handleEdit(row._id)}
        onDelete={() => handleDelete(row._id)}
      />
    ),
  },
];

  const handleBulkUpload = () => {
  document.getElementById("studentExcelUpload")?.click();
};

const uploadStudents = async () => {
  try {
    const userData = JSON.parse(
      Cookies.get("userData") || "{}"
    );

    const formData = new FormData();

    formData.append(
      "studentExcel",
      selectedFile
    );

    formData.append(
      "institute_id",
      userData?.institute?.id
    );

    await studentApi.bulkUploadStudents(
      formData
    );

    setStatusData({
      open: true,
      type: "success",
      title: "Upload Successful",
      message:
        "Students uploaded successfully.",
    });

    setShowPreview(false);
    setPreviewData([]);
    setSelectedFile(null);

    loadStudents();
  } catch (error) {
    setStatusData({
      open: true,
      type: "error",
      title: "Upload Failed",
      message:
        error?.response?.data?.message ||
        "Failed to upload students.",
    });
  }
};

const handleExcelChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setSelectedFile(file);

  const reader = new FileReader();

  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);

    const workbook = XLSX.read(data, {
      type: "array",
    });

    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[sheetName];

    const jsonData =
      XLSX.utils.sheet_to_json(
        worksheet
      );

    setPreviewData(jsonData);
    setShowPreview(true);
  };

  reader.readAsArrayBuffer(file);
};

const userData = JSON.parse(
  Cookies.get("userData") || "{}"
);

console.log("USER DATA", userData);
console.log("INSTITUTE", userData?.institute);
console.log("INSTITUTE ID", userData?.institute?._id);

const handleView = (student) => {
  setViewStudent(student);
  setViewOpen(true);
};


const assignCourse = async () => {
  try {
    await courseApi.bulkAssignCourses({
      student_ids: selectedStudents,
      course_ids: selectedCourses,
    });

    setStatusData({
      open: true,
      type: "success",
      title: "Success",
      message: "Courses assigned successfully.",
    });

    setShowAssignModal(false);
    setSelectedStudents([]);
    setSelectedCourses([]);

    loadStudents();
  } catch (err) {
    setStatusData({
      open: true,
      type: "error",
      title: "Assignment Failed",
      message:
        err?.response?.data?.message ||
        err?.response?.data?.success ||
        (Array.isArray(err?.response?.data?.message)
          ? err.response.data.message
              .map((e) => e.message)
              .join(", ")
          : "Failed to assign courses."),
    });

    console.error(err);
  }
};
  return (
    <div>

   
    <DataTable
  title="Students"
  columns={columns}
  data={filteredData}
  search={search}
  setSearch={setSearch}
  onAdd={handleAdd}
  onBulkUpload={handleBulkUpload}
  loading={loading}

  segment={segment}
  setSegment={setSegment}
  year={year}
  setYear={setYear}
showSelection={showSelection}
  segmentOptions={segmentOptions}
  yearOptions={yearOptions}
    selectedStudents={selectedStudents}
  onSelectStudent={handleSelectStudent}
  onSelectAll={handleSelectAll}
/>
    <input
  id="studentExcelUpload"
  type="file"
  accept=".xlsx,.xls"
  className="hidden"
  onChange={handleExcelChange}
/>

     

      {showPreview && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center">
<div className="bg-white rounded-2xl w-[80%] max-w-4xl h-[80vh] p-6 relative z-[10000] flex flex-col">   <h2 className="text-xl font-bold mb-4">
  Excel Preview ({previewData.length} Records)
</h2>

<div className="flex-1 overflow-auto border rounded-xl">        <table className="w-full text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {previewData.length > 0 &&
                Object.keys(
                  previewData[0]
                ).map((key) => (
                  <th
                    key={key}
                    className="p-3 text-left"
                  >
                    {key}
                  </th>
                ))}
            </tr>
          </thead>

          <tbody>
          
            {previewData.map(
              (row, index) => (
                <tr
                  key={index}
                  className="border-t"
                >
                  {Object.values(row).map(
                    (value, i) => (
                 <td
  key={i}
  className="p-3"
>
  {value ? String(value) : "-"}
</td>
                    )
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={() =>
            setShowPreview(false)
          }
          className="px-4 py-2 rounded-lg border"
        >
          Cancel
        </button>

        <button
          onClick={uploadStudents}
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
        >
          Upload Students
        </button>
      </div>
    </div>
  </div>
)}

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() => setStatusData((prev) => ({ ...prev, open: false }))}
      />

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student?"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <StudentViewModal
    open={viewOpen}
    onClose={() => setViewOpen(false)}
    student={viewStudent}
/>

{showAssignModal && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
    <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200/50 shadow-2xl overflow-hidden">
      
      {/* Header Container */}
      <div className="border-b border-slate-200/60 p-6 bg-gradient-to-b from-slate-50/50 to-white">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
          ✦ System Action
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Assign Course
        </h2>
        
        {/* Dynamic Badge matching the theme header elements */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''} Selected
        </div>
      </div>

      {/* Selectable Course Items List */}
      <div className="max-h-[400px] overflow-y-auto p-6 space-y-3.5 bg-slate-50/30">
        {courses.map((course) => {
          const isSelected = selectedCourses.includes(course._id);
          return (
            <label
              key={course._id}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4.5 transition duration-150 relative overflow-hidden select-none group ${
                isSelected
                  ? "border-orange-500 bg-gradient-to-b from-white to-orange-50/20 ring-4 ring-orange-500/10 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Modern Custom Styled Checkbox Variant */}
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCourse(course._id)}
                    className="sr-only peer"
                  />
                  <div className={`h-5 w-5 rounded-md border-2 transition duration-150 flex items-center justify-center ${
                    isSelected 
                      ? "border-orange-500 bg-orange-500 text-white" 
                      : "border-slate-300 group-hover:border-slate-400 bg-white"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 fill-none stroke-current stroke-[3.5]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="truncate">
                  <h3 className={`text-base font-extrabold tracking-tight transition duration-150 ${
                    isSelected ? "text-orange-600" : "text-slate-800"
                  }`}>
                    {course.course_name}
                  </h3>
                </div>
              </div>

              {/* Minimal structural star decoration for selected states */}
              <span className={`text-xs font-black transition-colors ${
                isSelected ? "text-orange-400" : "text-slate-200 group-hover:text-slate-300"
              }`}>
                ✦
              </span>
            </label>
          );
        })}
      </div>

      {/* Action Footer Actions Row */}
      <div className="flex justify-end items-center gap-3 border-t border-slate-200/60 p-5 bg-gradient-to-t from-slate-50/50 to-white">
        <button
          onClick={() => {
            setShowAssignModal(false);
            setSelectedStudents([]);
            setSelectedCourses([]);
          }}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition duration-150"
        >
          Cancel
        </button>

        <button
          disabled={selectedCourses.length === 0}
          onClick={assignCourse}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/20 hover:opacity-95 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition duration-150"
        >
          Assign Course
        </button>
      </div>

    </div>
  </div>
)}

{coursesModalOpen && selectedStudent && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">

      <div className="border-b p-6">
        <h2 className="text-2xl font-bold">
          Assigned Courses
        </h2>

        <p className="mt-1 text-slate-500">
          Student:
          <span className="ml-2 font-semibold text-slate-800">
            {selectedStudent.full_name}
          </span>
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-6">

        {selectedStudent.purchased_courses?.length > 0 ? (
  <ul className="space-y-3">
    {selectedStudent.purchased_courses.map((course, index) => (
      <div
        key={index}
        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition duration-150 group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Index tag styled like the premium brand accent icons */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xs font-black shadow-md shadow-orange-500/10 border border-white/10 transition-transform group-hover:scale-105">
            {(index + 1).toString().padStart(2, '0')}
          </div>

          <span className="text-sm font-bold text-slate-800 truncate group-hover:text-orange-600 transition duration-150">
            {course}
          </span>
        </div>

        {/* Subtle decorative chevron or star matching the design language */}
        <span className="text-xs font-bold text-slate-300 tracking-normal group-hover:text-orange-400 transition duration-150 select-none px-1">
          ✦
        </span>
      </div>
    ))}
  </ul>
) : (
  /* Empty state with premium styling */
  <div className="py-12 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
      📚
    </div>
    <p className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
      No Active Enrolments
    </p>
    <p className="text-xs font-medium text-slate-400 mt-1 max-w-[220px]">
      This student hasn't been assigned to any learning paths yet.
    </p>
  </div>
)}

      </div>

      <div className="flex justify-end border-t p-5">
        <button
          onClick={() => setCoursesModalOpen(false)}
          className="rounded-xl border px-5 py-2 hover:bg-slate-100"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}


{showAddOptions && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-6 text-white">

        <button
          onClick={() => setShowAddOptions(false)}
          className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            🎓
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Add Student
            </h2>

            <p className="mt-1 text-sm text-orange-100">
              Select how you'd like to create student records.
            </p>
          </div>
        </div>

      </div>

      {/* Body */}
      <div className="p-6 space-y-5">

        <button
          onClick={() => {
            setShowAddOptions(false);
            router.push(
              "/institute-dashboard/students/add?type=individual"
            );
          }}
          className="group flex w-full items-center gap-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-100 hover:shadow-lg"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500 text-2xl text-white">
            👤
          </div>

          <div className="flex-1 text-left">
            <h3 className="font-semibold text-slate-800 text-lg">
              Individual Student
            </h3>

            <p className="text-sm text-slate-500">
              Add one student using the complete registration form.
            </p>
          </div>

          <span className="text-2xl text-orange-500 group-hover:translate-x-1 transition">
            →
          </span>
        </button>

        <button
          onClick={() => {
            setShowAddOptions(false);
            router.push(
              "/institute-dashboard/students/add?type=bulk"
            );
          }}
          className="group flex w-full items-center gap-5 rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-50 hover:shadow-lg"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-2xl text-white">
            📄
          </div>

          <div className="flex-1 text-left">
            <h3 className="font-semibold text-slate-800 text-lg">
              Bulk Upload
            </h3>

            <p className="text-sm text-slate-500">
              Upload an Excel file to add multiple students instantly.
            </p>
          </div>

          <span className="text-2xl text-orange-500 group-hover:translate-x-1 transition">
            →
          </span>
        </button>

      </div>

      {/* Footer */}
      <div className="flex justify-end border-t bg-slate-50 px-6 py-4">

        <button
          onClick={() => setShowAddOptions(false)}
          className="rounded-xl border border-slate-300 px-6 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}