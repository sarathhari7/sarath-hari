import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import routes from "routes";
import { PageTitleProvider, usePageTitle } from "contexts/PageTitleContext";

function AdminContent(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Profile");
  const { pageTitle } = usePageTitle();

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);
  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes: RoutesType[]): string | boolean => {
    let activeRoute = "Profile";
    for (let i = 0; i < routes.length; i++) {
      // Check children first
      if (routes[i].children && routes[i].children.length > 0) {
        for (let j = 0; j < routes[i].children.length; j++) {
          const child = routes[i].children[j];
          if (
            window.location.href.indexOf(
              child.layout + "/" + child.path
            ) !== -1
          ) {
            setCurrentRoute(child.name);
            return activeRoute;
          }
        }
      }
      // Check parent route
      if (
        window.location.href.indexOf(
          routes[i].layout + "/" + routes[i].path
        ) !== -1
      ) {
        setCurrentRoute(routes[i].name);
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (routes: RoutesType[]): string | boolean => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routes: RoutesType[]): any => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        // If route has children
        if (prop.children && prop.children.length > 0) {
          // Check if parent component is empty (like Budget)
          const isEmptyComponent = prop.component?.type === React.Fragment;

          if (isEmptyComponent) {
            // For empty parents, render children directly
            return prop.children.map((child, childKey) => (
              <Route path={`/${child.path}`} element={child.component} key={`${key}-${childKey}`} />
            ));
          } else {
            // For non-empty parents (like RecipeBook), use wildcard to handle nested routes
            return (
              <Route path={`/${prop.path}/*`} element={prop.component} key={key} />
            );
          }
        }
        // Otherwise, generate route for the parent
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "ltr";
  return (
    <div className="flex h-full w-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {/* Navbar & Main Content */}
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[260px]`}
        >
          {/* Routes */}
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              brandText={pageTitle || currentRoute}
              secondary={getActiveNavbar(routes)}
              {...rest}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {getRoutes(routes)}

                <Route
                  path="/"
                  element={<Navigate to="/admin/default" replace />}
                />
              </Routes>
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Admin(props: { [x: string]: any }) {
  return (
    <PageTitleProvider>
      <AdminContent {...props} />
    </PageTitleProvider>
  );
}
