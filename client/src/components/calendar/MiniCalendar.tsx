import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import { getEventsByMonth, EventData } from "services/eventData";
import { Calendar } from "components/ui/calendar";
import { DayButton } from "react-day-picker";
import { Button } from "components/ui/button";
import { cn } from "lib/utils";
import { getDefaultClassNames } from "react-day-picker";

const MiniCalendar = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await getEventsByMonth(year, month);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    };

    fetchEvents();
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setValue(date);
    // Navigate to events page with selected date
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    navigate(`/admin/events?date=${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };

  // Custom DayButton component to show event dots
  const CustomDayButton = ({
    className,
    day,
    modifiers,
    ...props
  }: React.ComponentProps<typeof DayButton>) => {
    const defaultClassNames = getDefaultClassNames();
    const dayEvents = getEventsForDate(day.date);

    return (
      <Button
        variant="ghost"
        size="icon"
        data-day={day.date.toLocaleDateString()}
        data-selected-single={
          modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle
        }
        onClick={() => handleDateClick(day.date)}
        className={cn(
          "data-[selected-single=true]:bg-brand-500 data-[selected-single=true]:text-white flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-0.5 font-normal leading-none group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-brand-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-navy-700",
          defaultClassNames.day,
          className
        )}
        {...props}
      >
        <span>{day.date.getDate()}</span>
        {dayEvents.length > 0 && (
          <div className="flex items-center justify-center gap-0.5">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className={`h-1 w-1 rounded-full ${getPriorityColor(event.priority)}`}
                title={event.title}
              />
            ))}
            {dayEvents.length > 3 && (
              <span className="text-[7px] text-gray-600 dark:text-gray-400">
                +{dayEvents.length - 3}
              </span>
            )}
          </div>
        )}
      </Button>
    );
  };

  return (
    <div>
      <Card extra="flex w-full h-full flex-col px-3 py-3">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date: Date | undefined) => date && setValue(date)}
          onMonthChange={setCurrentMonth}
          className="rounded-md"
          components={{
            DayButton: CustomDayButton,
          }}
        />
      </Card>
    </div>
  );
};

export default MiniCalendar;
