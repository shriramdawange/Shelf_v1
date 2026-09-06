import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatINR(amount: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount) }
export function formatDate(date: string | Date) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date)) }
export const INDIAN_UNIVERSITIES = ["IIT Delhi","IIT Bombay","IIT Madras","IIT Kanpur","IIT Kharagpur","IIT Roorkee","Delhi University","JNU","BHU","Jamia Millia Islamia","University of Mumbai","Anna University","VTU","AKTU","RTU","MAKAUT","Pune University","Osmania University","Amity University","Christ University","BITS Pilani","VIT Vellore","SRM University","Other"]
export const CATEGORIES = ["Books","Notes","Lab Equipment","Electronics","Stationery","Uniform","Other"] as const
export const CONDITIONS = ["New","Like New","Good","Fair","Poor"] as const
