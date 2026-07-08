const generateBreadcrumbs = () => {
 const crumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Learning Journey", href: "/dashboard/topics" },
];

if (courseName)
  crumbs.push({ label: decodeURIComponent(courseName), href: "#" });

if (type)
  crumbs.push({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    href: "#",
  });

if (topicName)
  crumbs.push({ label: decodeURIComponent(topicName), href: "#" });

if (subTopicName)
  crumbs.push({ label: decodeURIComponent(subTopicName), href: "#" });

if (lessonName && isLessonPage)
  crumbs.push({ label: decodeURIComponent(lessonName), href: "#" });

  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName");
  const moduleType = searchParams.get("type");
  const topicName = searchParams.get("topicName");
  const subtopicName = searchParams.get("subtopicName");
  const lessonName = searchParams.get("lessonName");

  crumbs.push({
    label: "Dashboard",
    href: "/dashboard",
  });

  if (
    pathname.startsWith("/dashboard/course") ||
    pathname.startsWith("/dashboard/topics")
  ) {
    crumbs.push({
      label: "Learning Journey",
      href: "/dashboard/topics",
    });
  }

  if (courseName) {
    crumbs.push({
      label: courseName,
      href: `/dashboard/course/${courseId}?courseName=${encodeURIComponent(courseName)}`,
    });
  }

  if (moduleType) {
    crumbs.push({
      label: moduleType.charAt(0).toUpperCase() + moduleType.slice(1),
    });
  }

  if (topicName) {
    crumbs.push({
      label: topicName,
    });
  }

  if (subtopicName) {
    crumbs.push({
      label: subtopicName,
    });
  }

  // Only show lesson on lesson pages
 if (pathname.startsWith("/dashboard/module")) {
  crumbs.push({
    label: "Lessons",
    href: "#",
  });
}

  return crumbs;
};