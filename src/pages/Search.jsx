import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { getYears, getCustomers } from "../utils/utils.js";
import BackButton from "../components/BackButton";
import CreateCustomer from "../components/CreateCustomer.jsx";
import SearchCardComponent from "../components/SearchCardComponent.jsx";

export default function Search() {
  const [error, setError] = useState("");
  const countChildren = useRef(0);
  const countSenior = useRef(0);
  const [errorBool, setErrorBool] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const navigate = useNavigate();
  const [yearOption, setYearOption] = useState([]);
  const [selectedYearOption, setSelectedYearOption] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isSenior, setIsSenior] = useState(false);

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
    getYears(getYearsSuccCallback, errCallback);
  }, []);

  useEffect(() => {
    if (selectedYearOption)
        getCustomers((res) => {
            countSenior.current = 0;
            countChildren.current = 0;
            setErrorBool(false);
            setCustomers(res.data);
            setFilteredCustomers(res.data);
            res.data.forEach((c) => {
                countChildren.current += c.children;
                countSenior.current += c.seniors;
            })
        }, errCallback, selectedYearOption.value);
  }, [selectedYearOption]);

  useEffect(() => {
    if (isSenior) {
    setFilteredCustomers(customers.filter((customer) => {
          return customer.seniors > 0
        }))
    } else {
      setFilteredCustomers(customers)
    }
  }, [isSenior]);

  const getYearsSuccCallback = (res) => {
    setErrorBool(false);
    const options = [];
    if (res.data && res.data.length > 0) {
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

  function filterCustomers(e) {
        setFilteredCustomers(customers.filter((customer) => {
            const searchTerm = e.target.value.toLowerCase().split(" ").join("");
                if (isSenior) {
                    const searchString = customer.firstName.toLowerCase() + customer.lastName.toLowerCase();
                    return searchString.includes(searchTerm) && customer.seniors > 0
                }  
                const searchString = customer.firstName.toLowerCase() + customer.lastName.toLowerCase();
                return searchString.includes(searchTerm)
            
        }))
    }

  const addCustomer = (customer) => {
        setCustomer(customer);
        setIsAddCustomerOpen(true);
    };

  return (
    <section className="bg-white flex align-middle items-center dark:bg-gray-900 h-screen w-screen dark:text-white">
      <CreateCustomer 
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        customer={customer}
      />
      <BackButton />
      <div className="py-4 px-4 mx-20 w-full h-[90%] rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 lg:px-6">
            <div className="h-24 mb-2 flex flex-row justify-center items-center gap-2">
            <Select
              className="text-black w-26"
              value={selectedYearOption}
              onChange={(selected) => {
                setSelectedYearOption(selected);
              }}
              options={yearOption}
            />
            <input
                className="h-9 p-2 text-black rounded-md border border-gray-300"
                placeholder="Search"
                onChange={filterCustomers}
            />
            <div>
                <input 
                    type="checkbox"
                    value={isSenior}
                    onChange={(e) => {
                        setIsSenior(e.target.checked)
                    }}
                />
                <label className="ml-2">Only Seniors</label>
            </div>
            <div className="ml-8">
                <div className="flex flex-col">
                    <div>
                        Total: {customers.length}
                    </div>
                    <div>
                        Children: {countChildren.current}
                    </div>
                    <div>
                        Seniors: {countSenior.current}
                    </div>
                </div>
            </div>
            </div>
            {errorBool ? (
              <div className="w-full mt-2 rounded-lg p-2 text-white bg-red-500 border-red-600 border-2">
                {error}
              </div>
            ) : null}
            <div className="overflow-y-auto h-[90%]">
            <div className="t-6 flex flex-wrap gap-4 justify-center">
                {filteredCustomers.map((customer, index) => {
                    return (
                        <div key={"customer-" + index} className=" w-64" onClick={() => addCustomer(customer)}>
                            <SearchCardComponent customer={customer}/>
                        </div>
                    )
                })}
            </div>
            </div>
      </div>
    </section>
  );
}
