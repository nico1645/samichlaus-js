import { createContext, useContext, useMemo, useReducer } from "react";
import {
  GROUP_DICT,
  GROUP_LIST,
  MAX_GROUPS,
  route_comparator,
  route_comparator_address,
  addMinutesToTime,
  route_comparator_group,
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
  addTime: "addTime",
};

// Reducer function to handle authentication state changes
const tourReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.addNewGroup:
          return {
            ...state,
            tour: Object.assign({}, state.tour, {
              [action.payload.route.group]: {
                customers: action.payload.route.customers,
                customerStart: action.payload.route.customerStart,
                customerEnd: action.payload.route.customerStart,
                transport: action.payload.route.transport,
                routeId: action.payload.route.routeId,
                samichlaus: action.payload.route.samichlaus,
                ruprecht: action.payload.route.ruprecht,
                schmutzli: action.payload.route.schmutzli,
                engel1: action.payload.route.engel1,
                engel2: action.payload.route.engel2,
              },
            }),
            numOfGroups: state.numOfGroups + 1,
          };
    case ACTIONS.removeGroup:
      const customerUpdateData = [];
      const routeId = state.tour[action.payload].routeId;
      if (state.numOfGroups === GROUP_DICT[action.payload] + 1) {
        const updatedTour = { ...state.tour };
        updatedTour[action.payload].customers.forEach((customer) => {
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
        updatedTour[action.payload].customers.forEach((customer) => {
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
      console.log(tour);
      const newState = {
        tour: {},
        numOfGroups: tour.routes.length - 1,
        year: tour.year,
        rayon: tour.rayon,
        date: tour.date,
        tourId: tour.tourId,
      };

      tour.routes.sort(route_comparator_group);

      tour.routes.map((route) => {
        const customers = [];
        route.customers.forEach((c) => {
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
      updateRoute(() => {}, () => {}, {
        routeId: state.tour[action.payload.group].routeId,
        customerStart: action.payload.date,
      });
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
      const updateRouteNameDate = [];
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

        updateRouteNameDate.push({
          routeId: state.tour[GROUP_LIST[i]].routeId,
          samichlaus: state.tour[GROUP_LIST[i]].samichlaus,
          ruprecht: state.tour[GROUP_LIST[i]].ruprecht,
          schmutzli: state.tour[GROUP_LIST[i]].schmutzli,
          engel1: state.tour[GROUP_LIST[i]].engel1,
          engel2: state.tour[GROUP_LIST[i]].engel2,
          customerStart: state.tour[GROUP_LIST[i]].customerStart,
          customerEnd: state.tour[GROUP_LIST[i]].customerEnd,
        });
      }
      updateManyRoutes(
        () => {},
        () => {},
        updateRouteNameDate
      );

      return { ...state, tour: { ...state.tour } };

    case ACTIONS.removeCustomer:
      deleteCustomer(
        () => {},
        () => {},
        action.payload.uuid
      );
      state.tour["Z"].customers.splice(action.payload.index, 1);
      return { ...state, tour: { ...state.tour } };

    case ACTIONS.addTime:
      const addValue = action.payload.value;
      console.log("Index:" + action.payload.index +" Group:" + action.payload.group + " Value: " + addValue);
      if (action.payload.index === -1) {
        state.tour[action.payload.group].customerEnd = addMinutesToTime(
          state.tour[action.payload.group].customerEnd,
          addValue
        );
      } else {
        for (
          let i = action.payload.index;
          i < state.tour[action.payload.group].customers.length;
          i++
        ) {
          console.log(i + " " + state.tour[action.payload.group].customers.length);
          state.tour[action.payload.group].customers[i].visitTime = addMinutesToTime(
            state.tour[action.payload.group].customers[i].visitTime,
            addValue
          );
        }
        state.tour[action.payload.group].customerEnd = addMinutesToTime(
          state.tour[action.payload.group].customerEnd,
          addValue
        );
      }
      return { ...state, tour: { ...state.tour }}


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

  const addNewGroup = (route) => {
    dispatch({ type: ACTIONS.addNewGroup, payload: { route: route } });
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

  const addTime = (group, index, value) => {
    dispatch({
      type: ACTIONS.addTime,
      payload: { group: group, index: index, value: value },
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
      addTime,
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
