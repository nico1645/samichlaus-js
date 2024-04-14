import axios from "axios";
import { createContext, useContext, useMemo, useReducer } from "react";
import { GROUP_DICT, GROUP_LIST, MAX_GROUPS, route_comparator, parseDate } from "../constants/Constants";

// Create the authentication context
const TourContext = createContext();

// Define the possible actions for the authReducer
const ACTIONS = {
  addNewGroup: "addNewGroup",
  removeGroup: "removeGroup",
  setRayonYear: "setRayonYear",
  moveItem: "moveItem",
  setNewTour: "setNewTour",
  setDateTour: "setGroupStartDate",
  reverseGroup: "reverseGroup",
  setSamichlausGroupName: "setSamichlausGroupName"
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
            tour: Object.assign({}, state.tour, {
              [newGroup]: {
                customers: [],
                customerStart: "00:00:00",
                transport: "foot",
              },
            }),
            numOfGroups: state.numOfGroups + 1,
          };
        else
          return {
            ...state,
            tour: Object.assign({}, state.tour, {
              [newGroup]: {
                customers: [],
                customerStart: state.tour["A"].customerStart,
                transport: "foot",
              },
            }),
            numOfGroups: state.numOfGroups + 1,
          };
      }
      return state;
    case ACTIONS.removeGroup:
      if (state.numOfGroups === GROUP_DICT[action.payload] + 1) {
        const updatedTour = { ...state.tour };
        updatedTour["Z"].customers = [...updatedTour["Z"].customers, ...updatedTour[action.payload].customers];
        delete updatedTour[action.payload];
        return {
          ...state,
          tour: updatedTour,
          numOfGroups: state.numOfGroups - 1,
        };
      } else {
        const updatedTour = { ...state.tour };
        updatedTour["Z"].customers = [...updatedTour["Z"].customers, ...updatedTour[action.payload].customers];

        for (
          let i = GROUP_DICT[action.payload];
          i < state.numOfGroups - 1;
          i++
        ) {
          const currentGroup = GROUP_LIST[i];
          const nextGroup = GROUP_LIST[i + 1];

          updatedTour[currentGroup] = state.tour[nextGroup];
        }

        delete updatedTour[GROUP_LIST[state.numOfGroups - 1]];

        return {
          ...state,
          tour: updatedTour,
          numOfGroups: state.numOfGroups - 1,
        };
      }

    case ACTIONS.setRayonYear:
      localStorage.setItem("rayon", action.payload.rayon.toString());
      localStorage.setItem("year", action.payload.year.toString());
      return {
        ...state,
        rayon: action.payload.rayon,
        year: action.payload.year,
      };

    case ACTIONS.setNewTour:
      const tour = action.payload.tour;
      localStorage.setItem("rayon", tour.rayon.toString());
      localStorage.setItem("year", tour.year.toString());
      const newState = {
        tour: {},
        numOfGroups: tour.routes.length - 1,
        year: tour.year,
        rayon: tour.rayon,
        date: tour.date
      };

      tour.routes.map((route) => {
        const customers = [];
        route.customers.forEach((c, i) => {
          customers.push(c);
        })
        customers.sort(route_comparator);
        newState.tour = Object.assign({}, newState.tour, {
          [route.group]: {
            customers: customers,
            customerStart: route.customerStart,
            transport: route.transport,
            samichlaus: route.samichlaus,
            ruprecht: route.ruprecht,
            schmutzli: route.schmutzli,
            engel1: route.engel1,
            engel2: route.engel2,
          },
        });
      });
      console.log(newState.tour)

      return { ...state, rayon: newState.rayon, year: newState.year, tour: newState.tour, numOfGroups: newState.numOfGroups, date: newState.date };

    case ACTIONS.moveItem:
      const fromGroup = action.payload.fromGroup;
      const toGroup = action.payload.toGroup;
      const fromIndex = action.payload.fromIndex;
      const toIndex = action.payload.toIndex;
      const newTour = { ...state.tour };

      if (fromGroup !== "Z" && fromGroup !== toGroup) {
          newTour[toGroup].customers.push(state.tour[fromGroup].customers[fromIndex]);
          newTour[fromGroup].customers.splice(fromIndex, 1);
      } else if (fromGroup === "Z" || fromIndex !== toIndex) {
          const tmp = newTour[fromGroup].customers.splice(fromIndex, 1);
          if (newTour[toGroup].customers.length -1 === toIndex)
            newTour[toGroup].customers.push(tmp[0]);
          else
            newTour[toGroup].customers.splice(toIndex, 0, tmp[0]);
      } else {
        return state;
      }

      return { ...state, tour: newTour };
    
    case ACTIONS.setGroupStartDate:
      state.tour[action.payload.group].customerStart = action.payload.date;
      return {...state, tour: {...state.tour}};

    case ACTIONS.reverseGroup:
      state.tour[action.payload.group].customers = [...state.tour[action.payload.group].customers.reverse()];
      return { ...state, tour: { ...state.tour }};
    
    case ACTIONS.setSamichlausGroupName:
      for (let i = 0; i < state.numOfGroups; i++) {
        state.tour[GROUP_LIST[i]].samichlaus = action.payload[GROUP_LIST[i]+"samichlaus"];
        state.tour[GROUP_LIST[i]].ruprecht = action.payload[GROUP_LIST[i]+"ruprecht"];
        state.tour[GROUP_LIST[i]].schmutzli = action.payload[GROUP_LIST[i]+"schmutzli"];
        state.tour[GROUP_LIST[i]].engel1 = action.payload[GROUP_LIST[i]+"engel1"];
        state.tour[GROUP_LIST[i]].engel2 = action.payload[GROUP_LIST[i]+"engel2"];
      }
      return {...state, tour: { ...state.tour }};

    default:
      console.error(
        `You passed an action.type: ${action.type} which doesn't exist`
      );
  }
};

const initialData = {
  tour: {},
  numOfGroups: 0,
  rayon: localStorage.getItem("rayon")
    ? parseInt(localStorage.getItem("rayon"))
    : 1,
  year: localStorage.getItem("year")
    ? parseInt(localStorage.getItem("year"))
    : new Date().getFullYear(),
  date: new Date().toLocaleDateString()
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
    dispatch({
      type: ACTIONS.setRayonYear,
      payload: { year: year, rayon: rayon },
    });
  };

  const reverseGroup = (group) => {
    dispatch({ type: ACTIONS.reverseGroup, payload: {group: group} })
  }

  const setNewTour = (tour) => {
    dispatch({ type: ACTIONS.setNewTour, payload: { tour: tour } });
  };

  const setGroupStartDate = (group, date) => {
    dispatch({type: ACTIONS.setGroupStartDate, payload: {group: group, date: date}})
  } 

  const moveItem = (fromIndex, toIndex, fromGroup, toGroup) => {
    dispatch({
      type: ACTIONS.moveItem,
      payload: {
        fromIndex: fromIndex,
        toIndex: toIndex,
        fromGroup: fromGroup,
        toGroup: toGroup,
      },
    });
  };

  const setSamichlausGroupName = (values) => {
    dispatch({ type: ACTIONS.setSamichlausGroupName, payload: values})

  }

  // Memoized value of the tour context
  const contextValue = useMemo(
    () => ({
      ...state,
      addNewGroup,
      removeGroup,
      setRayonYear,
      moveItem,
      setNewTour,
      setGroupStartDate,
      reverseGroup,
      setSamichlausGroupName,
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
