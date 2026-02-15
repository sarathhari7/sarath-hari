import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Card from "components/card";
import {
  MdEvent,
  MdAccountBalanceWallet,
  MdCheckCircle,
  MdRestaurantMenu,
  MdArrowBack,
  MdFilterList,
} from "react-icons/md";
import { getAllEventData, EventData } from "services/eventData";
import { usePageTitle } from "contexts/PageTitleContext";
import { Spinner } from "components/ui/spinner";

const Events = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setPageTitle } = usePageTitle();
  const [events, setEvents] = useState<EventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['budget', 'todo', 'recipe']);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    // Parse date from URL query parameter
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const date = new Date(dateParam);
      setSelectedDate(date);
      setPageTitle(`Events - ${formatDate(date)}`);
    } else {
      setPageTitle("All Events");
    }
    fetchEvents();
  }, [searchParams, setPageTitle]);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategories, selectedDate]);

  const fetchEvents = async () => {
    setLoading(true);
    const response = await getAllEventData();
    if (response.success && response.data) {
      setEvents(response.data);
    }
    setLoading(false);
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by selected date if provided
    if (selectedDate) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === selectedDate.getDate() &&
               eventDate.getMonth() === selectedDate.getMonth() &&
               eventDate.getFullYear() === selectedDate.getFullYear();
      });
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(e => selectedCategories.includes(e.category));
    }

    setFilteredEvents(filtered);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budget':
        return <MdAccountBalanceWallet className="h-5 w-5" />;
      case 'todo':
        return <MdCheckCircle className="h-5 w-5" />;
      case 'recipe':
        return <MdRestaurantMenu className="h-5 w-5" />;
      default:
        return <MdEvent className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'budget':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'todo':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'recipe':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-400 to-red-600';
      case 'medium':
        return 'from-yellow-400 to-yellow-600';
      case 'low':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-navy-700 dark:hover:bg-navy-600 transition-colors"
          >
            <MdArrowBack className="h-5 w-5 text-gray-700 dark:text-white" />
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 dark:bg-brand-400">
            <MdEvent className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-navy-700 dark:text-white">
              {selectedDate ? formatDate(selectedDate) : 'All Events'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <Card extra="mb-5 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-white">
            <MdFilterList className="h-5 w-5" />
            Filter by:
          </div>

          <button
            onClick={() => toggleCategory('budget')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategories.includes('budget')
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-navy-700 dark:text-gray-300'
            }`}
          >
            <MdAccountBalanceWallet className="h-4 w-4" />
            Budget
          </button>

          <button
            onClick={() => toggleCategory('todo')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategories.includes('todo')
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-navy-700 dark:text-gray-300'
            }`}
          >
            <MdCheckCircle className="h-4 w-4" />
            Todo
          </button>

          <button
            onClick={() => toggleCategory('recipe')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategories.includes('recipe')
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-navy-700 dark:text-gray-300'
            }`}
          >
            <MdRestaurantMenu className="h-4 w-4" />
            Recipe
          </button>

          <button
            onClick={() => setSelectedCategories(['budget', 'todo', 'recipe'])}
            className="ml-auto px-3 py-1.5 text-xs font-medium text-brand-500 hover:underline"
          >
            Select All
          </button>

          <button
            onClick={() => setSelectedCategories([])}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:underline"
          >
            Clear All
          </button>
        </div>
      </Card>

      {/* Events List */}
      <Card extra="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MdEvent className="h-16 w-16 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No events found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedDate
                ? 'No events scheduled for this date'
                : selectedCategories.length === 0
                ? 'Please select at least one category filter'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors border border-gray-200 dark:border-navy-600"
              >
                {/* Priority Indicator */}
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-b ${getPriorityColor(event.priority)} text-2xl text-white`}>
                  {getCategoryIcon(event.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-navy-700 dark:text-white">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getPriorityBadgeColor(event.priority)}`}>
                      {event.priority}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${getCategoryColor(event.category)}`}>
                      {getCategoryIcon(event.category)}
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {formatTime(event.date)}
                    </span>

                    {event.repeatType === 'monthly' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Recurring Monthly
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Events;
