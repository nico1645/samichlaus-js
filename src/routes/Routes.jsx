import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../pages/Login";
import Signup from "../pages/Singup";
import Error from "../pages/Error";
import Logout from "../pages/Logout";

const Routes = () => {
  const { token } = useAuth();

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: "/about",
      element: <div>About Us</div>,
      errorElement: <Error />
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
          element: <div>User Home Page</div>,
        },
        {
          path: "/logout",
          element: <Logout />,
        },
      ],
      errorElement: <Error />
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: "/login",
      element: <Login />,
      errorElement: <Error />
    },
    {
      path: "/signup",
      element: <Signup />,
      errorElement: <Error />
    },
    {
      path: "*",
      element: <Error />,
      errorElement: <Error />,
    }
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