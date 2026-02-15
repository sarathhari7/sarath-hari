import React, { useState, useEffect } from "react";
import Card from "components/card";
import {
  MdNotifications,
  MdSave,
  MdRestartAlt,
  MdInfo,
  MdCheckCircle,
  MdAccountBalanceWallet,
  MdRestaurantMenu,
} from "react-icons/md";
import { usePageTitle } from "contexts/PageTitleContext";

interface NotificationSettings {
  todos: {
    enabled: boolean;
    highPriority: {
      frequency: number; // minutes
      advanceWarning: number; // days before due
    };
    mediumPriority: {
      frequency: number;
      advanceWarning: number;
    };
    lowPriority: {
      frequency: number;
      advanceWarning: number;
    };
    escalation: {
      enabled: boolean;
      daysBeforeDue: number;
      increasePriorityBy: number;
    };
  };
  budget: {
    enabled: boolean;
    transactionReminders: boolean;
    daysBeforeTransaction: number;
    budgetLimitWarning: boolean;
    warningThreshold: number; // percentage
    monthlySummary: boolean;
    summaryDay: number; // day of month
  };
  recipeBook: {
    enabled: boolean;
    cookingSessionReminders: boolean;
    reminderMinutesBefore: number;
    mealPlanningNotifications: boolean;
    dailyMealReminder: boolean;
    reminderTime: string; // HH:mm format
  };
  general: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    soundEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string; // HH:mm format
    quietHoursEnd: string; // HH:mm format
  };
}

const defaultSettings: NotificationSettings = {
  todos: {
    enabled: true,
    highPriority: {
      frequency: 30,
      advanceWarning: 1,
    },
    mediumPriority: {
      frequency: 120,
      advanceWarning: 3,
    },
    lowPriority: {
      frequency: 1440,
      advanceWarning: 7,
    },
    escalation: {
      enabled: true,
      daysBeforeDue: 2,
      increasePriorityBy: 1,
    },
  },
  budget: {
    enabled: true,
    transactionReminders: true,
    daysBeforeTransaction: 3,
    budgetLimitWarning: true,
    warningThreshold: 80,
    monthlySummary: true,
    summaryDay: 1,
  },
  recipeBook: {
    enabled: true,
    cookingSessionReminders: true,
    reminderMinutesBefore: 30,
    mealPlanningNotifications: true,
    dailyMealReminder: true,
    reminderTime: "09:00",
  },
  general: {
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  },
};

const Notifications = () => {
  const { setPageTitle } = usePageTitle();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPageTitle("Notification Manager");
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [setPageTitle]);

  const handleSave = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
    setHasChanges(false);
    alert("Notification settings saved successfully!");
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset to default settings?")) return;
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const updateSetting = (path: string, value: any) => {
    const keys = path.split(".");
    setSettings((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
    setHasChanges(true);
  };

  return (
    <div className="mt-5">
      {/* Action Buttons */}
      <div className="mb-5 flex justify-end gap-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
        >
          <MdRestartAlt className="h-5 w-5" />
          Reset to Default
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdSave className="h-5 w-5" />
          Save Settings
        </button>
      </div>

      {/* Info Box */}
      <Card extra="mb-5 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-brand-500">
        <div className="flex items-start gap-3">
          <MdInfo className="h-5 w-5 text-brand-500 dark:text-brand-400 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium">Manage All App Notifications:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>
                <strong>Todos:</strong> Priority-based reminders and escalation rules
              </li>
              <li>
                <strong>Budget:</strong> Transaction reminders and budget limit alerts
              </li>
              <li>
                <strong>Recipe Book:</strong> Cooking session and meal planning notifications
              </li>
              <li>
                <strong>General:</strong> App-wide notification preferences
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        {/* Todo Notifications */}
        <Card extra="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdCheckCircle className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              <div>
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                  Todo Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reminders and alerts for your tasks
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.todos.enabled}
              onChange={(e) => updateSetting("todos.enabled", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
          </div>

          {settings.todos.enabled && (
            <div className="space-y-6">
              {/* High Priority */}
              <div className="rounded-lg border border-gray-200 dark:border-navy-700 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <h3 className="font-semibold text-navy-700 dark:text-white">High Priority</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      Frequency (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.todos.highPriority.frequency}
                      onChange={(e) =>
                        updateSetting("todos.highPriority.frequency", parseInt(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      Advance Warning (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.todos.highPriority.advanceWarning}
                      onChange={(e) =>
                        updateSetting("todos.highPriority.advanceWarning", parseInt(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Medium Priority */}
              <div className="rounded-lg border border-gray-200 dark:border-navy-700 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <h3 className="font-semibold text-navy-700 dark:text-white">Medium Priority</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      Frequency (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.todos.mediumPriority.frequency}
                      onChange={(e) =>
                        updateSetting("todos.mediumPriority.frequency", parseInt(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      Advance Warning (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.todos.mediumPriority.advanceWarning}
                      onChange={(e) =>
                        updateSetting("todos.mediumPriority.advanceWarning", parseInt(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Low Priority */}
              <div className="rounded-lg border border-gray-200 dark:border-navy-700 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <h3 className="font-semibold text-navy-700 dark:text-white">Low Priority</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      Frequency (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="10080"
                      value={settings.todos.lowPriority.frequency}
                      onChange={(e) =>
                        updateSetting("todos.lowPriority.frequency", parseInt(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      Advance Warning (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.todos.lowPriority.advanceWarning}
                      onChange={(e) =>
                        updateSetting("todos.lowPriority.advanceWarning", parseInt(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Priority Escalation */}
              <div className="rounded-lg border border-gray-200 dark:border-navy-700 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="escalationEnabled"
                    checked={settings.todos.escalation.enabled}
                    onChange={(e) =>
                      updateSetting("todos.escalation.enabled", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <label htmlFor="escalationEnabled" className="font-semibold text-navy-700 dark:text-white cursor-pointer">
                    Priority Escalation
                  </label>
                </div>
                {settings.todos.escalation.enabled && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Escalate When Due In (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={settings.todos.escalation.daysBeforeDue}
                        onChange={(e) =>
                          updateSetting("todos.escalation.daysBeforeDue", parseInt(e.target.value))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Increase Priority By
                      </label>
                      <select
                        value={settings.todos.escalation.increasePriorityBy}
                        onChange={(e) =>
                          updateSetting("todos.escalation.increasePriorityBy", parseInt(e.target.value))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                      >
                        <option value="1">1 Level</option>
                        <option value="2">2 Levels</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Budget Notifications */}
        <Card extra="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdAccountBalanceWallet className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              <div>
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                  Budget Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transaction reminders and budget alerts
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.budget.enabled}
              onChange={(e) => updateSetting("budget.enabled", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
          </div>

          {settings.budget.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
                <div>
                  <p className="font-medium text-navy-700 dark:text-white">Transaction Reminders</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get notified before transactions are due</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.budget.transactionReminders}
                  onChange={(e) => updateSetting("budget.transactionReminders", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </div>

              {settings.budget.transactionReminders && (
                <div className="ml-4">
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Days Before Transaction
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.budget.daysBeforeTransaction}
                    onChange={(e) =>
                      updateSetting("budget.daysBeforeTransaction", parseInt(e.target.value))
                    }
                    className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
                <div>
                  <p className="font-medium text-navy-700 dark:text-white">Budget Limit Warning</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Alert when approaching budget limit</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.budget.budgetLimitWarning}
                  onChange={(e) => updateSetting("budget.budgetLimitWarning", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </div>

              {settings.budget.budgetLimitWarning && (
                <div className="ml-4">
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Warning Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={settings.budget.warningThreshold}
                    onChange={(e) =>
                      updateSetting("budget.warningThreshold", parseInt(e.target.value))
                    }
                    className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
                <div>
                  <p className="font-medium text-navy-700 dark:text-white">Monthly Summary</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Receive monthly budget summary</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.budget.monthlySummary}
                  onChange={(e) => updateSetting("budget.monthlySummary", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </div>

              {settings.budget.monthlySummary && (
                <div className="ml-4">
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Summary Day (day of month)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={settings.budget.summaryDay}
                    onChange={(e) =>
                      updateSetting("budget.summaryDay", parseInt(e.target.value))
                    }
                    className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Recipe Book Notifications */}
        <Card extra="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdRestaurantMenu className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              <div>
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                  Recipe Book Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cooking and meal planning reminders
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.recipeBook.enabled}
              onChange={(e) => updateSetting("recipeBook.enabled", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
          </div>

          {settings.recipeBook.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
                <div>
                  <p className="font-medium text-navy-700 dark:text-white">Cooking Session Reminders</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Remind before scheduled cooking sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.recipeBook.cookingSessionReminders}
                  onChange={(e) => updateSetting("recipeBook.cookingSessionReminders", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </div>

              {settings.recipeBook.cookingSessionReminders && (
                <div className="ml-4">
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Remind Minutes Before
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.recipeBook.reminderMinutesBefore}
                    onChange={(e) =>
                      updateSetting("recipeBook.reminderMinutesBefore", parseInt(e.target.value))
                    }
                    className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
                <div>
                  <p className="font-medium text-navy-700 dark:text-white">Meal Planning Notifications</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Weekly meal planning suggestions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.recipeBook.mealPlanningNotifications}
                  onChange={(e) => updateSetting("recipeBook.mealPlanningNotifications", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
                <div>
                  <p className="font-medium text-navy-700 dark:text-white">Daily Meal Reminder</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Daily reminder for meal planning</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.recipeBook.dailyMealReminder}
                  onChange={(e) => updateSetting("recipeBook.dailyMealReminder", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </div>

              {settings.recipeBook.dailyMealReminder && (
                <div className="ml-4">
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Reminder Time (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={settings.recipeBook.reminderTime}
                    onChange={(e) =>
                      updateSetting("recipeBook.reminderTime", e.target.value)
                    }
                    className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* General Settings */}
        <Card extra="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <MdNotifications className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              <div>
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                  General Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  App-wide notification preferences
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
              <div>
                <p className="font-medium text-navy-700 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.general.emailNotifications}
                onChange={(e) => updateSetting("general.emailNotifications", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
              <div>
                <p className="font-medium text-navy-700 dark:text-white">Push Notifications</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Browser push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.general.pushNotifications}
                onChange={(e) => updateSetting("general.pushNotifications", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
              <div>
                <p className="font-medium text-navy-700 dark:text-white">Sound</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Play sound for notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.general.soundEnabled}
                onChange={(e) => updateSetting("general.soundEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-navy-700 p-3">
              <div>
                <p className="font-medium text-navy-700 dark:text-white">Quiet Hours</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Silence notifications during specific hours</p>
              </div>
              <input
                type="checkbox"
                checked={settings.general.quietHoursEnabled}
                onChange={(e) => updateSetting("general.quietHoursEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
            </div>

            {settings.general.quietHoursEnabled && (
              <div className="ml-4 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.general.quietHoursStart}
                    onChange={(e) =>
                      updateSetting("general.quietHoursStart", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={settings.general.quietHoursEnd}
                    onChange={(e) =>
                      updateSetting("general.quietHoursEnd", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Save reminder */}
      {hasChanges && (
        <div className="mt-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            You have unsaved changes. Click "Save Settings" to apply your changes.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
