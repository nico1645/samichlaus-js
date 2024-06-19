import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(-1)}
      className="border-white bg-gray-50 hover:bg-gray-200 shadow-lg hover:bg-gray-30 absolute flex top-2 left-2 h-12 w-12 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:border dark:hover:bg-gray-700 justify-center items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={2}
        stroke="currentColor"
        className="stroke-black dark:stroke-white h-6 w-6 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
        />
      </svg>
    </div>
  );
}
