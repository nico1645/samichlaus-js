import { useContext } from "react";
import { TourContext } from "./TourProvider.jsx";

const useTour = () => {
  return useContext(TourContext);
};

export default useTour;
