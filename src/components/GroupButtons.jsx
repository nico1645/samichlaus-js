import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  COLOR_DICT,
  GROUP_DICT,
  GROUP_LIST,
  MAX_GROUPS,
} from "../constants/Constants";
import useTour from "../provider/Tour";
import { createRoute } from "../utils/utils";
import PropTypes from "prop-types";

export default function GroupButtons({ group, setGroup, moveItem }) {
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState([]);
  const { tour, addNewGroup, removeGroup, numOfGroups, tourId, setError } =
    useTour();
  const navigate = useNavigate();

  useEffect(() => {
    if (numOfGroups > 0)
      setIsDeleteGroupOpen(new Array(numOfGroups).fill(false));
  }, [numOfGroups]);

  const handleDeleteGroupOpenMenu = (e, val) => {
    e.preventDefault();
    const arr = new Array(isDeleteGroupOpen.length).fill(false);
    arr[GROUP_DICT[val]] = true;
    setIsDeleteGroupOpen(arr);
  };

  const handleDeleteGroup = (val) => {
    if (GROUP_DICT[group] >= GROUP_DICT[val])
      if (numOfGroups === 1) setGroup("");
      else {
        setGroup(GROUP_LIST[numOfGroups - 2]);
      }
    removeGroup(val);
    setIsDeleteGroupOpen(new Array(isDeleteGroupOpen.length).fill(false));
  };

  const errCallback = (err) => {
    if (err.response) {
      if (err.response.status === 403) navigate("/logout", { replace: true });
      setError(
        "Error (" + err.response.status + "): " + err.response.data.message,
        true,
      );
    } else if (err.request) {
      setError("Unexpected Error: " + err.message, true);
    } else {
      setError("Unexpected Error: " + err.message, true);
    }
  };

  const handleAddGroup = () => {
    if (numOfGroups === 0) {
      createRoute((res) => addNewGroup(res.data), errCallback, {
        customerStart: "00:00:00",
        customerEnd: "00:00:00",
        transport: "foot",
        samichlaus: "",
        ruprecht: "",
        schmutzli: "",
        engel1: "",
        engel2: "",
        group: GROUP_LIST[numOfGroups],
        tourId: tourId,
      });
    } else {
      createRoute(
        (res) => addNewGroup(res.data),
        () => {},
        {
          customerStart: tour["A"].customerStart,
          customerEnd: tour["A"].customerStart,
          transport: "foot",
          samichlaus: "",
          ruprecht: "",
          schmutzli: "",
          engel1: "",
          engel2: "",
          group: GROUP_LIST[numOfGroups],
          tourId: tourId,
        },
      );
    }
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-center mt-2 overflow-auto">
      {Object.keys(tour).map((val) => {
        const color = COLOR_DICT[val];
        if (val !== "Z")
          return (
            <div
              className={`flex items-center ${
                group === val ? " border-[3px]" : ""
              } rounded-xl border-${
                color === "black" ? "gray-300" : color + "-200"
              }`}
              key={val}
            >
              <span
                onClick={() => {
                  setGroup(val);
                }}
                onContextMenu={(e) => handleDeleteGroupOpenMenu(e, val)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) =>
                  moveItem(
                    e.dataTransfer.getData("fromIndex"),
                    tour[val].customers.length,
                    e.dataTransfer.getData("fromGroup"),
                    val,
                  )
                }
                className={`flex items-center justify-around select-none h-10 w-10 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 hover:dark:bg-gray-600 text-center hover:cursor-pointer border-2 border-${
                  color === "black" ? "black" : color + "-400"
                }`}
              >
                <div className=" text-center">{val}</div>
              </span>
              {isDeleteGroupOpen[GROUP_DICT[val]] ? (
                <div className="absolute flex gap-2 translate-x-8 rounded-lg bg-gray-100 m-1">
                  <button
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-800 text-white"
                    onClick={() => handleDeleteGroup(val)}
                  >
                    Remove
                  </button>
                  <button
                    className="px-4 p-2 rounded-lg bg-gray-200 hover:bg-gray-300  text-black select-none"
                    onClick={() =>
                      setIsDeleteGroupOpen(
                        new Array(isDeleteGroupOpen.length).fill(false),
                      )
                    }
                  >
                    X
                  </button>
                </div>
              ) : null}
            </div>
          );
      })}
      {numOfGroups < MAX_GROUPS ? (
        <span
          onClick={handleAddGroup}
          className="flex items-center h-10 w-10 rounded-lg border-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 hover:dark:bg-gray-600 p-1 text-center hover:cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 dark:stroke-white mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </span>
      ) : null}
    </div>
  );
}

GroupButtons.propTypes = {
  group: PropTypes.string.isRequired,
  moveItem: PropTypes.func.isRequired,
  setGroup: PropTypes.func.isRequired,
};
