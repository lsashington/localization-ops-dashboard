const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SOON_DAYS = 14;

export type Risk = "done" | "none" | "overdue" | "soon" | "ok";

export const RISK_RANK: Record<Risk, number> = {
  overdue: 0,
  soon: 1,
  ok: 2,
  done: 3,
  none: 4
}

export function getRisk(dueDate: string | null, status: string): Risk {
  if (status === "Delivered") return "done";
  if (dueDate === null) return "none";

  const daysLeft = (new Date(dueDate).getTime() - Date.now()) / MS_PER_DAY;
  
  if (daysLeft < 0) return "overdue";

  if (daysLeft <= SOON_DAYS) return "soon";
  return "ok";
}

