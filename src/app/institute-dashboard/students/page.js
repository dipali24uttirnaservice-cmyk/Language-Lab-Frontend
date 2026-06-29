"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "@/components/organisms/DataTable";
import TableActions from "@/components/molecules/TableActions";
import StudentModal from "./StudentModal";
import { studentApi } from "@/services/student/studentApi";
import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";
import StudentViewModal from "./StudentViewModal";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
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

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentApi.getStudents();
setStudents(
  (response.data.data || []).filter(
    (student) => student.is_active
  )
);    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

 const filteredData = useMemo(() => {
  const keyword = search.toLowerCase();

  return students.filter((student) =>
    [
      student.full_name,
      student.email,
      student.course,
      student.enrollment_no,
      student.roll_no,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword)
  );
}, [students, search]);

  const handleAdd = () => {
    setMode("add");
    setSelectedStudent(null);
    setOpenModal(true);
  };

const handleEdit = async (id) => {
  console.log("EDIT CLICKED", id);

  try {
    const response = await studentApi.getStudentById(id);

    console.log("STUDENT DATA", response.data);

    setSelectedStudent(response.data.data);
    setMode("edit");
    setOpenModal(true);
  } catch (error) {
    console.error("EDIT ERROR", error);
  }
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
  onClick={() => handleView(row._id)}
  className="text-left"
>
  <span className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
    {row.full_name}
  </span>

  <div className="text-xs text-slate-500 mt-1">
    {row.email}
  </div>

  <div className="text-xs text-slate-400">
    {row.enrollment_no}
  </div>
</button>
    ),
  },

  {
    title: "Course",
    key: "course",
    render: (row) => (
      <div>
        <p className="font-medium">{row.course}</p>
        <p className="text-xs text-slate-500">
          Year {row.year}
        </p>
      </div>
    ),
  },

  {
    title: "Last Login",
    key: "last_login",
    render: (row) =>
      row.last_login ? (
        <span className="text-sm text-slate-600">
          {new Date(row.last_login).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-slate-400">
          Never
        </span>
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
        onView={() => handleView(row._id)}
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

const handleView = async (id) => {
  try {
    setLoading(true);

    const response = await studentApi.getStudentById(id);

    setViewStudent(response.data.data);
    setViewOpen(true);
  } catch (error) {
    setStatusData({
      open: true,
      type: "error",
      title: "Error",
      message: "Unable to fetch student details.",
    });
  } finally {
    setLoading(false);
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
         sampleExcel="/sample-students.xlsx"
  loading={loading}

      />
    <input
  id="studentExcelUpload"
  type="file"
  accept=".xlsx,.xls"
  className="hidden"
  onChange={handleExcelChange}
/>

      <StudentModal
        key={openModal ? `modal-${mode}-${selectedStudent?._id || "new"}` : "closed"}
        open={openModal}
        onClose={() => setOpenModal(false)}
        mode={mode}
        student={selectedStudent}
        onSuccess={loadStudents}
        onShowStatus={(data) => setStatusData(data)}
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
    </div>
  );
}