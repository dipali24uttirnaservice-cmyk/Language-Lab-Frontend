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
export default function StudentsPage() {

  const searchParams = useSearchParams();

const studentId = searchParams.get("id");

const mode = studentId ? "edit" : "add";
const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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
        onEdit={() => handleEdit(row.id)}
        onDelete={() => handleDelete(row.id)}
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

  segmentOptions={segmentOptions}
  yearOptions={yearOptions}
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