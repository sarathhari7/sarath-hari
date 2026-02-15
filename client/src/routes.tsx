import React from "react";

// Admin Imports
import Overview from "views/admin/budget/overview";
import TransactionDetails from "views/admin/budget/transactions";
import RecipeBook from "views/admin/recipeBook";
import AllRecipes from "views/admin/recipeBook/all";
import Favorites from "views/admin/recipeBook/favorites";
import Profile from "views/admin/profile";
import Todos from "views/admin/todos";
import Notifications from "views/admin/notifications";
import AllNotifications from "views/admin/all-notifications";
import Events from "views/admin/events";

// Icon Imports
import {
  MdAccountBalanceWallet,
  MdRestaurantMenu,
  MdPerson,
  MdCheckCircle,
  MdDashboard,
  MdList,
  MdMenuBook,
  MdFavorite,
  MdCategory,
} from "react-icons/md";

const routes = [
  {
    name: "Profile",
    layout: "/admin",
    path: "default",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
  {
    name: "Budget",
    layout: "/admin",
    path: "budget",
    icon: <MdAccountBalanceWallet className="h-6 w-6" />,
    component: <></>,
    children: [
      {
        name: "Overview",
        layout: "/admin",
        path: "budget/overview",
        icon: <MdDashboard className="h-5 w-5" />,
        component: <Overview />,
      },
      {
        name: "Transaction Details",
        layout: "/admin",
        path: "budget/transactions",
        icon: <MdList className="h-5 w-5" />,
        component: <TransactionDetails />,
      },
    ],
  },
  {
    name: "Todos",
    layout: "/admin",
    path: "todos",
    icon: <MdCheckCircle className="h-6 w-6" />,
    component: <Todos />,
  },
  {
    name: "Notifications",
    layout: "/admin",
    path: "notifications",
    icon: <MdCheckCircle className="h-6 w-6" />,
    component: <Notifications />,
    hidden: true,
  },
  {
    name: "All Notifications",
    layout: "/admin",
    path: "all-notifications",
    icon: <MdCheckCircle className="h-6 w-6" />,
    component: <AllNotifications />,
    hidden: true,
  },
  {
    name: "Events",
    layout: "/admin",
    path: "events",
    icon: <MdCheckCircle className="h-6 w-6" />,
    component: <Events />,
    hidden: true,
  },
  {
    name: "Recipe Book",
    layout: "/admin",
    path: "recipe-book",
    icon: <MdRestaurantMenu className="h-6 w-6" />,
    component: <RecipeBook />,
    children: [
      {
        name: "All Recipes",
        layout: "/admin",
        path: "recipe-book/all",
        icon: <MdMenuBook className="h-5 w-5" />,
        component: <AllRecipes />,
      },
      {
        name: "Favorites",
        layout: "/admin",
        path: "recipe-book/favorites",
        icon: <MdFavorite className="h-5 w-5" />,
        component: <Favorites />,
      },
      {
        name: "Categories",
        layout: "/admin",
        path: "recipe-book/categories",
        icon: <MdCategory className="h-5 w-5" />,
        component: <></>,
      },
    ],
  },
];
export default routes;
