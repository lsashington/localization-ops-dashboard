import { AlertTriangle, Clock, CircleCheck, CircleDashed, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Risk } from "./risk";

export const RISK_STYLE: Record<Risk, {Icon: LucideIcon, label: string}> = {
    overdue: { Icon: AlertTriangle, label: "Overdue"},
    soon: { Icon: Clock, label: "Soon"},
    ok: { Icon: CalendarCheck, label: "Ok"},
    done: { Icon: CircleCheck, label: "Done"},
    none: { Icon: CircleDashed, label: "No date"}
};