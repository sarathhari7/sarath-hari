import React from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BsArrowBarUp } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdCalendarToday, MdAccountBalanceWallet, MdCheckCircle, MdSettings } from "react-icons/md";
import MiniCalendar from "components/calendar/MiniCalendar";
import { getUpcomingNotificationData, NotificationData } from "services/notificationData";
import { Spinner } from "components/ui/spinner";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
}) => {
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(true);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      const response = await getUpcomingNotificationData();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-400 to-red-600';
      case 'medium':
        return 'from-yellow-400 to-yellow-600';
      case 'low':
        return 'from-green-400 to-green-600';
      default:
        return 'from-brandLinear to-brand-500';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'budget':
        return <MdAccountBalanceWallet />;
      case 'todo':
        return <MdCheckCircle />;
      default:
        return <BsArrowBarUp />;
    }
  };

  const formatDueDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return d.toLocaleDateString();
  };

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#2626264d]">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            href=" "
          >
            Pages
            <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 dark:text-white">
              {" "}
              /{" "}
            </span>
          </a>
          <Link
            className="text-sm font-normal capitalize text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            to="#"
          >
            {brandText}
          </Link>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700 dark:text-white">
          <Link
            to="#"
            className="font-bold capitalize hover:text-navy-700 dark:hover:text-white"
          >
            {brandText}
          </Link>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[365px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2">
        <div className="flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
          </p>
          <input
            type="text"
            placeholder="Search..."
            className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
          />
        </div>
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>
        {/* start Notification */}
        <Dropdown
          button={
            <p className="cursor-pointer relative">
              <IoMdNotificationsOutline className="h-4 w-4 text-gray-600 dark:text-white" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </p>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:w-[460px] max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-navy-700 pb-2">
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  Upcoming Notifications
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Next 7 days
                  </p>
                  <Link to="/admin/notifications">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors">
                      <MdSettings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </Link>
                </div>
              </div>

              {loadingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <IoMdNotificationsOutline className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No upcoming notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button key={notification.id} className="flex w-full items-center hover:bg-gray-50 dark:hover:bg-navy-600 rounded-lg p-2 transition-colors">
                    <div className={`flex h-full w-[70px] items-center justify-center rounded-xl bg-gradient-to-b ${getPriorityColor(notification.priority)} py-4 text-2xl text-white flex-shrink-0`}>
                      {getSourceIcon(notification.sourceType)}
                    </div>
                    <div className="ml-3 flex h-full w-full flex-col justify-center text-left">
                      <p className="mb-1 text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                        {notification.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDueDate(notification.dueDate)}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}

              {/* View All Button */}
              <div className="border-t pt-3 mt-2">
                <Link to="/admin/all-notifications">
                  <button className="w-full py-2 px-4 text-sm font-medium text-brand-500 hover:bg-gray-50 dark:hover:bg-navy-600 rounded-lg transition-colors">
                    View All Notifications
                  </button>
                </Link>
              </div>
            </div>
          }
          classNames={"py-2 top-4 -left-[230px] md:-left-[440px] w-max"}
        />
        {/* start Calendar */}
        <Dropdown
          button={
            <p className="cursor-pointer">
              <MdCalendarToday className="h-4 w-4 text-gray-600 dark:text-white" />
            </p>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-max flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <MiniCalendar />
            </div>
          }
          classNames={"py-2 top-4 -left-[320px] md:-left-[320px] w-max"}
        />
        <div
          className="cursor-pointer text-gray-600"
          onClick={() => {
            if (darkmode) {
              document.body.classList.remove("dark");
              setDarkmode(false);
            } else {
              document.body.classList.add("dark");
              setDarkmode(true);
            }
          }}
        >
          {darkmode ? (
            <RiSunFill className="h-4 w-4 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="h-4 w-4 text-gray-600 dark:text-white" />
          )}
        </div>
        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500">
              <span className="text-sm font-bold text-white">SH</span>
            </div>
          }
          children={
            <div className="flex h-48 w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="mt-3 ml-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hey, Sarath Hari
                  </p>{" "}
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="mt-3 ml-4 flex flex-col">
                <a
                  href=" "
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </a>
                <a
                  href=" "
                  className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Newsletter Settings
                </a>
                <a
                  href=" "
                  className="mt-3 text-sm font-medium text-red-500 hover:text-red-500"
                >
                  Log Out
                </a>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;
