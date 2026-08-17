"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusModal from "@/components/molecules/StatusModal";

import {
  BookOpen,
  Check,
  GraduationCap,
  Building2,
  Layers3,
  Save,
  Search,
  CheckCircle2,
  RotateCcw,
  BookMarked,
  X,
  PlayCircle,
  Headphones,
  FileText,
  CheckSquare,
  Loader2,
} from "lucide-react";

import { courseApi } from "@/services/course/courseApi";
import { studentLearningAccessApi } from "@/services/studentLearningAccess/studentLearningAccessApi";
/* =========================================================
   HELPERS
========================================================= */

const getId = (item) => {
  if (!item) return "";

  return String(
    item._id ??
      item.id ??
      item.course_id ??
      item.topic_id ??
      item.subtopic_id ??
      item.department_id ??
      item.batch_id ??
      ""
  );
};

const getName = (item) => {
  if (!item) return "";

  return String(
    item.name ??
      item.title ??
      item.course_name ??
      item.topic_name ??
      item.subtopic_name ??
      item.module_name ??
      ""
  );
};

const normalizeId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value._id ??
        value.id ??
        value.value ??
        value.name ??
        value.year ??
        ""
    );
  }

  return String(value);
};

/* =========================================================
   CHECKBOX
========================================================= */

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();

        if (!disabled && onChange) {
          onChange();
        }
      }}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100"
          : checked
          ? "border-orange-500 bg-orange-500 text-white shadow-sm"
          : indeterminate
          ? "border-orange-500 bg-orange-100 text-orange-600"
          : "border-orange-300 bg-white text-transparent hover:border-orange-500"
      }`}
      aria-label="checkbox"
    >
      {checked ? (
        <Check size={14} strokeWidth={3} />
      ) : indeterminate ? (
        <span className="h-0.5 w-2.5 rounded-full bg-orange-600" />
      ) : null}
    </button>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function StudentLearningAccessPage() {
const router = useRouter();
const searchParams = useSearchParams();

const editId = searchParams.get("id");
const isEditMode = Boolean(editId);



  /* =======================================================
     FORM STATE
  ======================================================= */

  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);

  const [subtopicSearch, setSubtopicSearch] = useState("");

  /*
    IMPORTANT:

    Backend expects:
      segment: "Degree"
      year: 1

    So departmentId stores department name,
    and selectedBatchId stores year.
  */
  const [departmentId, setDepartmentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  /* =======================================================
     API DATA
  ======================================================= */

  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [departments, setDepartments] = useState([]);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* =======================================================
     MODALS / ERROR
  ======================================================= */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSubtopicModal, setActiveSubtopicModal] = useState(null);
  const [pageError, setPageError] = useState("");

    const [statusData, setStatusData] = useState({
  open: false,
  type: "success",
  title: "",
  message: "",
});

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const selectedCourse = useMemo(() => {
    return courses.find(
      (course) => getId(course) === String(courseId)
    );
  }, [courses, courseId]);

  const selectedTopic = useMemo(() => {
    return topics.find(
      (topic) => getId(topic) === String(topicId)
    );
  }, [topics, topicId]);

  const selectedDepartment = useMemo(() => {
    return departments.find(
      (department) =>
        String(department.name) === String(departmentId)
    );
  }, [departments, departmentId]);

  const availableBatches = useMemo(() => {
    if (!selectedDepartment) {
      return [];
    }

    return Array.isArray(selectedDepartment.batches)
      ? selectedDepartment.batches
      : [];
  }, [selectedDepartment]);

  const filteredSubtopics = useMemo(() => {
    const search = subtopicSearch.trim().toLowerCase();

    if (!search) {
      return subtopics;
    }

    return subtopics.filter((subtopic) =>
      getName(subtopic)
        .toLowerCase()
        .includes(search)
    );
  }, [subtopics, subtopicSearch]);

  const allSubtopicsSelected =
    subtopics.length > 0 &&
    selectedSubtopics.length === subtopics.length;

  const someSubtopicsSelected =
    selectedSubtopics.length > 0 &&
    selectedSubtopics.length < subtopics.length;

  // Subtopics from getTopicsByCourse carry a server-computed lesson_count
  // (one video/audio/text/exercise/vocabulary module document = one lesson —
  // see studentLearningAccessController.js) — they never carry a `.modules`
  // array up front (that's only fetched on-demand per subtopic when its row
  // is clicked, via handleViewSubtopic). Summing a `.modules` array here
  // always summed over undefined/[] and silently produced 0.
  const totalSelectedLessons = useMemo(() => {
    return subtopics
      .filter((subtopic) =>
        selectedSubtopics.includes(getId(subtopic))
      )
      .reduce(
        (total, subtopic) =>
          total + Number(subtopic.lesson_count ?? 0),
        0
      );
  }, [subtopics, selectedSubtopics]);

  /* =======================================================
     LOAD INITIAL DATA
  ======================================================= */

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setPageError("");

      setLoadingCourses(true);
      setLoadingDepartments(true);

      const [courseRes, departmentRes] =
        await Promise.all([
          courseApi.getCourses(),
          studentLearningAccessApi.getDepartments(),
        ]);

      /* ===================================================
         COURSES
      =================================================== */

      const courseData =
        courseRes?.data?.data?.courses ??
        courseRes?.data?.courses ??
        courseRes?.data?.data ??
        [];

      setCourses(
        Array.isArray(courseData)
          ? courseData
          : []
      );

      /* ===================================================
         DEPARTMENTS
         
         API:

         {
           data: [
             {
               name: "Degree",
               batches: [
                 {
                   year: 1,
                   studentCount: 2
                 }
               ]
             }
           ]
         }
      =================================================== */

      const departmentData =
        departmentRes?.data?.data?.departments ??
        departmentRes?.data?.departments ??
        departmentRes?.data?.data ??
        [];

      const normalizedDepartments =
        Array.isArray(departmentData)
          ? departmentData.map(
              (department, departmentIndex) => {
                const departmentName = String(
                  department?.name ??
                    department?._id ??
                    department?.id ??
                    `department-${departmentIndex}`
                );

                const batches =
                  Array.isArray(
                    department?.batches
                  )
                    ? department.batches.map(
                        (
                          batch,
                          batchIndex
                        ) => ({
                          ...batch,

                          id: String(
                            batch?._id ??
                              batch?.id ??
                              `${departmentName}-year-${batch?.year}-${batchIndex}`
                          ),

                          year: Number(
                            batch?.year ?? 0
                          ),

                          name: `Year ${
                            batch?.year ?? ""
                          }`,

                          studentCount: Number(
                            batch?.studentCount ??
                              0
                          ),
                        })
                      )
                    : [];

                return {
                  ...department,

                  id: departmentName,
                  name: departmentName,
                  batches,
                };
              }
            )
          : [];

      console.log(
        "Normalized Departments:",
        normalizedDepartments
      );

      setDepartments(normalizedDepartments);
    } catch (error) {
      console.error(
        "Failed to load initial data:",
        error
      );

      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load learning access data."
      );
    } finally {
      setLoadingCourses(false);
      setLoadingDepartments(false);
    }
  };

  /* =======================================================
     EDIT MODE
  ======================================================= */

  useEffect(() => {
    if (!editId) {
      return;
    }

    loadEditData(editId);
  }, [editId]);

  const loadEditData = async (id) => {
    try {
      setLoadingEdit(true);
      setPageError("");

      const res =
        await studentLearningAccessApi.getById(id);

      const record =
        res?.data?.data?.record ??
        res?.data?.record ??
        res?.data?.data;

      if (!record) {
        throw new Error(
          "Learning access record not found."
        );
      }

      console.log(
        "Learning Access Edit Record:",
        record
      );

      /* ===================================================
         COURSE
      =================================================== */

      const recordCourseId = String(
        record.course_id?._id ??
          record.course_id?.id ??
          record.course_id ??
          ""
      );

      setCourseId(recordCourseId);

      /* ===================================================
         LOAD TOPICS
      =================================================== */

      let loadedTopics = [];

      if (recordCourseId) {
        setLoadingTopics(true);

        try {
          const topicRes =
            await studentLearningAccessApi.getTopicsByCourse(
              recordCourseId
            );

          const topicData =
            topicRes?.data?.data?.topics ??
            topicRes?.data?.topics ??
            topicRes?.data?.data ??
            [];

          loadedTopics = Array.isArray(
            topicData
          )
            ? topicData
            : [];

          setTopics(loadedTopics);
        } finally {
          setLoadingTopics(false);
        }
      }

      /* ===================================================
         TOPIC
      =================================================== */

      const recordTopicId = String(
        record.topic_id?._id ??
          record.topic_id?.id ??
          record.topic_id ??
          ""
      );

      setTopicId(recordTopicId);

      /* ===================================================
         FIND TOPIC
      =================================================== */

      const selectedTopicFromApi =
        loadedTopics.find(
          (topic) =>
            getId(topic) ===
            recordTopicId
        );

      const loadedSubtopics =
        selectedTopicFromApi?.subtopics ??
        [];

      setSubtopics(
        Array.isArray(
          loadedSubtopics
        )
          ? loadedSubtopics
          : []
      );

      /* ===================================================
         SUBTOPICS
      =================================================== */

      const recordSubtopicIds =
        Array.isArray(
          record.subtopic_ids
        )
          ? record.subtopic_ids
              .map((item) =>
                normalizeId(item)
              )
              .filter(Boolean)
          : [];

      setSelectedSubtopics(
        recordSubtopicIds
      );

      /* ===================================================
         DEPARTMENT / SEGMENT

         Backend may return:

         segment: "Degree"

         OR old:

         department_id: "Degree"

         OR:

         segment: {
           name: "Degree"
         }
      =================================================== */

      const recordSegment =
        record.segment?.name ??
        record.segment?._id ??
        record.segment?.id ??
        record.segment ??
        record.department_id?.name ??
        record.department_id?._id ??
        record.department_id?.id ??
        record.department_id ??
        "";

      setDepartmentId(
        String(recordSegment || "")
      );

      /* ===================================================
         YEAR

         Backend expects:

         year: 1

         Support old batch_id as fallback.
      =================================================== */

      const recordYear =
        record.year ??
        record.batch_id?.year ??
        record.batch_id?._id ??
        record.batch_id?.id ??
        record.batch_id ??
        "";

      setSelectedBatchId(
        recordYear !== null &&
          recordYear !== undefined
          ? String(recordYear)
          : ""
      );
    } catch (error) {
      console.error(
        "Failed to load edit data:",
        error
      );

      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load learning module."
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  /* =======================================================
     COURSE CHANGE
  ======================================================= */

  const handleCourseChange = async (
    value
  ) => {
    setCourseId(value);

    setTopicId("");
    setSelectedSubtopics([]);
    setTopics([]);
    setSubtopics([]);
    setSubtopicSearch("");

    if (!value) {
      return;
    }

    try {
      setLoadingTopics(true);
      setPageError("");

      const res =
        await studentLearningAccessApi.getTopicsByCourse(
          value
        );

      const data =
        res?.data?.data?.topics ??
        res?.data?.topics ??
        res?.data?.data ??
        [];

      setTopics(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load topics:",
        error
      );

      setTopics([]);

      alert(
        error?.response?.data?.message ||
          "Failed to load topics."
      );
    } finally {
      setLoadingTopics(false);
    }
  };

  /* =======================================================
     TOPIC CHANGE
  ======================================================= */

  const handleTopicChange = (value) => {
    setTopicId(value);
    setSelectedSubtopics([]);
    setSubtopicSearch("");

    const topic = topics.find(
      (item) =>
        getId(item) ===
        String(value)
    );

    const topicSubtopics =
      topic?.subtopics ?? [];

    setSubtopics(
      Array.isArray(topicSubtopics)
        ? topicSubtopics
        : []
    );
  };

  /* =======================================================
     DEPARTMENT CHANGE
  ======================================================= */

  const handleDepartmentChange = (
    value
  ) => {
    setDepartmentId(value);

    /*
      Whenever department changes,
      reset year because available years
      depend on department.
    */
    setSelectedBatchId("");
  };

  /* =======================================================
     SUBTOPIC TOGGLE
  ======================================================= */

  const toggleSubtopic = (
    subtopicId
  ) => {
    const id = String(
      subtopicId || ""
    );

    if (!id) {
      return;
    }

    setSelectedSubtopics(
      (previous) => {
        if (previous.includes(id)) {
          return previous.filter(
            (item) => item !== id
          );
        }

        return [
          ...previous,
          id,
        ];
      }
    );
  };

  /* =======================================================
     SELECT ALL SUBTOPICS
  ======================================================= */

  const toggleAllSubtopics = () => {
    /*
      IMPORTANT:
      Previously this used `availableSubtopics`,
      which does not exist.
    */

    if (allSubtopicsSelected) {
      setSelectedSubtopics([]);
      return;
    }

    setSelectedSubtopics(
      subtopics
        .map((subtopic) =>
          getId(subtopic)
        )
        .filter(Boolean)
    );
  };

  /* =======================================================
     VIEW SUBTOPIC MODULES
  ======================================================= */

  const handleViewSubtopic = async (
    subtopic
  ) => {
    try {
      setLoadingSubtopics(true);

      const subtopicId =
        getId(subtopic);

      if (!subtopicId) {
        return;
      }

      const res =
        await studentLearningAccessApi.getSubtopicModules(
          subtopicId
        );

      const modules =
        res?.data?.data?.modules ??
        res?.data?.modules ??
        res?.data?.data ??
        [];

      setActiveSubtopicModal({
        ...subtopic,

        modules: Array.isArray(
          modules
        )
          ? modules
          : [],
      });
    } catch (error) {
      console.error(
        "Failed to load subtopic modules:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to load subtopic modules."
      );
    } finally {
      setLoadingSubtopics(false);
    }
  };

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const handleOpenModal = (
    event
  ) => {
    event.preventDefault();

    if (!courseId) {
      alert(
        "Please select a course."
      );
      return;
    }

    if (!topicId) {
      alert(
        "Please select a topic."
      );
      return;
    }

    if (
      selectedSubtopics.length ===
      0
    ) {
      alert(
        "Please select at least one subtopic."
      );
      return;
    }

    if (!departmentId) {
      alert(
        "Please select a department."
      );
      return;
    }

    if (!selectedBatchId) {
      alert(
        "Please select a batch/year."
      );
      return;
    }

    const numericYear =
      Number(selectedBatchId);

    if (
      !Number.isFinite(
        numericYear
      ) ||
      numericYear <= 0
    ) {
      alert(
        "Please select a valid year."
      );
      return;
    }

    setIsModalOpen(true);
  };

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

const handleConfirmSubmit = async () => {
  try {
    setSubmitting(true);

    const payload = {
      course_id: courseId,
      topic_id: topicId,
      subtopic_ids: selectedSubtopics,
      segment: departmentId,
      year: Number(selectedBatchId),
    };

    console.log(
      isEditMode
        ? "UPDATE PAYLOAD SENT TO BACKEND:"
        : "CREATE PAYLOAD SENT TO BACKEND:",
      payload
    );

    // Safety validation
    if (!payload.course_id) {
      throw new Error("Course is required.");
    }

    if (!payload.topic_id) {
      throw new Error("Topic is required.");
    }

    if (
      !Array.isArray(payload.subtopic_ids) ||
      payload.subtopic_ids.length === 0
    ) {
      throw new Error("At least one subtopic is required.");
    }

    if (!payload.segment) {
      throw new Error("Segment is required.");
    }

    if (
      !Number.isFinite(payload.year) ||
      payload.year <= 0
    ) {
      throw new Error("Year is required.");
    }

    // API call
    if (isEditMode) {
      await studentLearningAccessApi.update(
        editId,
        payload
      );
    } else {
      await studentLearningAccessApi.create(
        payload
      );
    }

    // Close summary modal
    setIsModalOpen(false);

    // Reset only after create
    if (!isEditMode) {
      handleReset();
    }

    // Show success modal
    setStatusData({
      open: true,
      type: "success",
      title: isEditMode
        ? "Access Updated"
        : "Access Added",
      message: isEditMode
        ? "Learning access updated successfully."
        : "Learning access added successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to save learning access:",
      error
    );

    console.error(
      "Backend error response:",
      error?.response?.data
    );

    // Close summary modal
    setIsModalOpen(false);

    // Show error modal
    setStatusData({
      open: true,
      type: "error",
      title: isEditMode
        ? "Update Failed"
        : "Add Failed",
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong.",
    });
  } finally {
    setSubmitting(false);
  }
};

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setCourseId("");
    setTopicId("");
    setSelectedSubtopics([]);
    setSubtopicSearch("");
    setDepartmentId("");
    setSelectedBatchId("");
    setIsModalOpen(false);
  setActiveSubtopicModal(null);
  setPageError("");

    setTopics([]);
    setSubtopics([]);

    setIsModalOpen(false);
    setActiveSubtopicModal(null);
    setPageError("");
  };

  /* =======================================================
     MODULE ICON
  ======================================================= */

  const getModuleTypeIcon = (
    type
  ) => {
    switch (
      String(type).toLowerCase()
    ) {
      case "video":
        return (
          <PlayCircle
            size={16}
            className="text-orange-600"
          />
        );

      case "audio":
        return (
          <Headphones
            size={16}
            className="text-orange-600"
          />
        );

      case "text":
        return (
          <FileText
            size={16}
            className="text-orange-600"
          />
        );

      case "exercise":
        return (
          <CheckSquare
            size={16}
            className="text-orange-600"
          />
        );

      case "vocabulary":
        return (
          <BookOpen
            size={16}
            className="text-orange-600"
          />
        );

      default:
        return (
          <BookOpen
            size={16}
            className="text-orange-600"
          />
        );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-orange-100 bg-white">
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <BookOpen
                size={16}
                className="text-orange-600"
              />

              <span className="text-xs font-bold uppercase tracking-wide text-orange-600">
                Institute Admin
              </span>
            </div>

            <h1 className="text-xl font-extrabold text-slate-900">
              {isEditMode
                ? "Update Learning Module"
                : "Create Learning Module"}
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Configure curriculum content,
              courses, topics, and target
              batches
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 self-start rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-orange-50/50 active:scale-95 md:self-auto"
          >
            <RotateCcw
              size={13}
              className="text-orange-600"
            />

            Reset Form
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {pageError && (
        <div className="mx-6 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {pageError}
        </div>
      )}

      {/* =================================================
          EDIT LOADING
      ================================================= */}

      {loadingEdit && (
        <div className="mx-6 mt-5 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-700">
          <Loader2
            size={15}
            className="animate-spin"
          />

          Loading learning module...
        </div>
      )}

      <div className="w-full px-6 pt-6 pb-8">
        <form
          onSubmit={handleOpenModal}
          className="space-y-6"
        >
          {/* =================================================
              ROW 1
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* COURSE */}

            <div className="rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600">
                  <BookMarked size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Step 1: Course Selection
                  </h2>

                  <p className="text-[11px] text-slate-400">
                    Select curriculum course
                  </p>
                </div>
              </div>

              <SelectField
                label="Course"
                value={courseId}
                onChange={(e) =>
                  handleCourseChange(
                    e.target.value
                  )
                }
                placeholder={
                  loadingCourses
                    ? "Loading courses..."
                    : "Select Course"
                }
                disabled={
                  loadingCourses
                }
                options={courses.map(
                  (course, index) => ({
                    value:
                      getId(course),
                    label:
                      getName(course) ||
                      "Untitled Course",
                    key: `course-${getId(
                      course
                    )}-${index}`,
                  })
                )}
              />
            </div>

            {/* TOPIC */}

            <div
              className={`rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md ${
                !courseId
                  ? "pointer-events-none opacity-55"
                  : "animate-fadeIn"
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600">
                  <Layers3 size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Step 2: Core Topic
                  </h2>

                  <p className="text-[11px] text-slate-400">
                    Select topic from chosen
                    course
                  </p>
                </div>
              </div>

              <SelectField
                label="Topic Selection"
                value={topicId}
                onChange={(e) =>
                  handleTopicChange(
                    e.target.value
                  )
                }
                placeholder={
                  loadingTopics
                    ? "Loading topics..."
                    : courseId
                    ? "Select Topic"
                    : "First select a course"
                }
                disabled={
                  !courseId ||
                  loadingTopics
                }
                options={topics.map(
                  (topic, index) => ({
                    value:
                      getId(topic),
                    label:
                      getName(topic) ||
                      "Untitled Topic",
                    key: `topic-${getId(
                      topic
                    )}-${index}`,
                  })
                )}
              />
            </div>
          </div>

          {/* =================================================
              SUBTOPICS
          ================================================= */}

          {topicId && (
            <div className="animate-fadeIn overflow-hidden rounded-2xl border border-orange-200/60 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-orange-100 bg-orange-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Step 3: Subtopics
                  </h2>

                  <p className="text-xs text-slate-400">
                    Click a subtopic to view its
                    lessons, or use checkboxes to
                    select it
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"
                    />

                    <input
                      type="text"
                      placeholder="Search subtopics..."
                      value={
                        subtopicSearch
                      }
                      onChange={(e) =>
                        setSubtopicSearch(
                          e.target.value
                        )
                      }
                      className="h-9 w-48 rounded-xl border border-orange-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <span className="rounded-xl border border-orange-200 bg-orange-100/70 px-3 py-1.5 text-xs font-bold text-orange-700">
                    {
                      selectedSubtopics.length
                    }{" "}
                    / {subtopics.length}{" "}
                    Selected
                  </span>
                </div>
              </div>

              {/* SELECT ALL */}

              <div className="border-b border-orange-100/60 bg-orange-50/10 px-6 py-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      allSubtopicsSelected
                    }
                    indeterminate={
                      someSubtopicsSelected
                    }
                    onChange={
                      toggleAllSubtopics
                    }
                    disabled={
                      subtopics.length ===
                      0
                    }
                  />

                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Select All Subtopics
                  </span>
                </div>
              </div>

              {/* SUBTOPIC LIST */}

              <div className="max-h-80 divide-y divide-orange-50 overflow-y-auto">
                {loadingTopics ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-400">
                    <Loader2
                      size={15}
                      className="animate-spin text-orange-500"
                    />

                    Loading subtopics...
                  </div>
                ) : filteredSubtopics.length ===
                  0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No subtopics found.
                  </div>
                ) : (
                  filteredSubtopics.map(
                    (
                      subtopic,
                      index
                    ) => {
                      const subtopicId =
                        getId(
                          subtopic
                        );

                      const checked =
                        selectedSubtopics.includes(
                          subtopicId
                        );

                      // subtopic.lesson_count comes straight from
                      // getTopicsByCourse's aggregation — subtopic.modules
                      // isn't populated until this row is clicked (see
                      // handleViewSubtopic), so it can't be used here.
                      const lessonCount = Number(
                        subtopic.lesson_count ?? 0
                      );

                      return (
                        <div
                          key={`subtopic-${subtopicId || "empty"}-${index}`}
                          onClick={() =>
                            handleViewSubtopic(
                              subtopic
                            )
                          }
                          className={`flex cursor-pointer items-center gap-4 px-6 py-3.5 transition ${
                            checked
                              ? "bg-orange-50/50"
                              : "hover:bg-orange-50/20"
                          }`}
                        >
                          {/* IMPORTANT:
                              Checkbox now uses
                              THIS subtopicId.
                          */}

                          <Checkbox
                            checked={checked}
                            onChange={() =>
                              toggleSubtopic(
                                subtopicId
                              )
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 transition-colors hover:text-orange-600">
                              {getName(
                                subtopic
                              ) ||
                                "Untitled Subtopic"}

                              <span className="ml-1 text-[11px] font-normal text-slate-400">
                                (Click to view
                                lessons)
                              </span>
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {
                                lessonCount
                              }{" "}
                              learning modules
                              available
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                              {
                                lessonCount
                              }{" "}
                              Lessons
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>

            </div>
          )}

          {/* =================================================
              DEPARTMENT + BATCH
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* DEPARTMENT */}

            <div
              className={`rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md ${
                selectedSubtopics.length ===
                0
                  ? "pointer-events-none opacity-55"
                  : "animate-fadeIn"
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                  <Building2 size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Step 4: Department Selection
                  </h2>

                  <p className="text-[11px] text-slate-400">
                    Select target academic
                    department
                  </p>
                </div>
              </div>

              <SelectField
                label="Department"
                icon={Building2}
                value={departmentId}
                onChange={(e) =>
                  handleDepartmentChange(
                    e.target.value
                  )
                }
                placeholder={
                  selectedSubtopics.length >
                  0
                    ? loadingDepartments
                      ? "Loading Departments..."
                      : "Select Department/Branch"
                    : "First select subtopics"
                }
                options={departments.map(
                  (
                    department,
                    index
                  ) => ({
                    value:
                      String(
                        department.name ??
                          ""
                      ),
                    label:
                      String(
                        department.name ??
                          ""
                      ),
                    key: `department-${String(
                      department.name ??
                        ""
                    )}-${index}`,
                  })
                )}
                disabled={
                  selectedSubtopics.length ===
                    0 ||
                  loadingDepartments
                }
              />
            </div>

            {/* BATCH */}

            <div
              className={`rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md ${
                !departmentId
                  ? "pointer-events-none opacity-55"
                  : "animate-fadeIn"
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                  <GraduationCap size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Step 5: Select Batch / Year
                  </h2>

                  <p className="text-[11px] text-slate-400">
                    Select a single target
                    year within{" "}
                    {selectedDepartment?.name ||
                      "department"}
                  </p>
                </div>
              </div>

              <SelectField
                label="Batch / Year"
                icon={GraduationCap}
                value={selectedBatchId}
                onChange={(e) =>
                  setSelectedBatchId(
                    e.target.value
                  )
                }
                placeholder={
                  departmentId
                    ? "Select Year/Batch"
                    : "First select a department"
                }
                options={availableBatches.map(
                  (
                    batch,
                    index
                  ) => ({
                    value: String(
                      batch.year
                    ),
                    label: `Year ${
                      batch.year
                    } (${
                      batch.studentCount ??
                      0
                    } Students)`,
                    key: `batch-${String(
                      departmentId
                    )}-${String(
                      batch.year
                    )}-${index}`,
                  })
                )}
                disabled={
                  !departmentId
                }
              />
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/institute-dashboard/student-learning-access/access-list"
                )
              }
              disabled={
                submitting ||
                loadingEdit
              }
              className="rounded-xl border border-orange-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-orange-50/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingEdit
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  {isEditMode
                    ? "Review & Update"
                    : "Review & Create Module"}
                </>
              )}
            </button>
          </div>
        </form>
        
      </div>

      {/* =====================================================
          SUBTOPIC LESSON MODAL
      ===================================================== */}

      {activeSubtopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-5 rounded-3xl border border-orange-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-200">
                  <BookOpen size={20} />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {getName(
                      activeSubtopicModal
                    ) ||
                      "Untitled Subtopic"}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Subtopic lesson modules
                    overview
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveSubtopicModal(
                    null
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-200 text-slate-400 transition hover:bg-orange-50 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Included Lessons &
                Modules
              </p>

              {loadingSubtopics ? (
                <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
                  <Loader2
                    size={16}
                    className="animate-spin text-orange-500"
                  />

                  Loading lessons...
                </div>
              ) : !Array.isArray(
                  activeSubtopicModal.modules
                ) ||
                activeSubtopicModal.modules
                  .length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No modules available.
                </div>
              ) : (
                activeSubtopicModal.modules.map(
                  (
                    module,
                    index
                  ) => (
                    <div
                      key={`module-${String(
                        module?._id ??
                          module?.id ??
                          module?.module_id ??
                          "module"
                      )}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 bg-white">
                          {getModuleTypeIcon(
                            module?.type
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            {module?.title ??
                              module?.name ??
                              module?.module_name ??
                              "Untitled Module"}
                          </h4>

                          <span className="rounded-md bg-orange-100/60 px-2 py-0.5 text-[10px] font-semibold capitalize text-orange-600">
                            {module?.type ||
                              "module"}
                          </span>
                        </div>
                      </div>

                      {/* Each module document IS one lesson (see
                          getSubtopicModules/studentAccess.js comments) —
                          there's no separate per-module lesson sub-count to
                          show, unlike the old badge here which always read a
                          field ("module.lessons") that never existed. */}
                      <span className="rounded-lg border border-orange-100 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                        1 Lesson
                      </span>
                    </div>
                  )
                )
              )}
            </div>

            <div className="flex items-center justify-between border-t border-orange-100 pt-3">
              <span className="text-xs font-medium text-slate-500">
                Total Lessons:{" "}
                <strong className="text-slate-800">
                  {(activeSubtopicModal.modules ?? []).length}
                </strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  toggleSubtopic(
                    getId(
                      activeSubtopicModal
                    )
                  );

                  setActiveSubtopicModal(
                    null
                  );
                }}
                className={`rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition ${
                  selectedSubtopics.includes(
                    getId(
                      activeSubtopicModal
                    )
                  )
                    ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {selectedSubtopics.includes(
                  getId(
                    activeSubtopicModal
                  )
                )
                  ? "Deselect Subtopic"
                  : "Select Subtopic"}
              </button>
            </div>
          </div>
        
         
        </div>
      )}

      {/* =====================================================
          SUMMARY MODAL
      ===================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-5 rounded-3xl border border-orange-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-200">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Module Configuration
                    Summary
                  </h3>

                  <p className="text-xs text-slate-500">
                    Review your setup before
                    final submission
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(
                    false
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-200 text-slate-400 transition hover:bg-orange-50 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/40 p-4 text-xs">
              <SummaryRow
                label="Course"
                value={
                  getName(
                    selectedCourse
                  ) || "-"
                }
              />

              <SummaryRow
                label="Topic"
                value={
                  getName(
                    selectedTopic
                  ) || "-"
                }
              />

              <SummaryRow
                label="Subtopics Selected"
                value={`${selectedSubtopics.length} Subtopics (${totalSelectedLessons} Lessons)`}
                valueClass="text-orange-700"
              />

              <SummaryRow
                label="Department / Segment"
                value={
                  selectedDepartment?.name ||
                  departmentId ||
                  "-"
                }
              />

              <SummaryRow
                label="Target Batch / Year"
                value={
                  selectedBatchId
                    ? `Year ${selectedBatchId}`
                    : "-"
                }
                valueClass="text-orange-800"
                noBorder
              />
            </div>

          

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(
                    false
                  )
                }
                disabled={
                  submitting
                }
                className="rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-orange-50/50 disabled:opacity-50"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmSubmit
                }
                disabled={
                  submitting
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />

                    {isEditMode
                      ? "Confirm & Update"
                      : "Confirm & Submit"}
                  </>
                )}
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
  onClose={() => {
    const wasSuccess = statusData.type === "success";

    setStatusData((prev) => ({
      ...prev,
      open: false,
    }));

    if (wasSuccess) {
      router.push(
        "/institute-dashboard/student-learning-access/access-list"
      );
    }
  }}
/>
       
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
  valueClass = "text-slate-800",
  noBorder = false,
}) {
  return (
    <div
      className={`flex justify-between gap-4 py-1 ${
        noBorder
          ? ""
          : "border-b border-orange-100/60"
      }`}
    >
      <span className="font-medium text-slate-500">
        {label}
      </span>

      <span
        className={`text-right font-semibold ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  options = [],
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-orange-400"
          />
        )}

        <select
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`h-11 w-full appearance-none rounded-xl border border-orange-200 bg-white text-sm text-slate-700 outline-none transition ${
            Icon
              ? "pl-10 pr-10"
              : "pl-4 pr-10"
          } ${
            disabled
              ? "cursor-not-allowed bg-slate-50 text-slate-400"
              : "cursor-pointer hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          }`}
        >
          <option value="">
            {placeholder}
          </option>

          {/*
            IMPORTANT:
            Always generate a unique key.

            Do NOT use:
              option.key ?? ...

            because an empty option.key can still
            produce duplicate React keys.
          */}

          {options.map(
            (option, index) => (
              <option
                key={`${label}-${String(
                  option?.value ??
                    "empty"
                )}-${index}`}
                value={
                  option?.value ?? ""
                }
              >
                {option?.label ??
                  ""}
              </option>
            )
          )}
        </select>

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-orange-500">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}