import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Lead } from "./types"
import { IconFlame, IconTemperature, IconSnowflake } from "@tabler/icons-react"
import { avatarBgColors } from "@/app/constants/constants"
import { format, isToday, isYesterday, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const renderCategoryIcon = (leadCategory: "HOT" | "WARM" | "COLD") => {
  switch (leadCategory) {
    case "HOT":
      return <IconFlame size={14} className="text-red-500" />
    case "WARM":
      return <IconTemperature size={14} className="text-amber-500" />
    case "COLD":
      return <IconSnowflake size={14} className="text-blue-500" />
    default:
      return null
  }
}


export function stringToColorIndex(str: string) {
  let hash = 0
  for (let i = 0; i < str?.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % avatarBgColors.length
}

export const formatNotificationDate = (dateString: string) => {
  const date = parseISO(dateString); // convert string to Date

  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }

  return `${format(date, "EEEE")}, ${format(date, "h:mm a")}`; // Monday, 8:30 AM
};