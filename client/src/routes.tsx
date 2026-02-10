import React from "react";

// Admin Imports
import Budget from "views/admin/default";
import RecipeBook from "views/admin/marketplace";
import Profile from "views/admin/profile";
import Todos from "views/admin/todos";

// Icon Imports
import {
  MdAccountBalanceWallet,
  MdRestaurantMenu,
  MdPerson,
  MdCheckCircle,
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
    component: <Budget />,
  },
  {
    name: "Todos",
    layout: "/admin",
    path: "todos",
    icon: <MdCheckCircle className="h-6 w-6" />,
    component: <Todos />,
  },
  {
    name: "Recipe Book",
    layout: "/admin",
    path: "recipe-book",
    icon: <MdRestaurantMenu className="h-6 w-6" />,
    component: <RecipeBook />,
  },
];
export default routes;
