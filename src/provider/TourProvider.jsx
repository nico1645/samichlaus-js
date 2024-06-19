import { createContext, useMemo, useReducer } from "react";
import {
  GROUP_DICT,
  GROUP_LIST,
  route_comparator,
  route_comparator_address,
  addMinutesToTime,
  route_comparator_group,
  getAbsMinuteDifference,
  getVisitTime,
  isTime1Earlier,
} from "../constants/Constants";
import {
  deleteCustomer,
  deleteRoute,
  putTour,
  updateManyCustomers,
  updateManyRoutes,
  updateRoute,
} from "../utils/utils";
import PropTypes from "prop-types";

// Create the authentication context
export const TourContext = createContext();

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
  updateTime: "updateTime",
  updateTransport: "updateTransport",
  addNewCustomer: "addNewCustomer",
  setError: "setError",
};

const _moveItem = (
  fromGroup,
  toGroup,
  fromIndex,
  toIndex,
  oldTour,
  newTour,
  errCallback,
) => {
  const customer = { ...oldTour[fromGroup].customers[fromIndex] };
  const updateCustomers = [];
  const updateRoutes = [];
  if (fromGroup === "Z" || (toGroup !== "Z" && fromGroup !== toGroup)) {
    const tmpStartTime =
      toIndex === newTour[toGroup].customers.length
        ? newTour[toGroup].customerEnd
        : newTour[toGroup].customers[toIndex].visitTime;
    customer.visitTime = tmpStartTime;
    const interval = getVisitTime(
      oldTour[fromGroup].customers[fromIndex].children,
      oldTour[fromGroup].customers[fromIndex].seniors,
    );
    newTour[fromGroup].customers.splice(fromIndex, 1);
    newTour[toGroup].customers.splice(toIndex, 0, customer);
    for (let i = toIndex + 1; i < newTour[toGroup].customers.length; i++) {
      newTour[toGroup].customers[i].visitTime = addMinutesToTime(
        newTour[toGroup].customers[i].visitTime,
        interval,
      );
      updateCustomers.push({
        customerId: newTour[toGroup].customers[i].customerId,
        visitTime: newTour[toGroup].customers[i].visitTime,
      });
    }
    newTour[toGroup].customerEnd = addMinutesToTime(
      newTour[toGroup].customerEnd,
      interval,
    );
    updateRoutes.push({
      routeId: newTour[toGroup].routeId,
      customerEnd: newTour[toGroup].customerEnd,
    });
  } else if (toGroup === "Z") {
    const interval =
      fromIndex === newTour[fromGroup].customers.length - 1
        ? getAbsMinuteDifference(
            customer.visitTime,
            newTour[fromGroup].customerEnd,
          )
        : getAbsMinuteDifference(
            customer.visitTime,
            newTour[fromGroup].customers[fromIndex + 1].visitTime,
          );
    newTour[fromGroup].customers.splice(fromIndex, 1);
    newTour[toGroup].customers.push(customer);
    for (let i = fromIndex; i < newTour[fromGroup].customers.length; i++) {
      newTour[fromGroup].customers[i].visitTime = addMinutesToTime(
        newTour[fromGroup].customers[i].visitTime,
        -interval,
      );
      updateCustomers.push({
        customerId: newTour[fromGroup].customers[i].customerId,
        visitTime: newTour[fromGroup].customers[i].visitTime,
      });
    }
    newTour[fromGroup].customerEnd = addMinutesToTime(
      newTour[fromGroup].customerEnd,
      -interval,
    );
    updateRoutes.push({
      routeId: newTour[fromGroup].routeId,
      customerEnd: newTour[fromGroup].customerEnd,
    });
  } else if (toGroup === fromGroup) {
    if (fromIndex < toIndex) {
      const newToIndex =
        toIndex === newTour[toGroup].customers.length ? toIndex - 1 : toIndex;
      const tmpStartTime =
        newToIndex + 1 >= newTour[toGroup].customers.length
          ? newTour[toGroup].customerEnd
          : newTour[toGroup].customers[toIndex + 1].visitTime;
      const interval =
        fromIndex === newTour[fromGroup].customers.length - 1
          ? getAbsMinuteDifference(
              customer.visitTime,
              newTour[fromGroup].customerEnd,
            )
          : getAbsMinuteDifference(
              customer.visitTime,
              newTour[fromGroup].customers[fromIndex + 1].visitTime,
            );
      newTour[fromGroup].customers.splice(fromIndex, 1);
      newTour[toGroup].customers.splice(toIndex, 0, customer);
      newTour[toGroup].customers[newToIndex].visitTime = addMinutesToTime(
        tmpStartTime,
        -interval,
      );
      for (let i = newToIndex - 1; i >= fromIndex; i--) {
        newTour[toGroup].customers[i].visitTime = addMinutesToTime(
          newTour[toGroup].customers[i].visitTime,
          -interval,
        );
        updateCustomers.push({
          customerId: newTour[toGroup].customers[i].customerId,
          visitTime: newTour[toGroup].customers[i].visitTime,
        });
      }
    } else {
      const tmpStartTime = newTour[toGroup].customers[toIndex].visitTime;
      const interval =
        fromIndex === newTour[fromGroup].customers.length - 1
          ? getAbsMinuteDifference(
              customer.visitTime,
              newTour[fromGroup].customerEnd,
            )
          : getAbsMinuteDifference(
              customer.visitTime,
              newTour[fromGroup].customers[fromIndex + 1].visitTime,
            );
      newTour[fromGroup].customers.splice(fromIndex, 1);
      newTour[toGroup].customers.splice(toIndex, 0, customer);
      newTour[toGroup].customers[toIndex].visitTime = tmpStartTime;
      for (let i = toIndex + 1; i <= fromIndex; i++) {
        newTour[toGroup].customers[i].visitTime = addMinutesToTime(
          newTour[toGroup].customers[i].visitTime,
          interval,
        );
        updateCustomers.push({
          customerId: newTour[toGroup].customers[i].customerId,
          visitTime: newTour[toGroup].customers[i].visitTime,
        });
      }
    }
  } else {
    return oldTour;
  }

  if (toGroup === "Z")
    newTour[toGroup].customers.sort(route_comparator_address);

  updateCustomers.push({
    customerId: customer.customerId,
    routeId: newTour[toGroup].routeId,
    visitTime: customer.visitTime,
  });

  if (updateRoutes.length > 0)
    updateManyRoutes(() => {}, errCallback, updateRoutes);

  updateManyCustomers(() => {}, errCallback, updateCustomers);

  return newTour;
};

const _setGroupStartTime = (tour, group, startTime, errCallback) => {
  const updateCustomerData = [];
  const tmp = getAbsMinuteDifference(startTime, tour[group].customerStart);
  const absMinuteDiff = isTime1Earlier(startTime, tour[group].customerStart)
    ? -tmp
    : tmp;
  const newCustomerEnd = addMinutesToTime(
    tour[group].customerEnd,
    absMinuteDiff,
  );
  tour[group].customerStart = startTime;
  tour[group].customerEnd = newCustomerEnd;
  updateRoute(() => {}, errCallback, {
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
  });
  updateManyCustomers(() => {}, errCallback, updateCustomerData);
  return tour;
};

const _reverseGroup = (group, tour, errCallback) => {
  const updateCustomerData = [];
  var currentTime = tour[group].customerStart;
  var time;
  for (let i = tour[group].customers.length - 1; i >= 0; i--) {
    if (i === tour[group].customers.length - 1) {
      time = addMinutesToTime(
        currentTime,
        getAbsMinuteDifference(
          tour[group].customers[i].visitTime,
          tour[group].customerEnd,
        ),
      );
      updateCustomerData.push({
        customerId: tour[group].customers[i].customerId,
        visitTime: time,
      });
    } else {
      time = addMinutesToTime(
        currentTime,
        getAbsMinuteDifference(
          tour[group].customers[i + 1].visitTime,
          tour[group].customers[i].visitTime,
        ),
      );
      updateCustomerData.push({
        customerId: tour[group].customers[i].customerId,
        visitTime: time,
      });
    }
    currentTime = time;
  }

  tour[group].customers = [...tour[group].customers.reverse()];

  for (let i = tour[group].customers.length - 1; i >= 0; i--) {
    tour[group].customers[i].visitTime = updateCustomerData[i].visitTime;
  }

  updateManyCustomers(() => {}, errCallback, updateCustomerData);
  return tour;
};

const _removeGroup = (state, routeId, group, errCallback) => {
  const customerUpdateData = [];
  if (state.numOfGroups === GROUP_DICT[group] + 1) {
    const updatedTour = { ...state.tour };
    updatedTour[group].customers.forEach((customer) => {
      updatedTour["Z"].customers.push(customer);
      customerUpdateData.push({
        customerId: customer.customerId,
        routeId: updatedTour["Z"].routeId,
      });
    });
    updatedTour["Z"].customers.sort(route_comparator_address);
    updateManyCustomers(
      () => {
        deleteRoute(() => {}, errCallback, routeId);
      },
      errCallback,
      customerUpdateData,
    );
    delete updatedTour[group];
    return updatedTour;
  } else {
    const updatedTour = { ...state.tour };
    const updateRouteData = [];
    updatedTour[group].customers.forEach((customer) => {
      updatedTour["Z"].customers.push(customer);
      customerUpdateData.push({
        customerId: customer.customerId,
        routeId: updatedTour["Z"].routeId,
      });
    });
    updatedTour["Z"].customers.sort(route_comparator_address);
    for (let i = GROUP_DICT[group]; i < state.numOfGroups - 1; i++) {
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
            deleteRoute(() => {}, errCallback, routeId);
          },
          errCallback,
          customerUpdateData,
        );
      },
      errCallback,
      updateRouteData,
    );

    delete updatedTour[GROUP_LIST[state.numOfGroups - 1]];

    return updatedTour;
  }
};

const _setSamichlausGroupName = (state, obj, errCallback) => {
  const updateRouteNameDate = [];
  for (let i = 0; i < state.numOfGroups; i++) {
    state.tour[GROUP_LIST[i]].samichlaus = obj[GROUP_LIST[i] + "samichlaus"];
    state.tour[GROUP_LIST[i]].ruprecht = obj[GROUP_LIST[i] + "ruprecht"];
    state.tour[GROUP_LIST[i]].schmutzli = obj[GROUP_LIST[i] + "schmutzli"];
    state.tour[GROUP_LIST[i]].engel1 = obj[GROUP_LIST[i] + "engel1"];
    state.tour[GROUP_LIST[i]].engel2 = obj[GROUP_LIST[i] + "engel2"];

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
  updateManyRoutes(() => {}, errCallback, updateRouteNameDate);
  return state.tour;
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
      return {
        ...state,
        tour: _removeGroup(
          state,
          state.tour[action.payload].routeId,
          action.payload,
          action.payload.errCallback,
        ),
        numOfGroups: state.numOfGroups - 1,
      };

    case ACTIONS.setRayonYear:
      localStorage.setItem("rayon", action.payload.rayon.toString());
      localStorage.setItem("year", action.payload.year.toString());
      return {
        ...state,
        rayon: action.payload.rayon,
        year: action.payload.year,
      };

    case ACTIONS.setNewTour:
      localStorage.setItem("rayon", action.payload.tour.rayon.toString());
      localStorage.setItem("year", action.payload.tour.year.toString());
      state.tour = {};
      state.numOfGroups = action.payload.tour.routes.length - 1;
      state.year = action.payload.tour.year;
      state.rayon = action.payload.tour.rayon;
      state.date = action.payload.tour.date;
      state.tourId = action.payload.tour.tourId;

      action.payload.tour.routes.sort(route_comparator_group);

      action.payload.tour.routes.map((route) => {
        const customers = [];
        route.customers.forEach((c) => {
          customers.push(c);
        });
        if (route.group === "Z") customers.sort(route_comparator_address);
        else customers.sort(route_comparator);
        state.tour = Object.assign({}, state.tour, {
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
      };

    case ACTIONS.moveItem:
      if (
        (action.payload.fromGroup === action.payload.toGroup &&
          action.payload.fromIndex === action.payload.toIndex) ||
        action.payload.toGroup === "" ||
        (action.payload.fromGroup === action.payload.toGroup &&
          action.payload.fromIndex + 1 === action.payload.toIndex &&
          action.payload.toIndex ===
            state.tour[action.payload.fromGroup].customers.length)
      )
        return state;

      return {
        ...state,
        tour: _moveItem(
          action.payload.fromGroup,
          action.payload.toGroup,
          action.payload.fromIndex,
          action.payload.toIndex,
          state.tour,
          { ...state.tour },
          action.payload.errCallback,
        ),
      };

    case ACTIONS.setGroupStartTime:
      return {
        ...state,
        tour: {
          ..._setGroupStartTime(
            state.tour,
            action.payload.group,
            action.payload.date,
            action.payload.errCallback,
          ),
        },
      };

    case ACTIONS.setTourDate:
      putTour(
        () => {},
        action.payload.errCallback,
        { date: action.payload.date },
        state.tourId,
      );
      return { ...state, date: action.payload.date };

    case ACTIONS.reverseGroup:
      return {
        ...state,
        tour: {
          ..._reverseGroup(
            action.payload.group,
            state.tour,
            action.payload.errCallback,
          ),
        },
      };

    case ACTIONS.setSamichlausGroupName:
      return {
        ...state,
        tour: {
          ..._setSamichlausGroupName(
            state,
            action.payload,
            action.payload.errCallback,
          ),
        },
      };

    case ACTIONS.removeCustomer:
      deleteCustomer(() => {}, action.payload.errCallback, action.payload.uuid);
      state.tour["Z"].customers.splice(action.payload.index, 1);
      return { ...state, tour: { ...state.tour } };

    case ACTIONS.addTime:
      if (action.payload.index === -1) {
        state.tour[action.payload.group].customerEnd = addMinutesToTime(
          state.tour[action.payload.group].customerEnd,
          action.payload.value,
        );
      } else {
        for (
          let i = action.payload.index;
          i < state.tour[action.payload.group].customers.length;
          i++
        ) {
          state.tour[action.payload.group].customers[i].visitTime =
            addMinutesToTime(
              state.tour[action.payload.group].customers[i].visitTime,
              action.payload.value,
            );
        }
        state.tour[action.payload.group].customerEnd = addMinutesToTime(
          state.tour[action.payload.group].customerEnd,
          action.payload.value,
        );
      }
      return { ...state, tour: { ...state.tour } };
    case ACTIONS.updateTime:
      state.tour[action.payload.group].customerStart =
        action.payload.routeObj.startTime;
      state.tour[action.payload.group].customerEnd =
        action.payload.routeObj.endTime;
      state.tour[action.payload.group].customers.forEach(
        (c, i) =>
          (c.visitTime = action.payload.routeObj.customers[i].visitTime),
      );
      return { ...state, tour: { ...state.tour } };

    case ACTIONS.addNewCustomer:
      state.tour[action.payload.group].customers.push(action.payload.customer);
      return { ...state, tour: { ...state.tour } };

    case ACTIONS.setError:
      return {
        ...state,
        errorBool: action.payload.errorBool,
        error: action.payload.error,
      };

    case ACTIONS.updateTransport:
      if (action.payload.index === -1)
        state.tour[action.payload.group].transport = action.payload.value;
      else
        state.tour[action.payload.group].customers[
          action.payload.index
        ].transport = action.payload.value;
      return { ...state, tour: { ...state.tour } };

    default:
      console.error(
        `You passed an action.type: ${action.type} which doesn't exist`,
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
  error: "",
  errorBool: false,
};

const TourProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tourReducer, initialData);

  const addNewGroup = (route) => {
    dispatch({
      type: ACTIONS.addNewGroup,
      payload: { route: route, errCallback: _errCallback },
    });
  };

  const removeGroup = (group) => {
    dispatch({
      type: ACTIONS.removeGroup,
      payload: group,
      errCallback: _errCallback,
    });
  };

  const setRayonYear = (year, rayon) => {
    dispatch({
      type: ACTIONS.setRayonYear,
      payload: { year: year, rayon: rayon },
    });
  };

  const reverseGroup = (group) => {
    dispatch({
      type: ACTIONS.reverseGroup,
      payload: { group: group, errCallback: _errCallback },
    });
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
    dispatch({
      type: ACTIONS.setTourDate,
      payload: { date: date, errCallback: _errCallback },
    });
  };

  const moveItem = (fromIndex, toIndex, fromGroup, toGroup) => {
    dispatch({
      type: ACTIONS.moveItem,
      payload: {
        fromIndex: fromIndex,
        toIndex: toIndex,
        fromGroup: fromGroup,
        toGroup: toGroup,
        errCallback: _errCallback,
      },
    });
  };

  const setSamichlausGroupName = (values) => {
    dispatch({
      type: ACTIONS.setSamichlausGroupName,
      payload: values,
      errCallback: _errCallback,
    });
  };

  const removeCustomer = (index, uuid) => {
    dispatch({
      type: ACTIONS.removeCustomer,
      payload: { index: index, uuid: uuid, errCallback: _errCallback },
    });
  };

  const addTime = (group, index, value) => {
    dispatch({
      type: ACTIONS.addTime,
      payload: { group: group, index: index, value: value },
    });
  };

  const updateTransport = (group, index, value) => {
    dispatch({
      type: ACTIONS.updateTransport,
      payload: { group: group, index: index, value: value },
    });
  };

  const updateTime = (group, routeObj) => {
    dispatch({
      type: ACTIONS.updateTime,
      payload: { group: group, routeObj: routeObj },
    });
  };

  const addNewCustomer = (group, customer) => {
    dispatch({
      type: ACTIONS.addNewCustomer,
      payload: { group: group, customer: customer },
    });
  };

  const setError = (error, errorBool) => {
    dispatch({
      type: ACTIONS.setError,
      payload: { error: error, errorBool: errorBool },
    });
  };

  const _errCallback = (err) => {
    if (err.response) {
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
      updateTime,
      addNewCustomer,
      updateTransport,
      setError,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return (
    <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
  );
};

TourProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TourProvider;
