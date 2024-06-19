import PropTypes from "prop-types";

export default function CardComponent({ customer }) {
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

  return (
    <div className="flex-grow cursor-pointer h-[calc(5rem-4px)] m-1 select-none border border-gray-300 dark:text-white rounded-lg dark:bg-gray-900 dark:border-black shadow-sm">
      <div className="p-2 w-full whitespace-nowrap overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className=" overflow-clip flex-grow max-w-64 md:max-w-40 lg:max-w-64">
            <h2 className="text-lg pt-2 ">
              {customer.firstName + " " + customer.lastName}
            </h2>
            <p className=" text-sm pb-4">{customer.address.address}</p>
          </div>
          <div className=" flex flex-col items-center">
            <p className=" text-md font-semibold -translate-y-4">
              {"I".repeat(customer.visitRayon)}
            </p>
            <p className=" text-md">
              {getSeniorChildString(customer.children, customer.seniors)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

CardComponent.propTypes = {
  customer: PropTypes.object.isRequired,
};
