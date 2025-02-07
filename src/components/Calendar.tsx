
import { Calendar } from "@/components/ui/calendar"
import { navigate } from "astro:transitions/client"
import { useEffect, useState } from "react"

export function CalendarComp({ selectedDate }: { selectedDate: string }) {
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<Date | undefined>()

  useEffect(() => {
    // Create date in local timezone
    const [year, month, day] = selectedDate.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    setSelected(localDate)
    setMounted(true)
  }, [selectedDate])

  if (!mounted) {
    return null
  }

  return (
    <Calendar
      mode="single"
      disabled={{ after: new Date() }}
      selected={selected}
      onSelect={(date) => {
        if (date) {
          // Ensure we're getting the date in local timezone
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const formattedDate = `${year}-${month}-${day}`
          navigate(`/concern?date=${formattedDate}`)
        }
      }}
      className="rounded-md border shadow"
    />
  )
}
