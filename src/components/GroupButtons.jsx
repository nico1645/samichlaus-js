import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import {
  COLOR_DICT,
  GROUP_DICT,
  GROUP_LIST,
  MAX_GROUPS,
} from "../constants/Constants";
import { useTour } from "../provider/TourProvider";

export default function GroupButtons({ group, setGroup }) {
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState([]);
  const { visits, addNewGroup, removeGroup, numOfGroups } = useTour();

  useEffect(() => {
    setIsDeleteGroupOpen(new Array(numOfGroups).fill(false));
  }, [numOfGroups]);

  const handleDeleteGroupOpenMenu = (e, val) => {
    e.preventDefault();
    const arr = new Array(isDeleteGroupOpen.length).fill(false);
    arr[GROUP_DICT[val]] = true;
    setIsDeleteGroupOpen(arr);
  };

  const handleDeleteGroup = (val) => {
    if (group === val && numOfGroups - 1 === GROUP_DICT[val])
      if (numOfGroups === 1) setGroup("");
      else setGroup(GROUP_LIST[numOfGroups - 2]);
    removeGroup(val);
    setIsDeleteGroupOpen(new Array(isDeleteGroupOpen.length).fill(false));
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-center mt-2">
      {Object.keys(visits).map((val, i) => {
        const color = COLOR_DICT[val];
        if (val !== "Z")
          return (
            <div className="flex items-center" key={val}>
              <span
                onClick={() => setGroup(val)}
                onContextMenu={(e) => handleDeleteGroupOpenMenu(e, val)}
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
                    className="px-4 p-2 rounded-lg bg-gray-200 hover:bg-gray-300  text-black"
                    onClick={() =>
                      setIsDeleteGroupOpen(
                        new Array(isDeleteGroupOpen.length).fill(false)
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
      {numOfGroups < MAX_GROUPS + 1 ? (
        <span
          onClick={addNewGroup}
          className=" h-10 w-10 text-xl rounded-lg border-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 hover:dark:bg-gray-600 p-1 text-center hover:cursor-pointer"
        >
          +
        </span>
      ) : null}
    </div>
  );
}
