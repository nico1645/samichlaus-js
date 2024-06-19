import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function Sidebar({ openSettings, openCreateCustomer }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-1 m-1 w-14 bg-gray-50 rounded-lg dark:border  dark:bg-gray-800 dark:border-gray-700">
      <div
        onClick={() => navigate(0)}
        className=" border-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 border-2 m-1 rounded-lg p-2 text-center flex-shrink dark:border-gray-600 dark:hover:bg-gray-600"
      >
        <img src="/samichlaus_icon.png" alt="samichlaus icon" />
      </div>
      <div
        title="Create New Customer"
        onClick={() => openCreateCustomer()}
        className=" border-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 border-2 m-1 rounded-lg p-2 text-center flex-shrink dark:border-gray-600 dark:hover:bg-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className=" dark:fill-white"
        >
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div
        title="Import Customer File"
        onClick={() => navigate("/customer-import")}
        className=" border-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 border-2 m-1 rounded-lg p-2 text-center flex-shrink dark:border-gray-600 dark:hover:bg-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="dark:stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
          />
        </svg>
      </div>
      <div
        title="Search for Customers"
        onClick={() => navigate("/customer-search")}
        className=" border-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 border-2 m-1 rounded-lg p-2 text-center flex-shrink dark:border-gray-600 dark:hover:bg-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="dark:stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <div className="flex-grow"></div>
      <div
        title="Settings"
        onClick={() => openSettings()}
        className="border-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 border-2 m-1 rounded-lg p-2 text-center flex-shrink dark:border-gray-600 dark:hover:bg-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className=" dark:stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </div>
      <div
        title="Logout"
        onClick={() => navigate("/logout", { replace: true })}
        className="border-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 border-2 m-1 rounded-lg p-2 text-center flex-shrink dark:border-gray-600 dark:hover:bg-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="dark:stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
          />
        </svg>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  openSettings: PropTypes.func.isRequired,
  openCreateCustomer: PropTypes.func.isRequired,
};
