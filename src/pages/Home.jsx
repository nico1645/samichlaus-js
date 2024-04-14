import CreateCustomer from "../components/CreateCustomer";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  COLOR_DICT,
  GROUP_LIST,
  LEAFLET_SETTINGS,
} from "../constants/Constants";
import Settings from "../components/Settings";
import { useTour } from "../provider/TourProvider";
import GroupButtons from "../components/GroupButtons";
import Sidebar from "../components/Sidebar";
import CardComponent from "../components/CardComponent";
import TableComponent from "../components/TableComponent";

export default function Home() {
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTableMode, setIsTableMode] = useState(false);
  const [group, setGroup] = useState("");
  const [dragTo, setDragTo] = useState(0);
  const [dragOverGroup, setDragOverGroup] = useState("");
  const {
    rayon,
    year,
    tour,
    date,
    moveItem,
    numOfGroups,
    setGroupStartDate,
    reverseGroup,
    setSamichlausGroupName
  } = useTour();
  console.log(tour);
  console.log(group)
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [layerControl, setLayerControl] = useState(null);
  const [layerGroups, setLayerGroups] = useState([]);
  const nameRef = useRef({});

  useEffect(() => {
    if (!mapRef.current) return;

    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: LEAFLET_SETTINGS.maxZoom,
      minZoom: LEAFLET_SETTINGS.minZoom,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    const mapbox = L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=" +
        import.meta.env.VITE_MAPBOX_API_TOKEN,
      {
        maxZoom: LEAFLET_SETTINGS.maxZoom,
        minZoom: LEAFLET_SETTINGS.minZoom,
        attribution:
          '&copy; <a href="https://www.mapbox.com">Satellite Map</a> contributors',
      }
    );

    const baseMaps = {
      OpenStreetMap: osm,
      Satellite: mapbox,
    };

    const map = L.map(mapRef.current, {
      center: LEAFLET_SETTINGS.center,
      zoom: LEAFLET_SETTINGS.zoom,
    });

    const tmpLayerControl = L.control
      .layers(baseMaps, undefined, {
        position: "bottomleft",
      })
      .addTo(map);

    osm.addTo(map);
    setMap(map);
    setLayerControl(tmpLayerControl);

    return () => {
      map.remove();
      setMap(null);
      setLayerControl(null);
    };
  }, []);

  useEffect(() => {
    if (!map || !tour) return;
    renderAll();
  }, [tour]);

  const renderAll = () => {
    layerGroups.forEach((layer, index) => {
      map.removeLayer(layer);
      layerControl.removeLayer(layer);
    });
    const newLayerGroup = [];
    for (let i = 0; i < numOfGroups + 1; i++) {
      if ((!group  || !dragOverGroup) && numOfGroups > 0) {
        setGroup("A");
        setDragOverGroup("A");
      }
      const polyline = [];
      const markers = [];
      var g;
      var layer;
      if (i == numOfGroups) g = "Z";
      else g = GROUP_LIST[i];
      tour[g].customers.forEach((customer, index) => {
        const markerURI = `marker/marker-${COLOR_DICT[g]}-${Math.min(
          index + 1,
          21
        )}.png`;
        const icon = L.icon({
          iconUrl: markerURI,
          iconSize: [30, 35],
          iconAnchor: [15, 35],
          iconRetinaUrl: markerURI,
          popupAnchor: [0, -20],
        });
        markers.push(
          L.marker([customer.address.latitude, customer.address.longitude], {
            icon: icon,
          })
        );
        polyline.push([customer.address.latitude, customer.address.longitude]);
      });
      if (g === "Z") {
        layer = L.layerGroup([...markers]);
        layerControl.addOverlay(layer, "No assignment");
      } else {
        layer = L.layerGroup([
          L.polyline(polyline, { color: COLOR_DICT[g] }),
          ...markers,
        ]);
        layerControl.addOverlay(layer, g);
      }
      layer.addTo(map);
      newLayerGroup.push(layer);
    }
    setLayerGroups(newLayerGroup);
  };

  const onCloseCreateCustomer = () => {
    setIsCreateCustomerOpen(false);
  };

  const onCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const saveSamichlausGroupNames = () => {
    if (isTableMode) {
      const values = {};
      Object.keys(nameRef.current).forEach((value, index) => {
        if (nameRef.current[value])
        values[value] = nameRef.current[value].value;
      })
      setSamichlausGroupName(values);
    }
  }

  const changeEditMode = () => {
    saveSamichlausGroupNames();
    setIsTableMode(!isTableMode);
  };

  const dragEnter = (_, position) => {
    setDragTo(position);
  };

  const dropItem = (fromIndex, toIndex, fromGroup, toGroup) => {
    moveItem(fromIndex, toIndex, fromGroup, toGroup);
    setDragOverGroup(group);
  };

  const changeStartDate = (e) => {
    if (e.target.name === "visit-date") {
      setGroupStartDate(
        group,
        new Date(
          e.target.value +
            "T" +
            tour[group].customerStart
              .getUTCHours()
              .toString()
              .padStart(2, "0") +
            ":" +
            tour[group].customerStart
              .getUTCMinutes()
              .toString()
              .padStart(2, "0") +
            ":00.000Z"
        )
      );
    } else if (e.target.name === "visit-time") {
      setGroupStartDate(
        group,
        new Date(
          tour[group].customerStart.toISOString().slice(0, 10) +
            "T" +
            e.target.value +
            ":00.000"
        )
      );
    }
  };

  return (
    <section className=" h-screen w-screen bg-white dark:bg-gray-900 dark:text-white">
      <CreateCustomer
        isOpen={isCreateCustomerOpen}
        onClose={onCloseCreateCustomer}
      />
      <Settings
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        setGroup={setGroup}
      />
      <div className="flex flex-row h-full">
        <Sidebar
          openCreateCustomer={() => setIsCreateCustomerOpen(true)}
          openSettings={() => setIsSettingsOpen(true)}
        />
        <div className=" flex-grow">
          {/* TABLE PAGE */}
          <div
            className={`w-full h-full flex flex-row overflow-x-scroll mt-12 max-h-[calc(100vh-48px)] max-w-[calc(100vw-60px)] ${
              isTableMode ? "block" : "hidden"
            }`}
          >
            <button
              className="ml-4 absolute p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white select-none -translate-y-8"
              onClick={() => saveSamichlausGroupNames()}
            >
              Save Names
            </button>
            {GROUP_LIST.map((group, index) => {
              if (index >= numOfGroups || tour[group].customers.length === 0)
                return null;

              return (
                <TableComponent
                  key={"table-" + group + "-" + index}
                  route={tour[group]}
                  group={group}
                  nameRef={nameRef}
                />
              );
            })}
          </div>
          {/* MAP PAGE */}
          <div
            className={`h-full w-full flex md:flex-row flex-col ${
              isTableMode ? "hidden" : "block"
            }`}
          >
            <div
              id="main-map"
              ref={mapRef}
              className="md:h-full md:w-1/2 h-1/2 w-full"
            ></div>
            <div className="md:h-full md:w-1/2 w-full h-1/2">
              <div className="w-full mt-2 h-14 border-b  border-gray-100 dark:border-gray-500 shadow-sm">
                <div className="flex mr-1 md:mx-4 w-[100vh-50%] gap-2 md:mr-32 overflow-y-hidden justify-between">
                  <GroupButtons
                    group={group}
                    setGroup={setGroup}
                    setDragOverGroup={setDragOverGroup}
                  />
                  <div className="flex flex-col max-h-14">
                    <div className="flex gap-4 text-xl flex-grow select-none text-nowrap">
                      <div>{year}</div>
                      <div>Rayon {"I".repeat(rayon)}</div>
                    </div>
                    {group ? (
                      <div className="flex gap-2 text-nowrap">
                        <div className="select-none">Start: </div>
                        <div className="select-none">
                          {date +
                            ", " +
                            tour[group].customerStart.slice(0, 5)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              {group ? (
                <div className="flex flex-col overflow-y-hidden md:overflow-auto lg:flex-row">
                  <div className="overflow-y-scroll lg:h-[calc(100vh-64px)] md:max-h-[calc(100vh-300px)] md:max-h-1/2 lg:w-1/2 max-h-[calc(50vh-64px)]">
                    {tour[group].customers.map((customer, i) => {
                      return (
                        <div
                          key={"list-component-" + i}
                          className="flex flex-row bg-white dark:bg-gray-800 items-center border-gray-100 border-b-1 dark:border-gray-700 h-20"
                        >
                          <span className="select-none h-20 w-20 flex items-center flex-shrink-0 justify-center text-2xl font-bold text-center cursor-default bg-gray-200 border-white dark:bg-gray-800 border-b border-r dark:border-gray-700">
                            {1 + i}
                          </span>
                          <div
                            className="h-20 flex flex-grow items-center bg-gray-50 dark:bg-gray-900 border-white border-b border-r dark:border-gray-700"
                            onDragEnd={(e) => {
                              dropItem(i, dragTo, group, dragOverGroup);
                            }}
                            onDragEnter={(e) => dragEnter(e, i)}
                            draggable
                          >
                            <CardComponent
                              customer={customer}
                              index={i}
                              group={group}
                              dropItem={dropItem}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div
                      key={"list-component-+"}
                      className="flex flex-row bg-gray-50 dark:bg-gray-800 items-center border-white border-b dark:border-gray-700"
                      onDragEnter={(e) =>
                        dragEnter(e, tour[group].customers.length - 1)
                      }
                    >
                      <span className="select-none h-20 w-20 flex items-center flex-shrink-0 justify-center text-2xl font-bold text-center cursor-default bg-gray-200 border-white dark:bg-gray-800 border-r dark:border-gray-700">
                        {tour[group].customers.length + 1}
                      </span>
                      <div className="flex flex-grow  dark:bg-gray-800 items-center justify-around">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className=" dark:fill-white h-10 w-10 rounded-full border-4 dark:border-white border-gray-800"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* OVERVIEW ALL GROUPS */}
                  <div className="md:flex flex-col flex-grow hidden">
                    <div className="flex flex-row gap-2 items-center justify-around">
                      <div
                        onClick={() => reverseGroup(group)}
                        className="border-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 border-2 m-1 rounded-lg p-2 text-center flex-shrink dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 dark:stroke-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                          />
                        </svg>
                      </div>
                      <div className="flex m-2 gap-2 flex-col items-center h-16">
                        <div className="flex flex-row gap-4">
                          <div className="flex-grow select-none">Date: </div>
                          <input
                            className="dark:text-black border border-black rounded-md"
                            name="visit-date"
                            type="date"
                            value={date}
                            onChange={(e) => changeStartDate(e)}
                          ></input>
                        </div>
                        <div className="flex-row flex gap-8 items-start justify-items-start">
                          <div className="select-none">Start Time: </div>
                          <input
                            className="dark:text-black border border-black rounded-md"
                            name="visit-time"
                            type="time"
                            value={tour[group].customerStart.slice(0, 5)}
                            onChange={(e) => changeStartDate(e)}
                          ></input>
                        </div>
                      </div>
                    </div>
                    {tour["Z"].customers.length > 0 ? (
                      <div className="rounded-sm m-1 dark:bg-gray-800 bg-gray-100">
                        <div className=" text-lg text-center text-nowrap">
                          Not assigned
                        </div>
                        <div className="max-h-96 h-full overflow-y-auto">
                          {tour["Z"].customers.map((customer, index) => {
                            return (
                              <div
                                key={"unassigned-" + index}
                                className="h-20 bg-gray-50 dark:bg-gray-800"
                                onDragEnd={(e) => {
                                  dropItem(index, dragTo, "Z", dragOverGroup);
                                }}
                                draggable
                              >
                                <CardComponent
                                  customer={customer}
                                  index={index}
                                  group={"Z"}
                                  dropItem={dropItem}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 grid-rows-2 w-full">
                      {GROUP_LIST.map((group, index) => {
                        if (
                          index >= numOfGroups ||
                          tour[group].customers.length === 0
                        )
                          return null;

                        return (
                          <div
                            key={"group-overview-" + index}
                            className="rounded-sm m-1 dark:bg-gray-800 bg-gray-100 p-1"
                          >
                            <div className="text-nowrap">Group {group}</div>
                            <div className="text-nowrap">
                              Start time:{" "}
                              {tour[group].customerStart.slice(0, 5)}
                            </div>
                            <div className="text-nowrap">
                              End time:{" "}
                              {tour[group].customers[
                                tour[group].customers.length - 1
                              ].visitTime.slice(0, 5)}
                            </div>
                            <div className="text-nowrap">
                              Visit count: {tour[group].customers.length}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="absolute top-0 right-0 mt-4 mr-4 z-[1000]">
            <button
              className="w-full p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white select-none"
              onClick={() => changeEditMode()}
            >
              {isTableMode ? "Map Mode" : "Table Mode"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
