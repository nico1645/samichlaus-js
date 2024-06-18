import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import AsyncSelect from "react-select/async";
import BackButton from "../components/BackButton";
import { getAddressesContaining, getCustomer, putCustomer } from "../utils/utils";

export default function CustomerEdit() {
  const { uuid } = useParams();
  const [error, setError] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [visitRayon, setVisitRayon] = useState(1);
  const [visitYear, setVisitYear] = useState(0);
  const [visitTime, setVisitTime] = useState("");
  const navigate = useNavigate();

  const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };
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

  const customerSuccCallback = (res) => {
    setSelectedAddress({
      label: res.data.address.address,
      value: res.data.address.addressId,
      rayon: res.data.visitRayon,
    });
    setFirstName(res.data.firstName);
    setLastName(res.data.lastName);
    setChildren(res.data.children);
    setSeniors(res.data.seniors);
    setVisitRayon(res.data.visitRayon);
    setVisitYear(res.data.year);
    if (res.data.link != null)
        setLink(res.data.link);
    if (res.data.phone != null)
        setPhone(res.data.phone);
    if (res.data.email != null)
        setEmail(res.data.email);
    setVisitTime(res.data.visitTime);
  };

  useEffect(() => {
    getCustomer(customerSuccCallback, errCallback, uuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      addressId: selectedAddress.value,
      firstName: firstName,
      lastName: lastName,
      children: children,
      seniors: seniors,
      year: visitYear,
      visitRayon: visitRayon - 1,
      link: link,
      phone: phone,
      email: email,
      visitTime: visitTime,
    };
    putCustomer(() => navigate("/", { replace: true }), errCallback, data, uuid);
  };

  const getAddressesSuccCallback = (res, callback) => {
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
  };

  const loadOptions = (inputValue, callback) => {
    getAddressesContaining(
      inputValue,
      callback,
      getAddressesSuccCallback,
      errCallback
    );
  };

  return (
    <div className="flex items-center align-middle h-screen w-screen bg-white dark:bg-gray-900">
      <BackButton />
      <section className=" bg-gray-50  mx-auto rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="mb-2 dark:text-white ">
          <div className=" text-xl font-bold">Update Customer</div>
          {link ? (
            <div
              className="absolute translate-x-44 -translate-y-6 hover:cursor-pointer"
              onClick={() => openInNewTab(link)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 dark:stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </div>
          ) : null}
        </div>
        <div className="">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col gap-4"
          >
            <div className=" flex flex-row gap-6">
              <input
                className=" flex-grow rounded-lg p-1 border-black border-2"
                id="firstname"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                autoComplete="given-name"
              />
              <input
                className=" flex-grow rounded-lg p-1 border-black border-2"
                id="lastname"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                autoComplete="family-name"
              />
            </div>
            <div className="flex-grow">
              <input
                className="w-full rounded-lg p-1 border-black border-2"
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                autoComplete="email"
              />
            </div>
            <div className="flex grow">
              <input
                className="w-full rounded-lg p-1 border-black border-2"
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                autoComplete="phone"
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
                      setChildren(parseInt(e.target.value));
                    else setChildren(e.target.value);
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
                      setSeniors(parseInt(e.target.value));
                    else setSeniors(e.target.value);
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
              Update Customer
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
