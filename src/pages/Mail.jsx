
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTour, postManyMail, postMail } from "../utils/utils.js";
import BackButton from "../components/BackButton";

export default function Address() {
  const { year } = useParams();
  const countSent = useRef(0);
  const countFailed = useRef(0);
  const countNotSent = useRef(0);
  const [customerMails, setCustomerMails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const [sendMailCommit, setSendMailCommit] = useState(false);
  const navigate = useNavigate();

  const errCallback = (err) => {
    setIsLoading(false);
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

  const succTourCallback = (res) => {
    const date = res.data.date;
    const tmpMails = {};
    res.data.routes.forEach((route) => {
      if (route.group === "Z") return;
      route.customers.forEach((customer) => {
        if (customer.email === "") return;
        tmpMails[customer.customerId] = {
          customerId: customer.customerId,
          name: customer.lastName + " " + customer.firstName,
          visitDate: date,
          visitTime: customer.visitTime,
          email: customer.email,
          status: customer.mailStatus
        };
      });
    });
    setCustomerMails((prevMails) => Object.assign({}, prevMails, tmpMails));
  }

  useEffect(() => {
    getTour(
      (res) => {
        succTourCallback(res);
        getTour(
          (res) => {
            succTourCallback(res);
            getTour(
              (res) => {
                succTourCallback(res);
              },
              errCallback,
              year, 
              3
            );
          },
          errCallback,
          year, 
          2
        );
      }, 
      errCallback, 
      year, 
      1
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSendAllMails = () => {
    setSendMailCommit(false);
    setIsLoading(true);
    const mails = [];
    Object.values(customerMails).forEach((mail) => {
      if (mail.status === "NOT_SENT") mails.push(mail);
    });
    console.log(mails);
    if (mails.length === 0) {
      setError("There are no mails to send");
      setErrorBool(true);
      setIsLoading(false);
      return;
    }
    postManyMail(
      (res) => {
        const tmp = { ...customerMails };
        res.data.forEach((customer) => {
          tmp[customer.customerId].status = customer.mailStatus;
        })
        setCustomerMails(tmp);
        setIsLoading(false);
        setErrorBool(false);
      },
      errCallback,
      mails
    );
  }

  const handleSendMail = (mail) => {
    if (isLoading) {
      setError("Please wait until the mails are sent before sending a new one.");
      setErrorBool(true);
      return;
    }
    setIsLoading(true);
    postMail(
      (res) => {
        const tmp = { ...customerMails };
        tmp[res.data.customerId].status = res.data.mailStatus;
        setCustomerMails(tmp);
        setIsLoading(false);
        setErrorBool(false);
      },
      errCallback,
      mail
    );
  }


  return (
    <section className="bg-white flex align-middle items-center dark:bg-gray-900 h-screen dark:text-white">
      <BackButton />
      <div className="flex flex-col gap-1 py-8 w-full h-full px-4 dark:border  dark:bg-gray-800 dark:border-gray-700">
              {sendMailCommit ? (
                <div className="absolute p-4 text-lg text-black flex flex-col gap-2 translate-x-8 rounded-lg bg-gray-100 m-1 z-10">
                  Are you sure you want to send all unsent mails?
                  <div className="mx-2 flex flex-row justify-between">
                  <button
                    className="p-2 rounded-lg bg-green-600 hover:bg-green-800 text-white"
                    onClick={() => handleSendAllMails()}
                  >
                    Send Mails
                  </button>
                  <button
                    className="px-4 p-2 rounded-lg bg-red-600 hover:bg-red-800 text-white select-none"
                    onClick={() => setSendMailCommit(false)}
                  >
                    Cancel
                  </button>
                  </div>
                </div>
              ) : null}
          <button
            className="p-2 absolute rounded-lg bg-primary-600 hover:bg-primary-800 text-white ml-20"
            onClick={() => {
              if (isLoading) {
                setError("Please wait until the mails are sent before sending a new one.");
                setErrorBool(true);
              } else {
                setSendMailCommit(true)
              }
            }}
          >
            {isLoading ? "...Loading": "Send All Mails"}
          </button>
        <div className="mx-auto text-center">
          <h1 className="mb-4 lg:text-4xl tracking-tight md:text-xl text-lg font-bold  text-black dark:text-white">
            Samichlaus Mail Service {year}
          </h1>
        </div>
        {errorBool ? (
          <div className="rounded-lg p-2 text-white bg-red-500 border-red-600 border-2">
            {error}
          </div>
        ) : null}
        <div className="flex-grow flex flex-row gap-1">
          <div className="w-1/3 h-[90vh] border dark:border-gray-600 rounded-lg border-gray-300 overflow-y-auto">
            <h2 className="text-center text-lg text-semibold">Mail Not Sent   Total: {countNotSent.current}</h2>
            <table className="w-full">
            <tbody>
            {Object.values(customerMails).map((customerMail, i) => {
                if (customerMail.status !== "NOT_SENT") return null;
                return (
                    <tr key={"not-sent-customer-"+i} className="mx-1 border-y border-gray-200">
                        <td className="text-nowrap">{customerMail.visitDate}</td>
                        <td className="text-nowrap">{customerMail.visitTime}</td>
                        <td className="overflow-x-hidden">{customerMail.email}</td>
                        <td className="text-nowrap">
                            <button
                              className="rounded-md px-1 bg-blue-600 hover:bg-blue-800 text-white"
                              onClick={() => handleSendMail(customerMail)}
                            >
                              {isLoading ? "...Loading" : "Send Mail"}
                            </button>
                        </td>
                    </tr>
                )
            })}
            </tbody>
            </table>
          </div>
          <div className="w-1/3 h-[90vh] border dark:border-gray-600 rounded-lg border-gray-300 overflow-y-auto">
            <h2 className="text-center text-lg">Mail Failed To Send   Total: {countFailed.current}</h2>
            <table className="w-full">
            <tbody>
            {Object.values(customerMails).map((customerMail, i) => {
                if (customerMail.status !== "FAILED") return null;
                return (
                    <tr key={"failed-customer-"+i} className="mx-1 border-y border-gray-200">
                        <td className="text-nowrap">{customerMail.visitDate}</td>
                        <td className="text-nowrap">{customerMail.visitTime}</td>
                        <td className="overflow-x-hidden">{customerMail.email}</td>
                        <td className="text-nowrap">
                            <button
                              className="rounded-md px-1 bg-blue-600 hover:bg-blue-800 text-white"
                              onClick={() => handleSendMail(customerMail)}
                            >
                              {isLoading ? "...Loading" : "Retry"}
                            </button>
                        </td>
                    </tr>
                )
            })}
            </tbody>
            </table>
          </div>
          <div className="w-1/3 h-[90vh] border dark:border-gray-600 rounded-lg border-gray-300 overflow-y-auto">
            <h2 className="text-center text-lg">Mail Successfully Sent   Total: {countSent.current}</h2>
            <table className="w-full">
            <tbody>
            {Object.values(customerMails).map((customerMail, i) => {
                if (customerMail.status !== "SENT") return null;
                return (
                    <tr key={"sent-customer-"+i} className="mx-1 border-y border-gray-200">
                        <td className="text-nowrap">{customerMail.visitDate}</td>
                        <td className="text-nowrap">{customerMail.visitTime}</td>
                        <td className="overflow-x-hidden">{customerMail.email}</td>
                        <td className="text-nowrap">
                            <button
                              className="rounded-md px-1 bg-blue-600 hover:bg-blue-800 text-white"
                              onClick={() => handleSendMail(customerMail)}
                            >
                              {isLoading ? "...Loading" : "Resend"}
                            </button>
                        </td>
                    </tr>
                )
            })}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
