import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Customer() {
  const [file, setFile] = useState("");
  const [error, setError] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (file) {
      const formdata = new FormData();
      formdata.append("file", file);
      axios
        .post(
          import.meta.env.VITE_APP_BACKEND_URL + "api/v1/customer/upload",
          formdata,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          navigate("/", { replace: true });
        })
        .catch((err) => {
          if (err.response) {
            if (err.status === 403) navigate("/logout", { replace: true });
            setError(
              "Error (" +
                err.response.status +
                "): " +
                err.response.data.message
            );
          } else if (err.request) {
            setError("Unexpected Error: " + err.message);
          } else {
            setError("Unexpected Error: " + err.message);
          }
          setErrorBool(true);
        });
    } else {
      setErrorBool(true);
      setError("No file selected");
    }
  };

  return (
    <section className="bg-white flex align-middle items-center dark:bg-gray-900 h-screen">
      <div className=" py-8 w-1/2 px-4 mx-auto rounded-lg shadow dark:border  dark:bg-gray-800 dark:border-gray-700 lg:py-16 lg:px-6">
        <div className="mx-auto text-center">
          <h1 className="mb-4 text-4xl tracking-tight font-bold  text-black dark:text-white">
            Import new Customers
          </h1>
          <form onSubmit={(e) => handleSubmit(e)}>
            <input type="file" className="dark:text-white text-black" onChange={(e) => setFile(e.target.files[0])} />
            <button
              type="submit"
              className="mb-2 p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white"
            >
              Upload File
            </button>
            {errorBool ? (
              <div className="rounded-lg p-2 text-white bg-red-500 border-red-600 border-2">
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
