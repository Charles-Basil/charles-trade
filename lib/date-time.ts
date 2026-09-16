export const dashboardTimeZone = "Africa/Lagos";

export function formatDashboardDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-NG", { timeZone: dashboardTimeZone, ...options }).format(new Date(date));
}

export function formatDashboardTime(date: Date | string | number) {
  return formatDashboardDate(date, { hour: "2-digit", minute: "2-digit" });
}

export function formatDashboardDateTime(date: Date | string | number) {
  return formatDashboardDate(date, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}