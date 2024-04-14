import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import { useTour } from "../provider/TourProvider";

export default function CreateCustomer({ isOpen, onClose }) {
  const modal = useRef(null);
  const [error, setError] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [visitRayon, setVisitRayon] = useState(1);
  const { year, rayon } = useTour();
  const [visitYear, setVisitYear] = useState(year);
  const navigate = useNavigate();

  useEffect(() => {
    if (modal.current) {
      if (isOpen) {
        modal.current.showModal();
      } else {
        modal.current.close();
      }
    }
  }, [isOpen]);

  const reset = (e) => {
    setErrorBool(false);
    setSelectedAddress(null);
    setFirstName("");
    setLastName("");
    setChildren(0);
    setSeniors(0);
    setVisitYear(year);
    setVisitRayon(1);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        import.meta.env.VITE_APP_BACKEND_URL + "api/v1/customer/tour",
        {
          addressId: selectedAddress.value,
          firstName: firstName,
          lastName: lastName,
          children: children,
          seniors: seniors,
          year: visitYear,
          visitRayon: visitRayon,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (visitYear === year && visitRayon === rayon)
          navigate(0);
        reset();
      })
      .catch((err) => {
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
      });
  };

  const loadOptions = (inputValue, callback) => {
    axios
      .get(
        import.meta.env.VITE_APP_BACKEND_URL +
          "api/v1/address?address=" +
          encodeURI(inputValue) + "&limit=100",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        setErrorBool(false);
        if (res.status === 204) {
          callback([]);
          return;
        }
        const options = res.data.map((address) => ({
          value: address.addressId,
          label: address.address,
          rayon: address.rayon,
        }));
        callback(options);
      })
      .catch((err) => {
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
        callback([]);
      });
  };

  return (
    <dialog
      ref={modal}
      id="openModal"
      className="modal bg-gray-50 rounded-lg shadow dark:border  dark:bg-gray-800 dark:border-gray-700 p-4 "
    >
      <div className="flex mb-2 modal-header dark:text-white justify-between flex-row items-center">
        <div className=" text-xl font-bold">Create new Customer</div>
        <span
          onClick={onClose}
          className="p-2 px-4 align-bottob-2 border-2 dark:border-white border-black hover:cursor-pointer rounded-full"
        >
          X
        </span>
      </div>
      <div className="modal-body">
        <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-4">
          <div className=" flex flex-col sm:flex-row gap-6">
            <input
              className=" flex-grow rounded-lg p-1 border-black border-2"
              id="firstname"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
            <input
              className=" flex-grow rounded-lg p-1 border-black border-2"
              id="lastname"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </div>
          <div className=" flex-grow">
            <AsyncSelect
              value={selectedAddress}
              onChange={(selected) => {
                setVisitRayon(selected.rayon);
                setSelectedAddress(selected);
              }}
              placeholder="Search addresses..."
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions
            />
          </div>
          <div className=" flex flex-row gap-6">
            <div className="flex-grow">
              <label htmlFor="children" className=" dark:text-white mr-2">
                Count Children
              </label>
              <input
                id="children"
                type="number"
                value={children}
                className=" rounded-lg p-1 border-black border-2"
                min={0}
                max={100}
                onChange={(e) => {
                  if (e.target.value !== "")
                    setChildren(parseInt(e.target.value))
                  else
                    setChildren(e.target.value)
                }}
              />
            </div>
            <div className="">
              <label htmlFor="seniors" className=" dark:text-white mr-2">
                Count Seniors
              </label>
              <input
                id="seniors"
                type="number"
                className=" rounded-lg p-1 border-black border-2"
                value={seniors}
                min={0}
                max={100}
                onChange={(e) => {
                  if (e.target.value !== "")
                    setSeniors(parseInt(e.target.value))
                  else
                    setSeniors(e.target.value)
                }}
              />
            </div>
          </div>
          <div className=" flex flex-row gap-6">
            <div className="flex-grow">
              <label htmlFor="visitDate" className=" dark:text-white mr-2">
                Year
              </label>
              <input
                id="visitDate"
                type="number"
                className=" rounded-lg p-1 border-black border-2"
                required
                min={1700}
                max={10000}
                value={visitYear}
                onChange={(e) => setVisitYear(e.target.value)}
              />
            </div>
            <div className="">
              <label htmlFor="rayon" className=" dark:text-white mr-2">
                Rayon
              </label>
              <input
                id="rayon"
                type="number"
                className=" rounded-lg p-1 border-black border-2"
                required
                value={visitRayon}
                min={1}
                max={3}
                onChange={(e) => setVisitRayon(e.target.value)}
              />
            </div>
          </div>
          {errorBool ? (
            <div className="w-full rounded-lg p-2 text-white bg-red-500 border-red-600 border-2">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="w-full p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white"
          >
            Add Customer
          </button>
        </form>
      </div>
    </dialog>
  );
}
