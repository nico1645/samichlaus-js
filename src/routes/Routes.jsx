import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../pages/Login";
import Signup from "../pages/Singup";
import Error from "../pages/Error";
import Logout from "../pages/Logout";
import Home from "../pages/Home";
import Address from "../pages/Address";
import Customer from "../pages/Customer";
import CustomerEdit from "../pages/CustomerEdit";
import Search from "../pages/Search";
import TourProvider from "../provider/TourProvider";

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
          element: <Search />,
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
