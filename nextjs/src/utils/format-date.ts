export const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const formatDate = (
  dateString: string,
  type: "default" | "numeric" = "default"
) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  if (type === "numeric") {
    return date.toISOString().split("T")[0].replace(/-/g, "/"); // Format: YYYY/MM/DD
  }

  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short", // "Thu"
    month: "short", // "Jan"
    day: "numeric", // "30"
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", // Ensures two-digit minutes (e.g., "11:00")
    hour12: true, // 12-hour format
  });

  return `${datePart}, ${timePart}`;
};
