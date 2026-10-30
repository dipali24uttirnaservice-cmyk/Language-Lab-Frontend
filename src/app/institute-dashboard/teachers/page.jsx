"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users,
  Search,
  Key,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Copy,
  Check,
  X,
  RefreshCw,
  Layers,
  GraduationCap,
  BookOpen,
  Building2,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { facultyApi } from "@/services/faculty/facultyApi";
import { courseApi } from "@/services/course/courseApi";
import { studentApi } from "@/services/student/studentApi";
import { studentLearningAccessApi } from "@/services/studentLearningAccess/studentLearningAccessApi";

// Initial seed data matching the user's design prototype
const DEFAULT_TEACHERS = [];

// Helper to format a batch for display with its department
export const getBatchDisplayLabel = (item) => {
  if (!item && item !== 0) return "";
  if (typeof item === "object" && item !== null) {
    const dept = item.department || item.segment;
    const batchNum = item.batch ?? item.year;
    return dept ? `Batch ${batchNum} (${dept})` : `Batch ${batchNum}`;
  }
  return `Batch ${item}`;
};

// Helper to check if a department + batch pair is selected in a list
export const isBatchSelectedInScope = (assignedList, dept, batchNum) => {
  if (!Array.isArray(assignedList)) return false;
  return assignedList.some((item) => {
    if (typeof item === "object" && item !== null) {
      const itemDept = item.department || item.segment;
      const itemBatch = item.batch ?? item.year;
      if (itemDept) {
        return itemDept === dept && Number(itemBatch) === Number(batchNum);
      }
      return Number(itemBatch) === Number(batchNum);
    }
    return Number(item) === Number(batchNum);
  });
};

export default function TeachersPage() {
  const router = useRouter();

  useEffect(() => {
    const role = Cookies.get("role");
    if (role === "faculty") {
      router.replace("/institute-dashboard");
    }
  }, [router]);

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Available metadata for assignment (strictly dynamic from institute data)
  const [availableCourses, setAvailableCourses] = useState([]);
  const [rawCourses, setRawCourses] = useState([]);
  const [rawStudents, setRawStudents] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [departmentBatches, setDepartmentBatches] = useState({});

  // Modals state
  const [showAssignBatchModal, setShowAssignBatchModal] = useState(false);
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignData, setAssignData] = useState({
    assigned_departments: [],
    assigned_batches: [],
    assigned_courses: [],
  });
  const [assignSaving, setAssignSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Copied alert animation
  const [copiedField, setCopiedField] = useState(null);

  // Form State for Register / Edit
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    assigned_departments: [],
    assigned_batches: [],
    assigned_courses: [],
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Load teachers from backend (with in-memory/localStorage fallback)
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await facultyApi.getTeachers();
      if (response?.data?.success && Array.isArray(response.data.data)) {
        setTeachers(response.data.data);
        return;
      }
    } catch {
      // Backend route not yet mounted -> use prototype cache/seed
      const cached = localStorage.getItem("prototype_teachers");
      if (cached) {
        try {
          setTeachers(JSON.parse(cached));
          setLoading(false);
          return;
        } catch {
          /* fallback */
        }
      }
      setTeachers(DEFAULT_TEACHERS);
      localStorage.setItem("prototype_teachers", JSON.stringify(DEFAULT_TEACHERS));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch courses and departments dynamically from institute data
  useEffect(() => {
    fetchTeachers();

    // Fetch Institute Courses
    courseApi
      .getCourses()
      .then((res) => {
        const courses = res?.data?.data?.courses || [];
        setRawCourses(courses);
        if (courses.length > 0) {
          setAvailableCourses(courses.map((c) => c.course_name));
        } else {
          setAvailableCourses(["COMMUNICATION SKILLS", "PROFESSIONAL ENGLISH", "APPLIED PHONETICS"]);
        }
      })
      .catch(() => {
        setAvailableCourses(["COMMUNICATION SKILLS", "PROFESSIONAL ENGLISH", "APPLIED PHONETICS"]);
      });

    // Fetch Departments & Batches dynamically from backend APIs
    setLoadingDepartments(true);
    Promise.allSettled([
      studentLearningAccessApi.getDepartments(),
      studentApi.getStudents(),
    ])
      .then(([accessRes, studentRes]) => {
        const deptNames = new Set();
        const batchSet = new Set();
        const map = {};

        // 1. Process structured departments from studentLearningAccess
        if (accessRes.status === "fulfilled") {
          const deptList =
            accessRes.value?.data?.data?.departments ??
            accessRes.value?.data?.departments ??
            accessRes.value?.data?.data ??
            [];
          if (Array.isArray(deptList)) {
            deptList.forEach((dept) => {
              const name = dept?.name || dept?._id;
              if (name && typeof name === "string") {
                deptNames.add(name);
                const batches = (dept.batches || []).map((b) => {
                  const yr = Number(b.year);
                  if (!isNaN(yr) && yr > 0) batchSet.add(yr);
                  return { batch: yr, studentCount: b.studentCount };
                });
                map[name] = batches;
              }
            });
          }
        }

        // 2. Process real student records to ensure all active student departments & batches are included
        if (studentRes.status === "fulfilled") {
          const students =
            studentRes.value?.data?.data?.students ??
            studentRes.value?.data?.students ??
            [];
          setRawStudents(students);
          students.forEach((s) => {
            if (s.segment && typeof s.segment === "string") {
              deptNames.add(s.segment);
            }
            const yr = Number(s.year);
            if (!isNaN(yr) && yr > 0) {
              batchSet.add(yr);
              if (s.segment) {
                if (!map[s.segment]) map[s.segment] = [];
                const existing = map[s.segment].find((b) => b.batch === yr);
                if (existing) {
                  existing.studentCount = (existing.studentCount || 0) + 1;
                } else {
                  map[s.segment].push({ batch: yr, studentCount: 1 });
                }
              }
            }
          });
        }

        setDepartmentBatches(map);
        setAvailableDepartments(Array.from(deptNames));
        if (batchSet.size > 0) {
          setAvailableBatches(Array.from(batchSet).sort((a, b) => a - b));
        }
      })
      .catch((err) => {
        console.error("Error fetching dynamic departments:", err);
      })
      .finally(() => {
        setLoadingDepartments(false);
      });
  }, [fetchTeachers]);

  // Helper to resolve raw course IDs to human-readable names
  const getCourseDisplayName = useCallback(
    (courseIdentifier) => {
      if (!courseIdentifier) return "";
      const found = rawCourses.find(
        (c) =>
          c._id === courseIdentifier ||
          c.course_code === courseIdentifier ||
          c.course_name?.toLowerCase() === courseIdentifier.toLowerCase()
      );
      return found?.course_name || courseIdentifier;
    },
    [rawCourses]
  );

  // Flow Step 2: Calculate departments offering/enrolled in the selected course(s)
  const courseLinkedDepartments = useMemo(() => {
    if (!assignData.assigned_courses.length || !rawStudents.length) {
      return [];
    }
    const selectedCourseIdentifiers = new Set(
      assignData.assigned_courses.map((c) => c.toString().toLowerCase().trim())
    );

    // Include matching rawCourse IDs and codes for selected courses
    rawCourses.forEach((rc) => {
      const cName = (rc.course_name || "").toLowerCase().trim();
      const cCode = (rc.course_code || "").toLowerCase().trim();
      if (selectedCourseIdentifiers.has(cName) || selectedCourseIdentifiers.has(cCode)) {
        if (rc._id) selectedCourseIdentifiers.add(rc._id.toString().toLowerCase().trim());
      }
    });

    const matched = new Set();
    rawStudents.forEach((student) => {
      const studentCourses = student.purchased_courses || [];
      const hasCourse = studentCourses.some((c) => {
        const id = (c?._id || c || "").toString().toLowerCase().trim();
        const name = (c?.course_name || c?.course_code || "").toString().toLowerCase().trim();
        const resolvedCourse = rawCourses.find(
          (rc) => rc._id?.toString().toLowerCase().trim() === id
        );
        const resolvedName = (resolvedCourse?.course_name || "").toLowerCase().trim();

        return (
          selectedCourseIdentifiers.has(id) ||
          (name && selectedCourseIdentifiers.has(name)) ||
          (resolvedName && selectedCourseIdentifiers.has(resolvedName))
        );
      });
      if (hasCourse && student.segment) {
        matched.add(student.segment);
      }
    });

    return [...matched];
  }, [assignData.assigned_courses, rawStudents, rawCourses]);

  // Departments to display in Step 2: dynamically prioritizing departments linked to the selected course
  const displayDepartments = useMemo(() => {
    if (courseLinkedDepartments.length > 0) {
      const remaining = availableDepartments.filter(
        (d) => !courseLinkedDepartments.includes(d)
      );
      return [...courseLinkedDepartments, ...remaining];
    }
    return availableDepartments;
  }, [courseLinkedDepartments, availableDepartments]);

  // Flow Step 3: Batches that belong to the selected departments (individually per department with label)
  const activeBatches = useMemo(() => {
    if (assignData.assigned_departments.length === 0) {
      return [];
    }

    const list = [];
    assignData.assigned_departments.forEach((deptName) => {
      const deptBatchList = departmentBatches[deptName] || [];
      const seenBatches = new Set();

      deptBatchList.forEach(({ batch, studentCount }) => {
        const bNum = Number(batch);
        if (!isNaN(bNum) && bNum > 0 && !seenBatches.has(bNum)) {
          seenBatches.add(bNum);
          list.push({
            id: `${deptName}__${bNum}`,
            department: deptName,
            batch: bNum,
            studentCount: studentCount || 0,
            label: `Batch ${bNum} (${deptName})`,
          });
        }
      });

      if (rawStudents.length > 0) {
        const studentCounts = {};
        rawStudents.forEach((student) => {
          if (student.segment === deptName && student.year != null) {
            const bNum = Number(student.year);
            if (!isNaN(bNum) && bNum > 0) {
              studentCounts[bNum] = (studentCounts[bNum] || 0) + 1;
            }
          }
        });

        Object.entries(studentCounts).forEach(([bStr, count]) => {
          const bNum = Number(bStr);
          if (!seenBatches.has(bNum)) {
            seenBatches.add(bNum);
            list.push({
              id: `${deptName}__${bNum}`,
              department: deptName,
              batch: bNum,
              studentCount: count,
              label: `Batch ${bNum} (${deptName})`,
            });
          }
        });
      }
    });

    return list.sort((a, b) => {
      if (a.department === b.department) {
        return a.batch - b.batch;
      }
      return a.department.localeCompare(b.department);
    });
  }, [assignData.assigned_departments, departmentBatches, rawStudents]);

  // Clean up selected batches if their department is no longer selected
  useEffect(() => {
    if (assignData.assigned_batches.length === 0) return;
    const validKeys = new Set(activeBatches.map((b) => `${b.department}__${b.batch}`));
    const cleaned = assignData.assigned_batches.filter((b) => {
      if (typeof b === "object" && b !== null) {
        const d = b.department || b.segment;
        const num = b.batch ?? b.year;
        return validKeys.has(`${d}__${num}`);
      }
      return true;
    });
    if (cleaned.length !== assignData.assigned_batches.length) {
      setAssignData((prev) => ({ ...prev, assigned_batches: cleaned }));
    }
  }, [activeBatches, assignData.assigned_batches]);

  const isCourseSelected = assignData.assigned_courses.length > 0;
  const isDeptSelected = assignData.assigned_departments.length > 0;
  const isBatchSelected = assignData.assigned_batches.length > 0;

  // Persist local changes to prototype cache
  const updateTeachersState = (newTeachers) => {
    setTeachers(newTeachers);
    localStorage.setItem("prototype_teachers", JSON.stringify(newTeachers));
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalFaculty = teachers.length;
    const activeAccounts = teachers.filter((t) => t.status === "active").length;
    const allDepts = new Set(teachers.flatMap((t) => t.assigned_departments || []));
    const allCourses = new Set(teachers.flatMap((t) => t.assigned_courses || []));

    return {
      totalFaculty,
      activeAccounts,
      departmentsCovered: allDepts.size,
      assignedCourses: allCourses.size,
    };
  }, [teachers]);

  // Filtered List
  const filteredTeachers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchesKeyword =
        !keyword ||
        t.full_name?.toLowerCase().includes(keyword) ||
        t.email?.toLowerCase().includes(keyword) ||
        t.phone?.toLowerCase().includes(keyword) ||
        (t.assigned_departments || []).some((d) => d.toLowerCase().includes(keyword)) ||
        (t.assigned_courses || []).some((c) => c.toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && t.status === "active") ||
        (statusFilter === "inactive" && t.status !== "active");

      return matchesKeyword && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  // Generate strong random password
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "Fac@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  // Open Assign Batch Modal
  const handleOpenAssignBatch = (teacher = null) => {
    if (teacher) {
      setAssignTeacherId(teacher._id);
      setAssignData({
        assigned_departments: teacher.assigned_departments || [],
        assigned_batches: teacher.assigned_batches || [],
        assigned_courses: teacher.assigned_courses || [],
      });
    } else {
      setAssignTeacherId("");
      setAssignData({
        assigned_departments: [],
        assigned_batches: [],
        assigned_courses: [],
      });
    }
    setShowAssignBatchModal(true);
  };

  const handleCloseAssignBatchModal = () => {
    setShowAssignBatchModal(false);
    setAssignTeacherId("");
    setAssignData({
      assigned_departments: [],
      assigned_batches: [],
      assigned_courses: [],
    });
  };

  const handleAssignTeacherSelect = (teacherId) => {
    setAssignTeacherId(teacherId);
    if (!teacherId) {
      setAssignData({
        assigned_departments: [],
        assigned_batches: [],
        assigned_courses: [],
      });
      return;
    }
    const target = teachers.find((t) => t._id === teacherId);
    if (target) {
      setAssignData({
        assigned_departments: target.assigned_departments || [],
        assigned_batches: target.assigned_batches || [],
        assigned_courses: target.assigned_courses || [],
      });
    }
  };

  const toggleAssignDepartment = (dept) => {
    setAssignData((prev) => {
      const exists = prev.assigned_departments.includes(dept);
      const nextDepartments = exists
        ? prev.assigned_departments.filter((d) => d !== dept)
        : [...prev.assigned_departments, dept];

      // Remove any assigned batches belonging to the deselected department
      const nextBatches = exists
        ? prev.assigned_batches.filter((b) => {
            if (typeof b === "object" && b !== null) {
              const d = b.department || b.segment;
              return d !== dept;
            }
            return true;
          })
        : prev.assigned_batches;

      return {
        ...prev,
        assigned_departments: nextDepartments,
        assigned_batches: nextBatches,
      };
    });
  };

  const toggleAssignBatch = (batchItem) => {
    setAssignData((prev) => {
      const targetDept = batchItem.department;
      const targetBatch = Number(batchItem.batch);

      const exists = isBatchSelectedInScope(
        prev.assigned_batches,
        targetDept,
        targetBatch
      );

      const nextBatches = exists
        ? prev.assigned_batches.filter((item) => {
            if (typeof item === "object" && item !== null) {
              const d = item.department || item.segment;
              const b = item.batch ?? item.year;
              return !(d === targetDept && Number(b) === targetBatch);
            }
            return Number(item) !== targetBatch;
          })
        : [
            ...prev.assigned_batches,
            { department: targetDept, batch: targetBatch },
          ];

      return {
        ...prev,
        assigned_batches: nextBatches,
      };
    });
  };

  const toggleAssignCourse = (course) => {
    setAssignData((prev) => {
      const exists = prev.assigned_courses.includes(course);
      return {
        ...prev,
        assigned_courses: exists
          ? prev.assigned_courses.filter((c) => c !== course)
          : [...prev.assigned_courses, course],
      };
    });
  };

  const handleAssignBatchSubmit = async (e) => {
    e.preventDefault();
    if (!assignTeacherId) {
      alert("Please select a faculty member first.");
      return;
    }
    if (assignData.assigned_courses.length === 0) {
      alert("Please select at least one course in Step 1.");
      return;
    }
    if (assignData.assigned_departments.length === 0) {
      alert("Please select at least one department in Step 2.");
      return;
    }
    if (assignData.assigned_batches.length === 0) {
      alert("Please select at least one batch (academic year) in Step 3.");
      return;
    }

    setAssignSaving(true);
    try {
      const response = await facultyApi.updateTeacher(assignTeacherId, {
        assigned_departments: assignData.assigned_departments,
        assigned_batches: assignData.assigned_batches,
        assigned_courses: assignData.assigned_courses,
      });

      if (response?.data?.success) {
        const updatedTeacher = response.data.data;
        const updated = teachers.map((t) =>
          t._id === assignTeacherId ? updatedTeacher : t
        );
        updateTeachersState(updated);
        // Clear assignment modal state
        setAssignTeacherId("");
        setAssignData({
          assigned_departments: [],
          assigned_batches: [],
          assigned_courses: [],
        });
        setShowAssignBatchModal(false);
      }
    } catch (err) {
      console.error("Failed to assign batches:", err);
      alert(err?.response?.data?.message || "Failed to update batch assignment.");
    } finally {
      setAssignSaving(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      full_name: teacher.full_name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      password: "",
      assigned_departments: teacher.assigned_departments || [],
      assigned_batches: teacher.assigned_batches || [],
      assigned_courses: teacher.assigned_courses || [],
      status: teacher.status || "active",
    });
    setShowEditModal(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const trimmedEmail = formData.email.trim().toLowerCase();
    let currentInstituteEmail = "";
    try {
      const raw = Cookies.get("userData");
      if (raw) {
        const parsed = JSON.parse(raw);
        currentInstituteEmail =
          parsed?.institute?.email || parsed?.user?.email;
      }
    } catch {}

    if (
      currentInstituteEmail &&
      trimmedEmail === currentInstituteEmail.toLowerCase()
    ) {
      alert("Cannot use the institute administrator email for a faculty account.");
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        assigned_departments: formData.assigned_departments,
        assigned_batches: formData.assigned_batches,
        assigned_courses: formData.assigned_courses,
        status: formData.status,
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const response = await facultyApi.updateTeacher(selectedTeacher._id, payload);

      if (response?.data?.success) {
        const updatedTeacher = response.data.data;
        const updated = teachers.map((t) => (t._id === selectedTeacher._id ? updatedTeacher : t));
        updateTeachersState(updated);
        setShowEditModal(false);
        return;
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update faculty.");
    }
  };

  // Toggle Status
  const handleToggleStatus = async (teacher) => {
    try {
      const response = await facultyApi.toggleStatus(teacher._id);
      if (response?.data?.success) {
        const updatedTeacher = response.data.data;
        const updated = teachers.map((t) =>
          t._id === teacher._id ? updatedTeacher : t
        );
        updateTeachersState(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Teacher
  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;
    try {
      await facultyApi.deleteTeacher(selectedTeacher._id);
      const updated = teachers.filter((t) => t._id !== selectedTeacher._id);
      updateTeachersState(updated);
      setShowDeleteModal(false);
      setSelectedTeacher(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete faculty.");
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Active batches for Add/Edit Form scoped to chosen departments
  const formActiveBatches = useMemo(() => {
    if (formData.assigned_departments.length === 0) {
      return availableBatches.map((b) => ({
        id: `batch__${b}`,
        department: "",
        batch: b,
        label: `Batch ${b}`,
      }));
    }

    const list = [];
    formData.assigned_departments.forEach((deptName) => {
      const deptBatchList = departmentBatches[deptName] || [];
      const seenBatches = new Set();
      deptBatchList.forEach(({ batch }) => {
        const bNum = Number(batch);
        if (!isNaN(bNum) && bNum > 0 && !seenBatches.has(bNum)) {
          seenBatches.add(bNum);
          list.push({
            id: `${deptName}__${bNum}`,
            department: deptName,
            batch: bNum,
            label: `Batch ${bNum} (${deptName})`,
          });
        }
      });

      if (seenBatches.size === 0 && availableBatches.length > 0) {
        availableBatches.forEach((bNum) => {
          list.push({
            id: `${deptName}__${bNum}`,
            department: deptName,
            batch: bNum,
            label: `Batch ${bNum} (${deptName})`,
          });
        });
      }
    });

    return list;
  }, [formData.assigned_departments, departmentBatches, availableBatches]);

  // Toggle department selection in form
  const toggleDepartment = (dept) => {
    setFormData((prev) => {
      const exists = prev.assigned_departments.includes(dept);
      const nextDepts = exists
        ? prev.assigned_departments.filter((d) => d !== dept)
        : [...prev.assigned_departments, dept];

      const nextBatches = exists
        ? prev.assigned_batches.filter((b) => {
            if (typeof b === "object" && b !== null) {
              const d = b.department || b.segment;
              return d !== dept;
            }
            return true;
          })
        : prev.assigned_batches;

      return {
        ...prev,
        assigned_departments: nextDepts,
        assigned_batches: nextBatches,
      };
    });
  };

  // Toggle batch selection in form
  const toggleBatch = (item) => {
    setFormData((prev) => {
      const targetDept = typeof item === "object" && item !== null ? item.department : "";
      const targetBatch = typeof item === "object" && item !== null ? Number(item.batch) : Number(item);
      const exists = isBatchSelectedInScope(prev.assigned_batches, targetDept, targetBatch);

      const nextBatches = exists
        ? prev.assigned_batches.filter((b) => {
            if (typeof b === "object" && b !== null) {
              const d = b.department || b.segment;
              const num = b.batch ?? b.year;
              return !(d === targetDept && Number(num) === targetBatch);
            }
            return Number(b) !== targetBatch;
          })
        : [
            ...prev.assigned_batches,
            targetDept
              ? { department: targetDept, batch: targetBatch }
              : targetBatch,
          ];

      return {
        ...prev,
        assigned_batches: nextBatches,
      };
    });
  };

  // Toggle course selection in form
  const toggleCourse = (course) => {
    setFormData((prev) => {
      const exists = prev.assigned_courses.includes(course);
      return {
        ...prev,
        assigned_courses: exists
          ? prev.assigned_courses.filter((c) => c !== course)
          : [...prev.assigned_courses, course],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Section (Matching Screenshot) ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Faculty Management
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Register teachers, auto-generate access credentials, and assign departmental scope.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenAssignBatch()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-indigo-50/50 text-indigo-700 font-bold text-sm border-2 border-indigo-200/80 hover:border-indigo-400 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Layers size={18} className="text-indigo-600" />
            <span>Assign Batch</span>
          </button>

          <Link
            href="/institute-dashboard/teachers/register"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>Register Faculty</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Metric KPI Cards (Matching Screenshot) ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Total Faculty
          </p>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {stats.totalFaculty}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Active Accounts
          </p>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {stats.activeAccounts}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Departments Covered
          </p>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {stats.departmentsCovered}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Assigned Courses
          </p>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {stats.assignedCourses}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls (Matching Screenshot) ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, email, department..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Faculty Data Table (Matching Screenshot) ─────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Faculty Member</th>
                <th className="py-4 px-6">Assigned Departments</th>
                <th className="py-4 px-6">Assigned Batches</th>
                <th className="py-4 px-6">Courses</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Last Login</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <span className="text-xs font-semibold">Loading faculty members...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mx-auto">
                        <Users size={24} />
                      </div>
                      <h3 className="text-base font-bold text-slate-700">No faculty members found</h3>
                      <p className="text-xs text-slate-400">
                        {search
                          ? "Try adjusting your search criteria."
                          : "Click 'Register Faculty' to onboard your first teacher."}
                      </p>
                      {!search && (
                        <Link
                          href="/institute-dashboard/teachers/register"
                          className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                        >
                          <UserPlus size={14} />
                          <span>Register First Faculty</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const initial = (teacher.full_name || "T").charAt(0).toUpperCase();

                  return (
                    <tr
                      key={teacher._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Faculty Member Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm shadow-md shadow-indigo-500/20">
                            {initial}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                              {teacher.full_name}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-400 mt-1">
                              <span className="inline-flex items-center gap-1">
                                <Mail size={12} className="text-slate-400" />
                                {teacher.email}
                              </span>
                              {teacher.phone && (
                                <span className="inline-flex items-center gap-1">
                                  <Phone size={12} className="text-slate-400" />
                                  {teacher.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Departments */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {(teacher.assigned_departments || []).length > 0 ? (
                            teacher.assigned_departments.map((dept) => (
                              <span
                                key={dept}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                              >
                                {dept}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Batches */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {(teacher.assigned_batches || []).length > 0 ? (
                            teacher.assigned_batches.map((batch, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                              >
                                {getBatchDisplayLabel(batch)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Courses */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {(teacher.assigned_courses || []).length > 0 ? (
                            teacher.assigned_courses.map((course) => (
                              <span
                                key={course}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200/80"
                              >
                                {getCourseDisplayName(course)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(teacher)}
                          title="Click to toggle active status"
                          className="inline-flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              teacher.status === "active"
                                ? "bg-emerald-500 ring-4 ring-emerald-100"
                                : "bg-slate-300"
                            }`}
                          />
                          <span
                            className={
                              teacher.status === "active"
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }
                          >
                            {teacher.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {teacher.last_login
                          ? new Date(teacher.last_login).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Credentials */}
                          <button
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setShowCredentialsModal(true);
                            }}
                            title="View / Copy Credentials"
                            aria-label="View Credentials"
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                          >
                            <Key size={16} />
                          </button>

                          {/* Assign Batch */}
                          <button
                            type="button"
                            onClick={() => handleOpenAssignBatch(teacher)}
                            title="Assign Batches & Scope"
                            aria-label="Assign Batch"
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer inline-flex items-center justify-center"
                          >
                            <Layers size={16} />
                          </button>

                          {/* Edit Details */}
                          <Link
                            href={`/institute-dashboard/teachers/register?id=${teacher._id}`}
                            title="Edit Faculty Member"
                            aria-label="Edit Faculty"
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all cursor-pointer inline-flex items-center justify-center"
                          >
                            <Edit3 size={16} />
                          </Link>

                          {/* Delete Account */}
                          <button
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Faculty Account"
                            aria-label="Delete Faculty"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ASSIGN BATCH & DEPARTMENT ─────────────────────────────────── */}
      <AnimatePresence>
        {showAssignBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
                    <Layers size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Assign Batch & Scope
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Flow: Select Course ➔ Choose Departments ➔ Assign Batches
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignBatchModal(false)}
                  onClick={handleCloseAssignBatchModal}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAssignBatchSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ── FACULTY SELECTOR ────────────────────────────────────── */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Selected Faculty Member *
                  </label>
                  {teachers.length === 0 ? (
                    <p className="text-xs text-rose-500 font-semibold">
                      No faculty members registered yet. Please register a faculty member first.
                    </p>
                  ) : (
                    <select
                      value={assignTeacherId}
                      onChange={(e) => handleAssignTeacherSelect(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">-- Select Faculty Member --</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.full_name} ({t.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* ── STEP 1: SELECT COURSE ────────────────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black">
                        1
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        <BookOpen size={16} className="text-amber-600" />
                        <span>Step 1: Select Course *</span>
                      </h3>
                    </div>
                    {isCourseSelected && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                        <Check size={12} /> Course Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Choose the Language Lab subject this faculty member will instruct.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableCourses.map((course) => {
                      const isSelected = assignData.assigned_courses.includes(course);
                      return (
                        <button
                          key={course}
                          type="button"
                          onClick={() => toggleAssignCourse(course)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                          }`}
                        >
                          <span>{course}</span>
                          {isSelected && <Check size={14} className="stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── STEP 2: SELECT DEPARTMENTS (ACCORDING TO COURSE) ───────── */}
                <div
                  className={`space-y-3 transition-opacity duration-300 ${
                    isCourseSelected ? "opacity-100" : "opacity-40 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-black">
                        2
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Building2 size={16} className="text-indigo-600" />
                        <span>Step 2: Select Department(s) *</span>
                      </h3>
                    </div>

                    {isCourseSelected && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setAssignData((prev) => ({
                              ...prev,
                              assigned_departments: [...displayDepartments],
                            }))
                          }
                          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAssignData((prev) => ({
                              ...prev,
                              assigned_departments: [],
                            }))
                          }
                          className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    {courseLinkedDepartments.length > 0
                      ? "Departments with students taking the selected course are prioritized."
                      : "Choose the departmental branches for this course."}
                  </p>

                  {!isCourseSelected ? (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                      <span>👈 Please select a course in Step 1 first to reveal departments.</span>
                    </div>
                  ) : loadingDepartments ? (
                    <div className="flex items-center gap-2 p-3 text-xs text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200">
                      <RefreshCw size={14} className="animate-spin text-indigo-500" />
                      <span>Loading dynamic departments...</span>
                    </div>
                  ) : displayDepartments.length === 0 ? (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800 font-medium">
                      No departments found for this institute. Please ensure students have a department/segment assigned in the Students section.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {displayDepartments.map((dept) => {
                          const isSelected = assignData.assigned_departments.includes(dept);
                          const isLinked = courseLinkedDepartments.includes(dept);
                          return (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => toggleAssignDepartment(dept)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/50"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                              }`}
                            >
                              <span>{dept}</span>
                              {isLinked && !isSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Enrolled students found" />
                              )}
                              {isSelected && <Check size={14} className="stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* ── STEP 3: SELECT BATCH (DYNAMIC FROM BACKEND) ───── */}
                <div
                  className={`space-y-3 transition-opacity duration-300 ${
                    isDeptSelected ? "opacity-100" : "opacity-40 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                        3
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        <GraduationCap size={16} className="text-emerald-600" />
                        <span>Step 3: Select Batch *</span>
                      </h3>
                    </div>

                    {isDeptSelected && activeBatches.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setAssignData((prev) => ({
                              ...prev,
                              assigned_batches: activeBatches.map((b) => ({
                                department: b.department,
                                batch: b.batch,
                              })),
                            }))
                          }
                          className="text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAssignData((prev) => ({
                              ...prev,
                              assigned_batches: [],
                            }))
                          }
                          className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Dynamic student batches eligible to access this course under this faculty member.
                  </p>

                  {!isDeptSelected ? (
                    <div className="p-3 bg-indigo-50/60 border border-indigo-200/60 rounded-xl text-xs text-indigo-800 font-medium flex items-center gap-2">
                      <span>👈 Please select at least one department in Step 2 first.</span>
                    </div>
                  ) : activeBatches.length === 0 ? (
                    <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-800 font-semibold flex items-center gap-2.5">
                      <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                      <span>No batch available for the selected department(s).</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {activeBatches.map((item) => {
                        const isSelected = isBatchSelectedInScope(
                          assignData.assigned_batches,
                          item.department,
                          item.batch
                        );
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleAssignBatch(item)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/50"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                            }`}
                          >
                            <span>
                              Batch {item.batch}{" "}
                              <span
                                className={`text-[11px] font-semibold ${
                                  isSelected ? "text-emerald-100" : "text-slate-500"
                                }`}
                              >
                                ({item.department})
                              </span>
                            </span>
                            {item.studentCount != null && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                  isSelected
                                    ? "bg-emerald-700 text-emerald-100"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {item.studentCount} student{item.studentCount === 1 ? "" : "s"}
                              </span>
                            )}
                            {isSelected && <Check size={14} className="stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── ALLOCATION SUMMARY BANNER ────────────────────────────── */}
                {(isCourseSelected || isDeptSelected || isBatchSelected) && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/40 border border-indigo-100 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold text-indigo-700 tracking-wider">
                      Assignment Summary Preview
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">Course:</span>
                      {assignData.assigned_courses.length > 0 ? (
                        assignData.assigned_courses.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs uppercase">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None selected</span>
                      )}

                      <span className="text-slate-300 mx-1">|</span>

                      <span className="font-bold text-slate-700">Departments:</span>
                      {assignData.assigned_departments.length > 0 ? (
                        assignData.assigned_departments.map((d) => (
                          <span key={d} className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs">
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None selected</span>
                      )}

                      <span className="text-slate-300 mx-1">|</span>

                      <span className="font-bold text-slate-700">Batches:</span>
                      {assignData.assigned_batches.length > 0 ? (
                        assignData.assigned_batches.map((b, idx) => (
                          <span
                            key={
                              typeof b === "object" && b !== null
                                ? `${b.department || b.segment}-${b.batch || b.year}`
                                : idx
                            }
                            className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs"
                          >
                            {getBatchDisplayLabel(b)}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None selected</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignBatchModal(false)}
                    onClick={handleCloseAssignBatchModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      assignSaving ||
                      teachers.length === 0 ||
                      !assignTeacherId ||
                      !isCourseSelected ||
                      !isDeptSelected ||
                      !isBatchSelected
                    }
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {assignSaving ? "Saving Assignment..." : "Save Batch Assignment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: VIEW / COPY CREDENTIALS ─────────────────────────────────── */}
      <AnimatePresence>
        {showCredentialsModal && selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Access Credentials</h3>
                    <p className="text-xs text-slate-400">Share with faculty for portal login</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Credential Cards */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Portal Login URL
                  </span>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mt-1">
                    <span className="truncate">{typeof window !== "undefined" ? `${window.location.origin}/login` : "/login"}</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          typeof window !== "undefined" ? `${window.location.origin}/login` : "/login",
                          "url"
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-800 cursor-pointer ml-2"
                    >
                      {copiedField === "url" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Login Email
                  </span>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mt-1">
                    <span>{selectedTeacher.email}</span>
                    <button
                      onClick={() => copyToClipboard(selectedTeacher.email, "email")}
                      className="text-indigo-600 hover:text-indigo-800 cursor-pointer ml-2"
                    >
                      {copiedField === "email" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Password
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-700 mt-1">
                    <span>{selectedTeacher.password || "Teach@123"}</span>
                    <button
                      onClick={() =>
                        copyToClipboard(selectedTeacher.password || "Teach@123", "password")
                      }
                      className="text-indigo-600 hover:text-indigo-800 cursor-pointer ml-2"
                    >
                      {copiedField === "password" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Copy All */}
              <button
                onClick={() => {
                  const payload = `🏫 Language Lab Faculty Credentials\nFaculty: ${selectedTeacher.full_name}\nLogin URL: ${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/login\nEmail: ${selectedTeacher.email}\nPassword: ${
                    selectedTeacher.password || "Teach@123"
                  }`;
                  copyToClipboard(payload, "all");
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {copiedField === "all" ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Copied All to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy All Credentials</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: EDIT FACULTY ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Edit Faculty Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modify assigned departments, batches, and course scope.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Faculty Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Scope: Assigned Departments */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Assigned Departments
                  </label>
                  {loadingDepartments ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                      <RefreshCw size={14} className="animate-spin text-indigo-500" />
                      <span>Loading dynamic departments...</span>
                    </div>
                  ) : availableDepartments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No departments found for this institute.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableDepartments.map((dept) => {
                        const isSelected = formData.assigned_departments.includes(dept);
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => toggleDepartment(dept)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {dept} {isSelected && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Scope: Assigned Batches */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Assigned Batches
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formActiveBatches.length > 0 ? (
                      formActiveBatches.map((item) => {
                        const isSelected = isBatchSelectedInScope(
                          formData.assigned_batches,
                          item.department,
                          item.batch
                        );
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleBatch(item)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <span>{item.label}</span>
                            {isSelected && <Check size={14} className="stroke-[3]" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">No batches available for the selected department(s)</p>
                    )}
                  </div>
                </div>

                {/* Scope: Assigned Courses */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Assigned Courses
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableCourses.map((course) => {
                      const isSelected = formData.assigned_courses.includes(course);
                      return (
                        <button
                          key={course}
                          type="button"
                          onClick={() => toggleCourse(course)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {course} {isSelected && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: DELETE CONFIRMATION ────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Remove Faculty Account?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-bold text-slate-700">{selectedTeacher.full_name}</span>? This faculty member will lose access to the portal.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
