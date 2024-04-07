import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackButton from "../components/BackButton";

export default function Search() {
  const [error, setError] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const navigate = useNavigate();


  return (
    <section className="bg-white flex align-middle items-center dark:bg-gray-900 h-screen">
      <BackButton />
      <div className=" py-8 w-1/2 px-4 mx-auto rounded-lg shadow dark:border  dark:bg-gray-800 dark:border-gray-700 lg:py-16 lg:px-6">
      </div>
    </section>
  );
}
