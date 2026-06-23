"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "@/components/organisms/DataTable";
import TableActions from "@/components/molecules/TableActions";
import StudentModal from "./StudentModal";
import { studentApi } from "@/services/student/studentApi";
import StatusModal from "@/components/molecules/StatusModal";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");

  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

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
    return students.filter((s) =>
      [s.full_name, s.email, s.phone, s.enrollment_no, s.course, s.batch]
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentApi.deleteStudent(id);
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
      }
    }
  };

  const columns = [
    { title: "Student Name", key: "full_name" },
    { title: "Enrollment No", key: "enrollment_no" },
    { title: "Email", key: "email" },
    { title: "Phone", key: "phone" },
    { title: "Course", key: "course" },
    {
      title: "Year",
      key: "year",
      render: (row) => <span className="font-medium">Year {row.year}</span>,
    },
    { title: "Batch", key: "batch" },
    {
      title: "Status",
      key: "status",
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${row?.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
          {row?.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (row) => (
        <TableActions
          onEdit={() => handleEdit(row._id)}
          onDelete={() => handleDelete(row._id)}
          onView={() => console.log("view", row._id)}
        />
      ),
    },
  ];

  return (
    <div>
      <DataTable
        title="Students"
        columns={columns}
        data={filteredData}
        search={search}
        setSearch={setSearch}
        onAdd={handleAdd}
        loading={loading}
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

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() => setStatusData((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}