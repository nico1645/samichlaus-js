import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import ErrorPage from './pages/ErrorPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SingupPage.jsx'

const router = createBrowserRouter([
  {
      path: '/login',
      element: <LoginPage />,
      errorElement: <ErrorPage />,
  },
  {
      path: '/signup',
      element: <SignupPage />,
      errorElement: <ErrorPage />,
  },
  {
      path: '/',
      element: <App />,
      errorElement: <ErrorPage />,
  },
  {
      path: '*',
      element: <ErrorPage />,
      errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
