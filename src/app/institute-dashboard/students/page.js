"use client";

import { useState, useMemo } from "react";
import DataTable from "@/components/organisms/DataTable";
import TableActions from "@/components/molecules/TableActions";
import StudentModal from "./StudentModal";
import StatusBadge from "@/components/molecules/StatusBadge";
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function StudentsPage() {
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");

const students = [
  {
    _id: 1,
    full_name: "Rahul Patil",
    email: "rahul@gmail.com",
    role: "Student",
    phone: "+91 9876543210",
    profilePhoto: "https://i.pravatar.cc/150?img=1",
    status: "Active",
  },
  {
    _id: 2,
    full_name: "Priya Sharma",
    email: "priya@gmail.com",
    role: "Student",
    phone: "+91 9988776655",
    profilePhoto: "https://i.pravatar.cc/150?img=2",
    status: "Inactive",
  },
];

  // Real-time filtering logic
  const filteredData = useMemo(() => {
  const keyword = search.toLowerCase();

  return students.filter((s) =>
    Object.values({
      full_name: s.full_name,
      email: s.email,
      phone: s.phone,
      role: s.role,
    })
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

  const handleEdit = (id) => {
    const student = students.find((item) => item._id === id);
    setMode("edit");
    setSelectedStudent(student);
    setOpenModal(true);
  };

const columns = [
  {
    title: "Profile",
    key: "profilePhoto",
    render: (row) => (
      <img
        src={
          row.profilePhoto ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            row.full_name
          )}`
        }
        alt={row.full_name}
        className="h-10 w-10 rounded-full object-cover border-2 border-slate-200"
      />
    ),
  },

  {
    title: "Full Name",
    key: "full_name",
  },

  {
    title: "Email",
    key: "email",
  },

  {
    title: "Phone",
    key: "phone",
  },

  {
    title: "Role",
    key: "role",
    render: (row) => (
      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
        {row.role}
      </span>
    ),
  },

  {
    title: "Status",
    key: "status",
    render: (row) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === "Active"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {row.status}
      </span>
    ),
  },

  {
    title: "Actions",
    key: "actions",
    render: (row) => (
      <TableActions
        onEdit={() => handleEdit(row._id)}
        onDelete={() => console.log("delete", row._id)}
        onView={() => console.log("view", row._id)}
      />
    ),
  },
];

  return (
    <div className="space-y-0">
      <DataTable
        title="Student"
        columns={columns}
        data={filteredData}
        onAdd={handleAdd} // <--- Pass the handleAdd function here
      />

      <StudentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        mode={mode}
        student={selectedStudent}
      />
    </div>
  );
}