import axios from "axios";
import { createContext, useContext, useMemo, useReducer } from "react";
import { GROUP_DICT, GROUP_LIST, MAX_GROUPS } from "../constants/Constants";

// Create the authentication context
const TourContext = createContext();

// Define the possible actions for the authReducer
const ACTIONS = {
  addNewGroup: "addNewGroup",
  removeGroup: "removeGroup",
  setRayonYear: "setRayonYear"
};

// Reducer function to handle authentication state changes
const tourReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.addNewGroup:
      if (state.numOfGroups < MAX_GROUPS) {
        const newGroup = GROUP_LIST[state.numOfGroups];
        if (state.numOfGroups === 0)
          return {
            ...state,
            visits: Object.assign({}, state.visits, {
              [newGroup]: { arr: [], date: new Date(), transport: "foot" },
            }),
            numOfGroups: state.numOfGroups + 1,
          };
        else
          return {
            ...state,
            visits: Object.assign({}, state.visits, {
              [newGroup]: {
                arr: [],
                date: state.visits["A"].date,
                transport: "foot",
              },
            }),
            numOfGroups: state.numOfGroups + 1,
          };
      }
      return state;
    case ACTIONS.removeGroup:
      if (state.numOfGroups === GROUP_DICT[action.payload] + 1) {
        delete state.visits[action.payload];
        return {
          ...state,
          visits: state.visits,
          numOfGroups: state.numOfGroups - 1,
        };
      } else {
        const updatedVisits = { ...state.visits };

        for (let i = GROUP_DICT[action.payload]; i < state.numOfGroups - 1; i++) {
            const currentGroup = GROUP_LIST[i];
            const nextGroup = GROUP_LIST[i + 1];
        
            updatedVisits[currentGroup] = state.visits[nextGroup];
        }
        
        delete updatedVisits[GROUP_LIST[state.numOfGroups - 1]];

        return {
          ...state,
          visits: updatedVisits,
          numOfGroups: state.numOfGroups - 1,
        };
      }
    
      case ACTIONS.setRayonYear:
        localStorage.setItem('rayon', action.payload.rayon.toString())
        localStorage.setItem('year', action.payload.year.toString())
        return { ...state, rayon: action.payload.rayon, year: action.payload.year }

    default:
      console.error(
        `You passed an action.type: ${action.type} which doesn't exist`
      );
  }
};

const initialData = {
  visits: { Z: [] },
  numOfGroups: 0,
  rayon: localStorage.getItem('rayon') ? parseInt(localStorage.getItem('rayon')) : 1,
  year: localStorage.getItem('year') ? parseInt(localStorage.getItem('year')) : new Date().getFullYear(),
};

const TourProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tourReducer, initialData);

  const addNewGroup = () => {
    dispatch({ type: ACTIONS.addNewGroup, payload: null });
  };

  const removeGroup = (group) => {
    dispatch({ type: ACTIONS.removeGroup, payload: group });
  };

  const setRayonYear = (year, rayon) => {
    dispatch({ type: ACTIONS.setRayonYear, payload: {year: year, rayon: rayon}});
  }

  // Memoized value of the tour context
  const contextValue = useMemo(
    () => ({
      ...state,
      addNewGroup,
      removeGroup,
      setRayonYear,
    }),
    [state]
  );

  return (
    <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
  );
};

// Custom hook to easily access the authentication context
export const useTour = () => {
  return useContext(TourContext);
};

export default TourProvider;
