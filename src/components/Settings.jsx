import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { RAYON_OPTIONS, MAX_GROUPS } from "../constants/Constants";
import useTour from "../provider/Tour";
import { getExcel, getTour, getYears, postCalculateTour } from "../utils/utils";
import PropTypes from 'prop-types';

export default function Settings({ isOpen, onClose, setGroup }) {
  const modal = useRef(null);
  const [error, setError] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const [maxSeconds, setMaxSeconds] = useState(10);
  const navigate = useNavigate();
  const { year, rayon, setNewTour } = useTour();
  const [yearOption, setYearOption] = useState([]);
  const [selectedYearOption, setSelectedYearOption] = useState({
    value: year,
    label: year,
  });
  const [rayonOption, setRayonOption] = useState({
    value: rayon,
    label: "Rayon " + "I".repeat(rayon),
  });

  const errCallback = (err) => {
    if (err.response) {
      if (err.response.status === 403) navigate("/logout", { replace: true });
      setError(
        "Error (" + err.response.status + "): " + err.response.data.message
      );
    } else if (err.request) {
      setError("Unexpected Error: " + err.message);
    } else {
      setError("Unexpected Error: " + err.message);
    }
    setErrorBool(true);
  };

  useEffect(() => {
    if (modal.current) {
      if (isOpen) {
        setSelectedYearOption({
            value: year,
            label: year,
        });
        setRayonOption({
            value: rayon,
            label: "Rayon " + "I".repeat(rayon),
        });
        modal.current.showModal();
      } else {
        modal.current.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    getYears(getYearsSuccCallback, errCallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getYearsSuccCallback = (res) => {
    setErrorBool(false);
    const options = [];
    if (res.data && res.data.length > 0) {
      if (year && rayon && res.data.includes(year))
        handleYearRayonChange(year, rayon);

      setSelectedYearOption({
        value: res.data[0],
        label: res.data[0].toString(),
      });
      res.data.map((year) =>
        options.push({
          value: year,
          label: year.toString(),
        })
      );
    }
    setYearOption(options);
  };

  const calculateTourSuccCallback = () => {
    setErrorBool(false);
    navigate(0);
  };

  //const revert = () => {};
  //const commit = () => {};

  const handleCalculateTour = () => {
    if (maxSeconds < 1 || maxSeconds > 900) {
      setError("Max Seconds should be between 1 and 900");
      setErrorBool(true);
      setMaxSeconds(10);
      return;
    }
    postCalculateTour(
      calculateTourSuccCallback,
      errCallback,
      { maxTimeInSeconds: maxSeconds, maxGroups: MAX_GROUPS, maxVisitTimePerGroup: 180 },
      selectedYearOption.value,
      rayonOption.value
    );
  };

  const downloadExcelSuccCallback = (res) => {
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(res.data);
    a.download = `Laufliste_${year}.xlsm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadExcel = () => {
    getExcel(downloadExcelSuccCallback, errCallback, selectedYearOption.value);
  };

  const tourSuccCallback = (res) => {
    setErrorBool(false);
    if (res.data.routes.length - 1 > 0) setGroup("A");
    else setGroup("");
    setNewTour(res.data);
  };

  const handleYearRayonChange = (newYear, newRayon) => {
    getTour(tourSuccCallback, errCallback, newYear, newRayon);
  };

  const handleClose = () => {
    setErrorBool(false);
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
      <div className="modal-body dark:text-white overflow-hidden">
        {/*<div className="flex items-center mb-4">
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
        </div>*/}
        <div className=" flex flex-col md:flex-row items-start gap-2 md:gap-4 mb-4">
          <div className="flex flex-row gap-4 md:gap-8 items-center">
            <div>Year: </div>
            <Select
              className="text-black"
              value={selectedYearOption}
              onChange={(selected) => {
                setSelectedYearOption(selected);
                handleYearRayonChange(selected.value, rayonOption.value);
              }}
              options={yearOption}
              menuPosition="fixed"
            />
          </div>
          <div className="flex flex-row gap-4 md:gap-8 items-center">
            <div>Rayon: </div>
            <Select
              className="text-black"
              value={rayonOption}
              onChange={(selected) => {
                setRayonOption(selected);
                handleYearRayonChange(selectedYearOption.value, selected.value);
              }}
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
        <div className="flex justify-between items-center mb-4">
          <div>Mail Service:</div>
          <button
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white"
            onClick={() => {
              onClose();
              navigate("/customer-mail/"+selectedYearOption.value);
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
          <div className="w-full mt-2 rounded-lg p-2 text-white bg-red-500 border-red-600 border-2">
            {error}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

Settings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setGroup: PropTypes.func.isRequired,
};
