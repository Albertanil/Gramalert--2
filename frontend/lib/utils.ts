// In frontend/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case "Resolved":
            return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
        case "In Progress":
            return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
    }
};

export const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "High":
            return "bg-red-100 text-red-800 border-red-200";
        case "Medium":
            return "bg-orange-100 text-orange-800 border-orange-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

// highlight-start
// New helper function to translate the escalation level
export const getEscalationLevelName = (level: number | null | undefined) => {
    switch (level) {
        case 0:
            return "Gram Panchayat";
        case 1:
            return "Block Panchayat";
        case 2:
            return "District/Zila Parishad";
        default:
            return "Not Escalated";
    }
};
// highlight-end