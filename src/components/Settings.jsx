import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { RAYON_OPTIONS } from "../constants/Constants";
import { useTour } from "../provider/TourProvider";

export default function Settings({ isOpen, onClose }) {
  const modal = useRef(null);
  const [error, setError] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const [maxSeconds, setMaxSeconds] = useState(10);
  const navigate = useNavigate();
  const { setRayonYear, year, rayon } = useTour();
  const [yearOption, setYearOption] = useState({
    value: year,
    label: year.toString(),
  });
  const [rayonOption, setRayonOption] = useState({
    value: rayon,
    label: "Rayon " + "I".repeat(rayon),
  });

  useEffect(() => {
    if (modal.current) {
      if (isOpen) {
        modal.current.showModal();
      } else {
        modal.current.close();
      }
    }
  }, [isOpen]);

  const revert = () => {};
  const commit = () => {};
  const handleCalculateTour = () => {
    
  };
  const handleDownloadExcel = () => {
    axios
      .get(
        import.meta.env.VITE_APP_BACKEND_URL +
          "api/v1/vrp/excel/" +
          year.toString(),
        {
          headers: {
            "Content-Type": "application/octet-stream",
          },
          responseType: "blob",
        }
      )
      .then((res) => {
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(response.data);
        a.download = `Laufliste_${year}.xlsm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 403)
            navigate("/logout", { replace: true });
          setError(
            "Error (" + err.response.status + "): " + err.response.data.message
          );
        } else if (err.request) {
          setError("Unexpected Error: " + err.message);
        } else {
          setError("Unexpected Error: " + err.message);
        }
        setErrorBool(true);
      });
  };

  const handleClose = () => {
    setErrorBool(false);
    if (year !== yearOption.value || rayon !== rayonOption.value)
      setRayonYear(yearOption.value, rayonOption.value);
    onClose();
  };

  return (
    <dialog
      ref={modal}
      id="openModal"
      className="modal bg-gray-50 rounded-lg shadow dark:border  dark:bg-gray-800 dark:border-gray-700 p-4 "
    >
      <div className="flex mb-2 modal-header dark:text-white justify-between flex-row items-center">
        <div className=" text-xl font-bold">Settings</div>
        <span
          onClick={handleClose}
          className="p-2 px-4 align-bottob-2 border-2 dark:border-white border-black hover:cursor-pointer rounded-full"
        >
          X
        </span>
      </div>
      <div className="modal-body dark:text-white">
        <div className="flex items-center mb-4">
          <div>Storing data:</div>
          <div className=" flex-grow"></div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-lg bg-green-600 hover:bg-green-800 text-white"
              onClick={commit}
            >
              Commit
            </button>
            <button
              className="p-2 rounded-lg bg-red-600 hover:bg-red-800 text-white"
              onClick={revert}
            >
              Revert
            </button>
          </div>
        </div>
        <div className=" flex flex-col md:flex-row items-start gap-2 md:gap-4 mb-4">
          <div className="flex flex-row gap-4 md:gap-8 items-center">
            <div>Year: </div>
            <Select
              className="text-black"
              value={yearOption}
              onChange={(selected) => setYearOption(selected)}
              options={[{ value: 2024, label: "2024" }]}
            />
          </div>
          <div className="flex flex-row gap-4 md:gap-8 items-center">
            <div>Rayon: </div>
            <Select
              className="text-black"
              value={rayonOption}
              onChange={(selected) => setRayonOption(selected)}
              options={RAYON_OPTIONS}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div>Address Import:</div>
          <button
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white"
            onClick={() => {
              onClose();
              navigate("/address-import");
            }}
          >
            Goto Page
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <button
            onClick={handleDownloadExcel}
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-800 flex-grow m-1 text-white"
          >
            Download Excel
          </button>
          <div className="flex rounded-lg dark:bg-gray-700 dark:border-gray-600 border">
            <button
              onClick={handleCalculateTour}
              className="p-2 rounded-lg bg-primary-600 hover:bg-primary-800 m-1 text-white"
            >
              Calculate Tour
            </button>
            <input
              name="max-seconds"
              className="flex-shrink m-2 text-black px-1 border border-black"
              type="number"
              min={1}
              max={900}
              value={maxSeconds}
              onChange={(e) => {
                if (e.target.value !== "")
                  setMaxSeconds(parseInt(e.target.value));
                else setMaxSeconds(e.target.value);
              }}
            />
          </div>
        </div>
        {errorBool ? (
          <div className="w-full rounded-lg p-2 text-white bg-red-500 border-red-600 border-2">
            {error}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
