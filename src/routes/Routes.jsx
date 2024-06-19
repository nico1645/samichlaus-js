import { RouterProvider, createBrowserRouter } from "react-router-dom";
import useAuth from "../provider/Auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { lazy } from "react";
import Login from "../pages/Login";

const Error = lazy(() => import("../pages/Error.jsx"));
const Logout = lazy(() => import("../pages/Logout.jsx"));
const Signup = lazy(() => import("../pages/Signup.jsx"));
const Home = lazy(() => import("../pages/Home.jsx"));
const Address = lazy(() => import("../pages/Address.jsx"));
const Customer = lazy(() => import("../pages/Customer.jsx"));
const CustomerEdit = lazy(() => import("../pages/CustomerEdit.jsx"));
const Search = lazy(() => import("../pages/Search.jsx"));
const Mail = lazy(() => import("../pages/Mail.jsx"));
const TourProvider = lazy(() => import("../provider/TourProvider.jsx"));

const Routes = () => {
  const { token } = useAuth();

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: "/about",
      element: <div>About Us</div>,
      errorElement: <Error />,
    },
  ];

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: "/",
          element: (
            <TourProvider>
              <Home />
            </TourProvider>
          ),
        },
        {
          path: "address-import",
          element: <Address />,
        },
        {
          path: "customer-import",
          element: <Customer />,
        },
        {
          path: "customer/:uuid",
          element: <CustomerEdit />,
        },
        {
          path: "customer-search",
          element: (
            <TourProvider>
              <Search />
            </TourProvider>
          ),
        },
        {
          path: "/customer-mail/:year",
          element: <Mail />,
        },
        {
          path: "/logout",
          element: <Logout />,
        },
      ],
      errorElement: <Error />,
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: "/login",
      element: <Login />,
      errorElement: <Error />,
    },
    {
      path: "/signup",
      element: <Signup />,
      errorElement: <Error />,
    },
    {
      path: "*",
      element: <Error />,
      errorElement: <Error />,
    },
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;
