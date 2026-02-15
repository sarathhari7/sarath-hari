/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

export const SidebarLinks = (props: { routes: RoutesType[] }): JSX.Element => {
  let location = useLocation();
  const { routes } = props;
  const [expandedRoutes, setExpandedRoutes] = React.useState<string[]>([]);

  // Auto-expand parent if child is active
  React.useEffect(() => {
    routes.forEach((route) => {
      if (route.children) {
        const hasActiveChild = route.children.some((child) =>
          location.pathname.includes(child.path)
        );
        if (hasActiveChild && !expandedRoutes.includes(route.path)) {
          setExpandedRoutes((prev) => [...prev, route.path]);
        }
      }
    });
  }, [location.pathname]);

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return location.pathname.includes(routeName);
  };

  const toggleExpand = (routePath: string) => {
    setExpandedRoutes((prev) =>
      prev.includes(routePath)
        ? prev.filter((p) => p !== routePath)
        : [...prev, routePath]
    );
  };

  const createLinks = (routes: RoutesType[]) => {
    return routes.map((route, index) => {
      // Skip hidden routes
      if (route.hidden) {
        return null;
      }

      if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        const hasChildren = route.children && route.children.length > 0;
        const isExpanded = expandedRoutes.includes(route.path);
        const hasActiveChild = hasChildren && route.children.some((child) =>
          activeRoute(child.path)
        );

        return (
          <div key={index}>
            {/* Parent Route */}
            {hasChildren ? (
              <div
                onClick={() => toggleExpand(route.path)}
                className="relative mb-3 flex hover:cursor-pointer"
              >
                <li className="my-[3px] flex w-full cursor-pointer items-center px-8">
                  <span
                    className={`${
                      hasActiveChild
                        ? "font-bold text-brand-500 dark:text-white"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.icon ? route.icon : <DashIcon />}{" "}
                  </span>
                  <p
                    className={`leading-1 ml-4 flex flex-1 ${
                      hasActiveChild
                        ? "font-bold text-navy-700 dark:text-white"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.name}
                  </p>
                  {isExpanded ? (
                    <MdKeyboardArrowDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <MdKeyboardArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </li>
                {hasActiveChild ? (
                  <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                ) : null}
              </div>
            ) : (
              <Link to={route.layout + "/" + route.path}>
                <div className="relative mb-3 flex hover:cursor-pointer">
                  <li className="my-[3px] flex cursor-pointer items-center px-8">
                    <span
                      className={`${
                        activeRoute(route.path)
                          ? "font-bold text-brand-500 dark:text-white"
                          : "font-medium text-gray-600"
                      }`}
                    >
                      {route.icon ? route.icon : <DashIcon />}{" "}
                    </span>
                    <p
                      className={`leading-1 ml-4 flex ${
                        activeRoute(route.path)
                          ? "font-bold text-navy-700 dark:text-white"
                          : "font-medium text-gray-600"
                      }`}
                    >
                      {route.name}
                    </p>
                  </li>
                  {activeRoute(route.path) ? (
                    <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                  ) : null}
                </div>
              </Link>
            )}

            {/* Child Routes (Submenu) */}
            {hasChildren && isExpanded && (
              <div className="ml-4">
                {route.children.map((child, childIndex) => (
                  <Link
                    key={childIndex}
                    to={route.layout + "/" + child.path}
                  >
                    <div className="relative mb-2 flex hover:cursor-pointer">
                      <li className="my-[3px] flex cursor-pointer items-center px-8">
                        <span
                          className={`text-xs ${
                            activeRoute(child.path)
                              ? "font-bold text-brand-500 dark:text-white"
                              : "font-medium text-gray-500"
                          }`}
                        >
                          •
                        </span>
                        <p
                          className={`leading-1 ml-3 flex text-sm ${
                            activeRoute(child.path)
                              ? "font-semibold text-navy-700 dark:text-white"
                              : "font-medium text-gray-600"
                          }`}
                        >
                          {child.name}
                        </p>
                      </li>
                      {activeRoute(child.path) ? (
                        <div className="absolute right-0 top-px h-7 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }
    });
  };

  return <>{createLinks(routes)}</>;
};

export default SidebarLinks;
