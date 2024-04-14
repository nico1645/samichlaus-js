import { useNavigate } from "react-router-dom";
import { useTour } from "../provider/TourProvider";
export default function CardComponent({ customer, index, group, dropItem }) {
  const navigate = useNavigate();

  const getSeniorChildString = (children, seniors) => {
    if (children === 0 && seniors === 0) {
      return "0";
    } else if (children === 0) {
      return seniors + "S";
    } else if (seniors === 0) {
      return children + "C";
    } else {
      return children + "C" + " " + seniors + "S";
    }
  };

  const deleteCustomer = () => {

  }

  return (
    <div className="flex-grow cursor-grab h-[calc(5rem-4px)] m-1 active:cursor-grabbing select-none border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-black shadow-sm">
      <div className="p-2 w-full whitespace-nowrap overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className=" overflow-clip flex-grow max-w-64 md:max-w-40 lg:max-w-64">
            <h2 className="text-lg pt-2 ">
              {customer.firstName + " " + customer.lastName}
            </h2>
            <p className=" text-sm pb-4">{customer.address.address}</p>
          </div>
          <div className=" flex flex-col justify-center items-center gap-2 ">
            <div className="flex flex-row gap-2 -translate-y-3">
              <div
                onClick={() => navigate("/customer/" + customer.customerId)}
                className=" cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </div>
              <div
                className=" cursor-pointer"
                onClick={() => {
                  if (group === "Z")
                    deleteCustomer();
                  else
                    dropItem(index, -1, group, "Z");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <p className=" text-sm">
              {getSeniorChildString(customer.children, customer.seniors)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
