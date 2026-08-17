import api from "../apiMethod/apiMethod";

// Standalone Subjects/Assessments sync — same idea as courseApi.downloadCourse
// (see instituteController.downloadSubjectsData), but not tied to any
// specific course since Subject/Assessment aren't course-scoped or
// per-institute-assigned. A plain call to this institute's own local
// backend is enough — no master-token dance needed like course download.
export const subjectSyncApi = {
  downloadSubjects: () => api.get("/institute/me/subjects/download"),
};
