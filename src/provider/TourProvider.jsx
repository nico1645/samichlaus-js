import { createContext, useContext, useMemo, useReducer } from "react";
import {
  GROUP_DICT,
  GROUP_LIST,
  MAX_GROUPS,
  route_comparator,
  route_comparator_address,
  addMinutesToTime,
  route_comparator_group,
  getAbsMinuteDifference,
  getVisitTime,
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

const _moveItem = (fromGroup, toGroup, fromIndex, toIndex, oldTour, newTour) => {
    const customer = { ...oldTour[fromGroup].customers[fromIndex] };
    const updateCustomers = [];
    const updateRoutes = [];
    if (fromGroup === "Z") {
      const tmpStartTime = toIndex === newTour[toGroup].customers.length ? newTour[toGroup].customerEnd : newTour[toGroup].customers[toIndex].visitTime;
      customer.visitTime = tmpStartTime;
      const interval = getVisitTime(oldTour[fromGroup].customers[fromIndex].children, oldTour[fromGroup].customers[fromIndex].seniors);
      newTour[fromGroup].customers.splice(fromIndex, 1);
      newTour[toGroup].customers.splice(toIndex, 0, customer);
      for (let i = toIndex+1; i < newTour[toGroup].customers.length; i++) {
        newTour[toGroup].customers[i].visitTime = addMinutesToTime(newTour[toGroup].customers[i].visitTime, interval);
        updateCustomers.push({
            customerId: newTour[toGroup].customers[i].customerId,
            visitTime: newTour[toGroup].customers[i].visitTime,
        });
      }
      newTour[toGroup].customerEnd = addMinutesToTime(newTour[toGroup].customerEnd, interval);
      updateRoutes.push({
        routeId: newTour[toGroup].routeId,
        customerEnd: newTour[toGroup].customerEnd,
      });
    } else if (toGroup === "Z") {
      const interval = fromIndex === newTour[fromGroup].customers.length - 1 ? getAbsMinuteDifference(customer.visitTime, newTour[fromGroup].customerEnd) : getAbsMinuteDifference(customer.visitTime, newTour[fromGroup].customers[fromIndex + 1].visitTime);
      newTour[fromGroup].customers.splice(fromIndex, 1);
      newTour[toGroup].customers.push(customer);
      for (let i = fromIndex; i < newTour[fromGroup].customers.length; i++) {
        newTour[fromGroup].customers[i].visitTime = addMinutesToTime(newTour[fromGroup].customers[i].visitTime, -interval);
        updateCustomers.push({
            customerId: newTour[fromGroup].customers[i].customerId,
            visitTime: newTour[fromGroup].customers[i].visitTime,
        });
      }
      newTour[fromGroup].customerEnd = addMinutesToTime(newTour[fromGroup].customerEnd, -interval);
      updateRoutes.push({
        routeId: newTour[fromGroup].routeId,
        customerEnd: newTour[fromGroup].customerEnd,
      });
    }

    if (toGroup === "Z")
      newTour[toGroup].customers.sort(route_comparator_address);

    updateCustomers.push({
          customerId: customer.customerId,
          routeId: newTour[toGroup].routeId,
          visitTime: customer.visitTime,
      });

    if (updateRoutes.length > 0)
        updateManyRoutes(
            () => {},
            () => {},
            updateRoutes
        );

    updateManyCustomers(
      () => {},
      () => {},
      updateCustomers
    );

    return newTour;
}

const _setGroupStartTime = (tour, group, startTime) => {
  const updateCustomerData = [];
  const absMinuteDiff = getAbsMinuteDifference(startTime, tour[group].customerStart);
  const newCustomerEnd = addMinutesToTime(tour[group].customerEnd, absMinuteDiff);
  tour[group].customerStart = startTime;
  tour[group].customerEnd = newCustomerEnd;
  updateRoute(() => {}, () => {}, {
    routeId: tour[group].routeId,
    customerStart: startTime,
    customerEnd: newCustomerEnd,
  });
  tour[group].customers.forEach((c) => {
    const newTime = addMinutesToTime(c.visitTime, absMinuteDiff);
    c.visitTime = newTime;
    updateCustomerData.push({
            customerId: c.customerId,
            visitTime: newTime,
    });
  })
  updateManyCustomers(
    () => {},
    () => {},
    updateCustomerData
  );
  return tour;
}

const _reverseGroup = (group, tour) => {
    const updateCustomerData = [];
    var currentTime = tour[group].customerStart;
    var time;
    for (let i = tour[group].customers.length - 1; i >= 0 ; i--) {
        if (i === tour[group].customers.length - 1) {
            time = addMinutesToTime(currentTime, getAbsMinuteDifference(tour[group].customers[i].visitTime, tour[group].customerEnd));
            updateCustomerData.push({
                customerId: tour[group].customers[i].customerId,
                visitTime: time,
            });
        } else {
            time = addMinutesToTime(currentTime, getAbsMinuteDifference(tour[group].customers[i+1].visitTime, tour[group].customers[i].visitTime));
            updateCustomerData.push({
                customerId: tour[group].customers[i].customerId,
                visitTime: time,
            });
        }
        currentTime = time;
    }

    tour[group].customers = [
      ...tour[group].customers.reverse(),
    ];

    for (let i = tour[group].customers.length - 1; i >= 0 ; i--) {
        tour[group].customers[i].visitTime = updateCustomerData[i].visitTime;
    }

    updateManyCustomers(
      () => {},
      () => {},
      updateCustomerData
    );
    return tour;
}

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
      if (action.payload.fromGroup === action.payload.toGroup
                && action.payload.fromIndex === action.payload.toIndex || action.payload.toGroup === "")
        return state;

      return { ...state, 
                tour: _moveItem(
                action.payload.fromGroup, 
                action.payload.toGroup, 
                action.payload.fromIndex, 
                action.payload.toIndex, 
                state.tour, 
                { ...state.tour }) 
            };

    case ACTIONS.setGroupStartTime:
      
      return { ...state, tour: { ..._setGroupStartTime(state.tour, action.payload.group, action.payload.date) } };

    case ACTIONS.setTourDate:
      putTour(
        () => {},
        () => {},
        { date: action.payload.date },
        state.tourId
      );
      return { ...state, date: action.payload.date };

    case ACTIONS.reverseGroup:
      return { ...state, tour: { ..._reverseGroup(action.payload.group, state.tour) } };

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
      //console.log("Index:" + action.payload.index +" Group:" + action.payload.group + " Value: " + addValue);
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
          //console.log(i + " " + state.tour[action.payload.group].customers.length);
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
