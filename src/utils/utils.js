import axios from "axios";

export const getAddressesContaining = (
  searchTerm,
  callback,
  succCallback,
  errCallback,
) => {
  axios
    .get(
      import.meta.env.VITE_APP_BACKEND_URL +
        "api/v1/address?address=" +
        encodeURI(searchTerm) +
        "&limit=100",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
    .then((res) => succCallback(res, callback))
    .catch((err) => errCallback(err));
};

export const getYears = (succCallback, errCallback) => {
  axios
    .get(import.meta.env.VITE_APP_BACKEND_URL + "api/v1/customer/years", {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const getCustomers = (succCallback, errCallback, year) => {
  axios
    .get(import.meta.env.VITE_APP_BACKEND_URL + "api/v1/customer/get/" + year, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const postCalculateTour = (
  succCallback,
  errCallback,
  data,
  year,
  rayon,
) => {
  axios
    .post(
      `${
        import.meta.env.VITE_APP_BACKEND_URL
      }api/v1/vrp/solve/${year}/${rayon}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const getExcel = (succCallback, errCallback, year) => {
  axios
    .get(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/vrp/excel/${year}`, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
      responseType: "blob",
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const getTour = (succCallback, errCallback, year, rayon) => {
  axios
    .get(
      `${import.meta.env.VITE_APP_BACKEND_URL}api/v1/tour/TST/${year}/${rayon}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const postCreateCustomer = (succCallback, errCallback, data) => {
  axios
    .post(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/customer/tour`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const getCustomer = (succCallback, errCallback, uuid) => {
  axios
    .get(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/customer/${uuid}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const putCustomer = (succCallback, errCallback, data, uuid) => {
  axios
    .put(
      `${import.meta.env.VITE_APP_BACKEND_URL}api/v1/customer/${uuid}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const putTour = (succCallback, errCallback, data, uuid) => {
  axios
    .put(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/tour/${uuid}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const deleteCustomer = (succCallback, errCallback, uuid) => {
  axios
    .delete(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/customer/${uuid}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const deleteRoute = (succCallback, errCallback, uuid) => {
  axios
    .delete(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/route/${uuid}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const createRoute = (succCallback, errCallback, data) => {
  axios
    .post(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/route`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const updateRoute = (succCallback, errCallback, data) => {
  axios
    .patch(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/route`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const updateManyCustomers = (succCallback, errCallback, data) => {
  axios
    .patch(
      `${import.meta.env.VITE_APP_BACKEND_URL}api/v1/customer/many`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const patchCustomer = (succCallback, errCallback, data) => {
  axios
    .patch(
      `${import.meta.env.VITE_APP_BACKEND_URL}api/v1/customer/many`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const updateManyRoutes = (succCallback, errCallback, data) => {
  axios
    .patch(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/route/many`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const updateRouteTime = (succCallback, errCallback, data) => {
  axios
    .post(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/routing/route`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const postMail = (succCallback, errCallback, data) => {
  axios
    .post(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/mail`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};

export const postManyMail = (succCallback, errCallback, data) => {
  axios
    .post(`${import.meta.env.VITE_APP_BACKEND_URL}api/v1/mail/many`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => succCallback(res))
    .catch((err) => errCallback(err));
};
