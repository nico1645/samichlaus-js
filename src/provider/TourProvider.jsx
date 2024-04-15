import { createContext, useContext, useMemo, useReducer } from "react";
import {
  GROUP_DICT,
  GROUP_LIST,
  MAX_GROUPS,
  route_comparator,
  parseDate,
  route_comparator_address,
} from "../constants/Constants";
import {
  createRoute,
  deleteCustomer,
  deleteRoute,
  putTour,
  updateManyCustomers,
  updateManyRoutes,
  updateRoute,
} from "../utils/utils";

// Create the authentication context
const TourContext = createContext();

// Define the possible actions for the authReducer
const ACTIONS = {
  addNewGroup: "addNewGroup",
  removeGroup: "removeGroup",
  setRayonYear: "setRayonYear",
  moveItem: "moveItem",
  setNewTour: "setNewTour",
  setGroupStartTime: "setGroupStartTime",
  setTourDate: "setTourDate",
  reverseGroup: "reverseGroup",
  setSamichlausGroupName: "setSamichlausGroupName",
  removeCustomer: "removeCustomer",
};

// Reducer function to handle authentication state changes
const tourReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.addNewGroup:
      if (state.numOfGroups < MAX_GROUPS) {
        const newGroup = GROUP_LIST[state.numOfGroups];
        if (state.numOfGroups === 0) {
          createRoute(
            () => {},
            () => {},
            {
              customerStart: "00:00:00",
              customerEnd: "00:00:00",
              transport: "foot",
              samichlaus: "",
              ruprecht: "",
              schmutzli: "",
              engel1: "",
              engel2: "",
              group: newGroup,
              tourId: state.tourId,
            }
          );
          return {
            ...state,
            tour: Object.assign({}, state.tour, {
              [newGroup]: {
                customers: [],
                customerStart: "00:00:00",
                customerEnd: "00:00:00",
                transport: "foot",
              },
            }),
            numOfGroups: state.numOfGroups + 1,
          };
        } else {
          createRoute(
            () => {},
            () => {},
            {
              customerStart: state.tour["A"].customerStart,
              customerEnd: state.tour["A"].customerStart,
              transport: "foot",
              samichlaus: "",
              ruprecht: "",
              schmutzli: "",
              engel1: "",
              engel2: "",
              group: newGroup,
              tourId: state.tourId,
            }
          );
          return {
            ...state,
            tour: Object.assign({}, state.tour, {
              [newGroup]: {
                customers: [],
                customerStart: state.tour["A"].customerStart,
                customerEnd: state.tour["A"].customerStart,
                transport: "foot",
              },
            }),
            numOfGroups: state.numOfGroups + 1,
          };
        }
      }
      return state;
    case ACTIONS.removeGroup:
      const customerUpdateData = [];
      const routeId = state.tour[action.payload].routeId;
      if (state.numOfGroups === GROUP_DICT[action.payload] + 1) {
        const updatedTour = { ...state.tour };
        updatedTour[action.payload].customers.forEach((customer, index) => {
          updatedTour["Z"].customers.push(customer);
          customerUpdateData.push({
            customerId: customer.customerId,
            routeId: updatedTour["Z"].routeId,
          });
        });
        updateManyCustomers(
          () => {
            deleteRoute(
              () => {},
              () => {},
              routeId
            );
          },
          () => {},
          customerUpdateData
        );
        delete updatedTour[action.payload];
        return {
          ...state,
          tour: updatedTour,
          numOfGroups: state.numOfGroups - 1,
        };
      } else {
        const updatedTour = { ...state.tour };
        const updateRouteData = [];
        updatedTour[action.payload].customers.forEach((customer, index) => {
          updatedTour["Z"].customers.push(customer);
          customerUpdateData.push({
            customerId: customer.customerId,
            routeId: updatedTour["Z"].routeId,
          });
        });
        for (
          let i = GROUP_DICT[action.payload];
          i < state.numOfGroups - 1;
          i++
        ) {
          const currentGroup = GROUP_LIST[i];
          const nextGroup = GROUP_LIST[i + 1];

          updateRouteData.push({
            routeId: updatedTour[nextGroup].routeId,
            group: currentGroup,
          });

          updatedTour[currentGroup] = state.tour[nextGroup];
        }

        updateManyRoutes(
          () => {
            updateManyCustomers(
              () => {
                deleteRoute(
                  () => {},
                  () => {},
                  routeId
                );
              },
              () => {},
              customerUpdateData
            );
          },
          () => {},
          updateRouteData
        );

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
        date: tour.date,
        tourId: tour.tourId,
      };

      tour.routes.map((route) => {
        const customers = [];
        route.customers.forEach((c, i) => {
          customers.push(c);
        });
        if (route.group === "Z") customers.sort(route_comparator_address);
        else customers.sort(route_comparator);
        newState.tour = Object.assign({}, newState.tour, {
          [route.group]: {
            routeId: route.routeId,
            customers: customers,
            customerStart: route.customerStart,
            customerEnd: route.customerEnd,
            transport: route.transport,
            samichlaus: route.samichlaus,
            ruprecht: route.ruprecht,
            schmutzli: route.schmutzli,
            engel1: route.engel1,
            engel2: route.engel2,
          },
        });
      });

      return {
        ...state,
        rayon: newState.rayon,
        year: newState.year,
        tour: newState.tour,
        numOfGroups: newState.numOfGroups,
        date: newState.date,
        tourId: newState.tourId,
      };

    case ACTIONS.moveItem:
      const fromGroup = action.payload.fromGroup;
      const toGroup = action.payload.toGroup;
      const fromIndex = action.payload.fromIndex;
      const toIndex = action.payload.toIndex;
      const newTour = { ...state.tour };

      if (fromGroup !== "Z" && fromGroup !== toGroup) {
        newTour[toGroup].customers.push(
          state.tour[fromGroup].customers[fromIndex]
        );
        newTour[fromGroup].customers.splice(fromIndex, 1);
      } else if (fromGroup === "Z" || fromIndex !== toIndex) {
        const tmp = newTour[fromGroup].customers.splice(fromIndex, 1);
        if (newTour[toGroup].customers.length - 1 === toIndex)
          newTour[toGroup].customers.push(tmp[0]);
        else newTour[toGroup].customers.splice(toIndex, 0, tmp[0]);
      } else {
        return state;
      }
      if (toGroup === "Z")
        newTour[toGroup].customers.sort(route_comparator_address);

      return { ...state, tour: newTour };

    case ACTIONS.setGroupStartTime:
      state.tour[action.payload.group].customerStart = action.payload.date;
      return { ...state, tour: { ...state.tour } };

    case ACTIONS.setTourDate:
      putTour(
        () => {},
        () => {},
        { date: action.payload.date },
        state.tourId
      );
      return { ...state, date: action.payload.date };

    case ACTIONS.reverseGroup:
      state.tour[action.payload.group].customers = [
        ...state.tour[action.payload.group].customers.reverse(),
      ];
      return { ...state, tour: { ...state.tour } };

    case ACTIONS.setSamichlausGroupName:
      for (let i = 0; i < state.numOfGroups; i++) {
        state.tour[GROUP_LIST[i]].samichlaus =
          action.payload[GROUP_LIST[i] + "samichlaus"];
        state.tour[GROUP_LIST[i]].ruprecht =
          action.payload[GROUP_LIST[i] + "ruprecht"];
        state.tour[GROUP_LIST[i]].schmutzli =
          action.payload[GROUP_LIST[i] + "schmutzli"];
        state.tour[GROUP_LIST[i]].engel1 =
          action.payload[GROUP_LIST[i] + "engel1"];
        state.tour[GROUP_LIST[i]].engel2 =
          action.payload[GROUP_LIST[i] + "engel2"];
      }
      return { ...state, tour: { ...state.tour } };

    case ACTIONS.removeCustomer:
      deleteCustomer(
        () => {},
        () => {},
        action.payload.uuid
      );
      state.tour["Z"].customers.splice(action.payload.index, 1);
      return { ...state, tour: { ...state.tour } };

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
  date: new Date().toLocaleDateString(),
  tourId: "",
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
    dispatch({ type: ACTIONS.reverseGroup, payload: { group: group } });
  };

  const setNewTour = (tour) => {
    dispatch({ type: ACTIONS.setNewTour, payload: { tour: tour } });
  };

  const setGroupStartTime = (group, date) => {
    dispatch({
      type: ACTIONS.setGroupStartTime,
      payload: { group: group, date: date },
    });
  };

  const setTourDate = (date) => {
    dispatch({ type: ACTIONS.setTourDate, payload: { date: date } });
  };

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
    dispatch({ type: ACTIONS.setSamichlausGroupName, payload: values });
  };

  const removeCustomer = (index, uuid) => {
    dispatch({
      type: ACTIONS.removeCustomer,
      payload: { index: index, uuid: uuid },
    });
  };

  // Memoized value of the tour context
  const contextValue = useMemo(
    () => ({
      ...state,
      addNewGroup,
      removeGroup,
      setRayonYear,
      moveItem,
      setNewTour,
      setGroupStartTime,
      reverseGroup,
      setSamichlausGroupName,
      setTourDate,
      removeCustomer,
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
