export const COLOR_DICT = {
  A: "green",
  B: "blue",
  C: "orange",
  D: "red",
  E: "lime",
  F: "purple",
  G: "pink",
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

export const route_comparator_group = (a, b) => {
  return a.group.localeCompare(b.group);
}

export const addMinutesToTime = (time, value) => {
  // Parse time string into hours, minutes, and seconds components
  const [hoursStr, minutesStr, secondsStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const seconds = parseInt(secondsStr, 10);

  // Calculate total minutes represented by the input time
  let totalMinutes = hours * 60 + minutes;

  // Add or subtract the specified value of minutes
  totalMinutes += value;

  // Ensure resulting time remains within valid range
  totalMinutes = (totalMinutes + 1440) % 1440; // Modulo 1440 to handle negative values and wrap around 24 hours

  // Calculate new hours and minutes
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  // Format resulting time back into HH:mm:ss format
  const newTime = `${padZero(newHours)}:${padZero(newMinutes)}:${padZero(seconds)}`;
  return newTime;
}

const padZero = (num) => {
  return num < 10 ? '0' + num : num.toString();
}

export const getAbsMinuteDifference = (time1, time2) => {
  const [hours1, minutes1, ] = time1.split(":").map(Number);
  const [hours2, minutes2, ] = time2.split(":").map(Number);

  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;

  const diffInMinutes = Math.abs(totalMinutes2 - totalMinutes1);

  return diffInMinutes;
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

export const isTime1Earlier = (time1, time2) => {
  const [hours1, minutes1, sec1] = time1.split(":").map(Number);
  const [hours2, minutes2, sec2] = time2.split(":").map(Number);
  if (hours1 < hours2) return true;
  else if (hours2 < hours1) return false;
  else {
    if (minutes1 < minutes2) return true;
    else if (minutes2 < minutes1) return false;
    else {
        if (sec1 < sec2) return true;
        else return false;
    }
  }

}

const childMap = {
    0: 0,
    1: 15,
    2: 20,
    3: 30,
    4: 40
}
const seniorMap = {
    0: 0,
    1: 10,
    2: 20,
    3: 30,
    4: 40
}

export const getVisitTime = (children, seniors) => {
    var time = 0;
    if (childMap[children] != null)
        time += childMap[children];
    else
        time += 40;
    if (seniorMap[seniors] != null)
        time += seniorMap[seniors];
    else
        time += 40;
    return time
}
