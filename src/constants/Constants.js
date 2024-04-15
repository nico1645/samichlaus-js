export const COLOR_DICT = {
  A: "green",
  B: "blue",
  C: "orange",
  D: "red",
  E: "lime",
  F: "purple",
  G: "black",
  Z: "black",
};
export const GROUP_DICT = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6 };
export const GROUP_LIST = ["A", "B", "C", "D", "E", "F", "G"];
export const LEAFLET_SETTINGS = {
  center: [46.99, 8.311],
  minZoom: 11,
  maxZoom: 18,
  zoom: 15,
};
export const DEPOT = [46.9905, 8.311];
export const MAX_GROUPS = 7;
export const RAYON_OPTIONS = [
  {
    label: "Rayon I",
    value: 1,
  },
  {
    label: "Rayon II",
    value: 2,
  },
  {
    label: "Rayon III",
    value: 3,
  },
];
export const route_comparator = (a, b) => {
  if (a.visitTime < b.visitTime) {
    return -1;
  }
  if (a.visitTime > b.visitTime) {
    return 1;
  }
  return 0;
};

export const route_comparator_address = (a, b) => {
  return a.address.address.localeCompare(b.address.address);
}

export const parseDate = (utcString) => {
  if (!utcString) return null;
  var dateComponents = utcString.split(/[T:+-]/);
  return new Date(
    Date.UTC(
      parseInt(dateComponents[0]), // Year
      parseInt(dateComponents[1]) - 1, // Month (zero-based)
      parseInt(dateComponents[2]), // Day
      parseInt(dateComponents[3] || 0), // Hour (default to 0 if not provided)
      parseInt(dateComponents[4] || 0), // Minute (default to 0 if not provided)
      parseInt(dateComponents[5] || 0), // Second (default to 0 if not provided)
      parseInt(dateComponents[6] || 0) // Millisecond (default to 0 if not provided)
    )
  );
};
