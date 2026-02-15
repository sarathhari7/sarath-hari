import React, { useState, useEffect } from "react";
import Card from "components/card";
import {
  MdNotifications,
  MdAccountBalanceWallet,
  MdCheckCircle,
  MdRestaurantMenu,
  MdFilterList,
} from "react-icons/md";
import { getAllNotificationData, NotificationData } from "services/notificationData";
import { usePageTitle } from "contexts/PageTitleContext";
import { Spinner } from "components/ui/spinner";

const AllNotifications = () => {
  const { setPageTitle } = usePageTitle();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['budget', 'todo', 'recipe']);

  useEffect(() => {
    setPageTitle("All Notifications");
    fetchNotifications();
  }, [setPageTitle]);

  useEffect(() => {
    filterNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, selectedCategories]);

  const fetchNotifications = async () => {
    setLoading(true);
    const response = await getAllNotificationData();
    if (response.success && response.data) {
      setNotifications(response.data);
    }
    setLoading(false);
  };

  const filterNotifications = () => {
    if (selectedCategories.length === 0) {
      setFilteredNotifications(notifications);
    } else {
      const filtered = notifications.filter(n => selectedCategories.includes(n.category));
      setFilteredNotifications(filtered);
    }
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
        return <MdNotifications className="h-5 w-5" />;
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

  const formatDueDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mt-5">
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

      {/* Notifications List */}
      <Card extra="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MdNotifications className="h-16 w-16 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No notifications found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedCategories.length === 0
                ? 'Please select at least one category filter'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors border border-gray-200 dark:border-navy-600"
              >
                {/* Priority Indicator */}
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-b ${getPriorityColor(notification.priority)} text-2xl text-white`}>
                  {getCategoryIcon(notification.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-navy-700 dark:text-white truncate">
                      {notification.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getPriorityBadgeColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${getCategoryColor(notification.category)}`}>
                      {getCategoryIcon(notification.category)}
                      {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                    </span>

                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Due: {formatDueDate(notification.dueDate)}
                    </span>

                    {notification.repeatType === 'monthly' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Recurring
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

export default AllNotifications;
