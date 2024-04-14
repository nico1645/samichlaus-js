import { useEffect, useState } from "react";
const TableComponent = ({ route, group, nameRef }) => {
    const [senior, setSenior] = useState();
    const [children, setChildren] = useState(0);

    useEffect(() => {
      let s = 0;
      let s1 = 0;
      route.customers.forEach((c) => s = c.children + s);
      route.customers.forEach((c) => s1 = c.seniors + s1);
      setChildren(s);
      setSenior(s1);
    }, [route])

  const generateInputRef = (key) => {
    return (ref) => {
      nameRef.current[group + key] = ref;
    };
  };

  function getAbsMinuteDifference(time1, time2) {
    // Split the time strings into hours and minutes
    const [hours1, minutes1, sec1] = time1.split(':').map(Number);
    const [hours2, minutes2, sec2] = time2.split(':').map(Number);

    // Calculate the total minutes for each time
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    // Calculate the absolute difference in minutes
    const diffInMinutes = Math.abs(totalMinutes2 - totalMinutes1);

    return diffInMinutes;
}
  return (
    <div className="w-full p-4">
      <div className="bg-white h-full border border-gray-200 rounded-md shadow-md p-4 dark:bg-gray-800 dark:border-black">
        {/* Table Header */}
        <div className="flex justify-between mb-4">
          <div>
            <span className="font-semibold mr-2">Gruppe {group}</span>
          </div>
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
              className="flex-grow border border-gray-300 rounded-md p-1"
            />
          </div>
          {/* Name, Adresse, Children, Senior, and Time Interval inputs */}
          <table className="border p-2">
            <thead>
              <tr>
                <th className="">Start Time</th>
                <th className="text-nowrap" colSpan={2}>
                  Laufen/Fahren
                </th>
                <th>Children</th>
                <th>Seniors</th>
                <th>Minutes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border">
                <td className=" border">{route.customerStart.slice(0, 5)}</td>
                <td className="text-nowrap border">Name</td>
                <td className="text-nowrap border">Address</td>
                <td className="text-center">{children}</td>
                <td className="text-center">{senior}</td>
                <td className="border">
                  <input
                    className="text-black rounded-md px-1 mx-auto"
                    type="number"
                    value={route.customers.length > 0 ? getAbsMinuteDifference(route.customers[0].visitTime, route.customerStart) : 0}
                    min={0}
                    max={300}
                  />
                </td>
              </tr>
              {route.customers.map((customer, index) => {
                var value = 0;
                if (index < route.customers.length - 1)
                  value = getAbsMinuteDifference(route.customers[index].visitTime, route.customers[index+1].visitTime);

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
                        className="text-black rounded-md px-1 mx-auto"
                        type="number"
                        defaultValue={value}
                        min={0}
                        max={300}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
