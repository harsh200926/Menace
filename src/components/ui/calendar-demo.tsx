
"use client"

import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar"

const dummyEvents = [
  {
    day: new Date(),
    events: [
      {
        id: 1,
        name: "Team Meeting",
        time: "10:00 AM",
        datetime: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Project Review",
        time: "2:00 PM",
        datetime: new Date().toISOString(),
      },
    ],
  },
  {
    day: new Date(new Date().setDate(new Date().getDate() + 3)),
    events: [
      {
        id: 3,
        name: "Client Presentation",
        time: "11:00 AM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
      },
    ],
  },
  {
    day: new Date(new Date().setDate(new Date().getDate() + 7)),
    events: [
      {
        id: 4,
        name: "Product Launch",
        time: "9:00 AM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      },
      {
        id: 5,
        name: "Marketing Meeting",
        time: "1:00 PM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      },
    ],
  },
]

export function CalendarDemo() {
  return (
    <div className="flex h-screen w-full flex-1 flex-col border rounded-lg overflow-hidden">
      <FullScreenCalendar 
        data={dummyEvents} 
        onAddEvent={() => console.log("Add event")}
        onSelectDay={(day) => console.log("Selected day:", day)}
      />
    </div>
  )
}
