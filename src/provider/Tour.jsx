import { useContext } from 'react';
import { TourContext } from './TourProvider.jsx'; // Adjust the import path as necessary

const useTour = () => {
  return useContext(TourContext);
};

export default useTour;
