import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { treaty } from "@elysiajs/eden"
import type { appClient } from "@/pages/[...slugs]"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {

  const label = 'pst'
  const date = new Date().toISOString().split('T')[0]

  return `${label}-${date}-${crypto.randomUUID().slice(0, 4)}`
}

export const fetchClient = treaty<appClient>(import.meta.env.API_URL)

export const fetcher = (url: string) => axios.get(url, {
  timeout: 10000,
}).then(res => res.data)