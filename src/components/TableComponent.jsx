import { useEffect, useState } from "react";
import { getAbsMinuteDifference, DEPOT } from "../constants/Constants.js";
import useTour from "../provider/Tour";
import { updateRouteTime } from "../utils/utils.js";
import PropTypes from 'prop-types';
const TableComponent = ({ route, group, nameRef }) => {
  const [senior, setSenior] = useState();
  const [children, setChildren] = useState(0);
  const { addTime, updateTime } = useTour();

  useEffect(() => {
    let s = 0;
    let s1 = 0;
    route.customers.forEach((c) => (s = c.children + s));
    route.customers.forEach((c) => (s1 = c.seniors + s1));
    setChildren(s);
    setSenior(s1);
  }, [route]);

  const generateInputRef = (key) => {
    return (ref) => {
      nameRef.current[group + key] = ref;
    };
  };

  const handleTimeChange = (e, index) => {
    if (!parseInt(e.target.value)) return;
    const value = parseInt(e.target.value);
    if (value > 300 || value < 0) return;
    if (index === -1) {
      if (route.customers.length === 0) {
        addTime(group, index, value - getAbsMinuteDifference(
          route.customerStart,
          route.customerEnd
        ));
      } else {
        addTime(group, 0, value - getAbsMinuteDifference(
          route.customerStart,
          route.customers[0].visitTime
        ));
      }
    } else if (index < route.customers.length - 1)
      addTime(group, index + 1, value - getAbsMinuteDifference(
        route.customers[index].visitTime,
        route.customers[index + 1].visitTime
      ));
    else
      addTime(group, -1, value - getAbsMinuteDifference(
        route.customerEnd,
        route.customers[index].visitTime
      ));
  };

  const handleUpdateTime = () => {
    const data = {
        depot: DEPOT,
        startTime: route.customerStart,
        customers: route.customers,
        endTime: route.customerEnd,
    }
    data.customers.forEach((c) => {
        c.address.rayon = c.address.rayon - 1;
        c.visitRayon = c.visitRayon - 1;
    })
    updateRouteTime((res) => {
        const data = res.data;
        updateTime(group, data);
    },
    () => {},
    data
    );

  };

  return (
    <div className=" p-4">
      <div className="bg-white h-full border border-gray-200 rounded-md shadow-md p-4 dark:bg-gray-800 dark:border-black">
        {/* Table Header */}
        <div className="flex justify-between mb-4">
          <div>
            <span className="font-semibold mr-2">Gruppe {group}</span>
          </div>
          <button
              className="p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white select-none"
              onClick={() => handleUpdateTime()}
          >
          Update Time
          </button>
          <div className="font-semibold mr-2">
            Start Time: {route.customerStart.slice(0, 5)}
          </div>
        </div>
        {/* Table Body */}
        <div className="space-y-2">
          {/* Samichlaus input */}
          <div className="flex items-center">
            <label className="w-1/4" htmlFor={"samichlaus" + group}>
              Samichlaus
            </label>
            <input
              id={"samichlaus" + group}
              defaultValue={route.samichlaus}
              ref={generateInputRef("samichlaus")}
              type="text"
              className="flex-grow border border-gray-300 rounded-md p-1 text-black"
            />
          </div>
          {/* Ruprecht input */}
          <div className="flex items-center">
            <label className="w-1/4" htmlFor={"ruprecht" + group}>
              Ruprecht
            </label>
            <input
              id={"ruprecht" + group}
              type="text"
              defaultValue={route.ruprecht}
              ref={generateInputRef("ruprecht")}
              className="flex-grow border border-gray-300 rounded-md p-1 text-black"
            />
          </div>
          <div className="flex items-center">
            <label className="w-1/4" htmlFor={"schmutzli" + group}>
              Schmutzli
            </label>
            <input
              id={"schmutzli" + group}
              type="text"
              defaultValue={route.schmutzli}
              ref={generateInputRef("schmutzli")}
              className="flex-grow border border-gray-300 rounded-md p-1 text-black"
            />
          </div>
          <div className="flex items-center">
            <label className="w-1/4" htmlFor={"engel2" + group}>
              Engel
            </label>
            <input
              id={"engel1" + group}
              type="text"
              defaultValue={route.engel1}
              ref={generateInputRef("engel1")}
              className="flex-grow border border-gray-300 rounded-md p-1 text-black"
            />
          </div>
          <div className="flex items-center">
            <label className="w-1/4" htmlFor={"engel2" + group}>
              Engel
            </label>
            <input
              id={"engel2" + group}
              type="text"
              defaultValue={route.engel2}
              ref={generateInputRef("engel2")}
              className="flex-grow border border-gray-300 rounded-md p-1 text-black"
            />
          </div>
          {/* Name, Adresse, Children, Senior, and Time Interval inputs */}
          <table className="border p-2">
            <thead>
              <tr>
                <th className="border px-1">Start Time</th>
                <th className="text-nowrap" colSpan={2}>
                  Laufen/Fahren
                </th>
                <th className=" px-1">Children</th>
                <th className=" px-1">Seniors</th>
                <th className=" px-1">Minutes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border text-center">
                <td className=" border">{route.customerStart.slice(0, 5)}</td>
                <td className="text-nowrap border">Name</td>
                <td className="text-nowrap border">Address</td>
                <td className="text-center">{children}</td>
                <td className="text-center">{senior}</td>
                <td className="border text-center">
                  <input
                    id={"start-time-" + group}
                    className="text-black border-gray-300 border rounded-md px-1 mx-auto"
                    type="number"
                    value={
                      route.customers.length > 0
                        ? getAbsMinuteDifference(
                            route.customers[0].visitTime,
                            route.customerStart
                          )
                        : 0
                    }
                    onChange={(e) => handleTimeChange(e, -1)}
                    min={0}
                    max={300}
                  />
                </td>
              </tr>
              {route.customers.map((customer, index) => {
                var value = 0;
                if (index < route.customers.length - 1)
                  value = getAbsMinuteDifference(
                    route.customers[index].visitTime,
                    route.customers[index + 1].visitTime
                  );
                else
                  value = getAbsMinuteDifference(
                    route.customerEnd,
                    route.customers[index].visitTime
                  );

                return (
                  <tr key={"table-row-" + index} className="border">
                    <td className="border border-gray-300 rounded-md p-1">
                      {customer.visitTime.slice(0, 5)}
                    </td>
                    <td className="text-nowrap max-w-56 overflow-hidden border px-1">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="text-nowrap border px-1">
                      {customer.address.address}
                    </td>
                    <td className="text-nowrap border text-center px-1">
                      {customer.children}
                    </td>
                    <td className="text-nowrap border text-center">
                      {customer.seniors}
                    </td>
                    <td className="text-nowrap border text-center">
                      <input
                        id={"time-intervall-" + group + index}
                        className="text-black border-gray-300 border rounded-md px-1 mx-auto"
                        type="number"
                        value={value}
                        onChange={(e) => handleTimeChange(e, index)}
                        min={0}
                        max={300}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr key={"table-row-last"} className="border">
                <td className="border border-gray-300 rounded-md p-1">
                  {route.customerEnd.slice(0, 5)}
                </td>
                <td className="text-nowrap max-w-56 overflow-hidden border px-1"></td>
                <td className="text-nowrap border px-1">Grossmatt 5</td>
                <td className="text-nowrap border text-center px-1"></td>
                <td className="text-nowrap border text-center"></td>
                <td className="text-nowrap border text-center"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

TableComponent.propTypes = {
  route: PropTypes.object.isRequired,
  group: PropTypes.string.isRequired,
  nameRef: PropTypes.object.isRequired,
};

export default TableComponent;
