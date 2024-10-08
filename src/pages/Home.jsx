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
import useTour from "../provider/Tour";
import GroupButtons from "../components/GroupButtons";
import Sidebar from "../components/Sidebar";
import CardComponent from "../components/CardComponent";
import TableComponent from "../components/TableComponent";
import Error from "../components/Error.jsx";
import { updateManyCustomers, updateManyRoutes } from "../utils/utils";

export default function Home() {
  const [screenInnerWidth, setScreenInnerWidth] = useState(window.innerWidth);
  const [mapWidth, setMapWidth] = useState(49);
  const [hideMap, setHideMap] = useState(false);
  const [isResizingMapWidth, setIsResizingMapWidth] = useState(false);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTableMode, setIsTableMode] = useState(false);
  const [group, setGroup] = useState("");
  const [dragTo, setDragTo] = useState();
  const [dragOverGroup, setDragOverGroup] = useState("");
  const {
    rayon,
    year,
    tour,
    date,
    moveItem,
    numOfGroups,
    setGroupStartTime,
    reverseGroup,
    setSamichlausGroupName,
    setTourDate,
    errorBool,
    setError,
  } = useTour();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [layerControl, setLayerControl] = useState(null);
  const [layerGroups, setLayerGroups] = useState([]);
  const nameRef = useRef({});
  const dragCounter = useRef(0);
  const markerIcons = {};

  [...GROUP_LIST, "Z"].forEach((group) => {
    for (let index = 1; index <= 21; index++) {
      const markerURI = `marker/marker-${COLOR_DICT[group]}-${index}.png`;
      const img = new Image();
      img.src = markerURI;
      markerIcons[`${group}-${index}`] = img;
    }
  });

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
      },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  const renderAll = () => {
    layerGroups.forEach((layer) => {
      map.removeLayer(layer);
      layerControl.removeLayer(layer);
    });
    const newLayerGroup = [];
    for (let i = 0; i < numOfGroups + 1; i++) {
      if (!group && numOfGroups > 0) {
        setGroup("A");
      }
      const polyline = [];
      const markers = [];
      var g;
      var layer;
      if (i == numOfGroups) g = "Z";
      else g = GROUP_LIST[i];
      tour[g].customers.forEach((customer, index) => {
        const markerIcon = markerIcons[`${g}-${Math.min(index + 1, 21)}`];
        const icon = L.icon({
          iconUrl: markerIcon.src,
          iconSize: [30, 35],
          iconAnchor: [15, 35],
          iconRetinaUrl: markerIcon.src,
          popupAnchor: [0, -20],
        });
        const marker = L.marker(
          [customer.address.latitude, customer.address.longitude],
          {
            icon: icon,
          },
        );
        const ng = g;
        if (g !== "Z")
          marker.on("click", () => {
            setGroup(ng);
          });
        markers.push(marker);
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

  const onCloseError = () => {
    setError("", false);
  };

  const saveSamichlausGroupNames = () => {
    if (isTableMode) {
      const values = {};
      Object.keys(nameRef.current).forEach((value) => {
        if (nameRef.current[value])
          values[value] = nameRef.current[value].value;
      });
      const customers = [];
      const routes = [];
      Object.keys(tour).forEach((group) => {
        if (group === "Z") return;
        routes.push({
          routeId: tour[group].routeId,
          transport: tour[group].transport,
        });
        tour[group].customers.forEach((customer) => {
          customers.push({
            customerId: customer.customerId,
            visitTime: customer.visitTime,
            transport: customer.transport,
          });
        });
      });
      updateManyCustomers(
        () => {},
        () => {},
        customers,
      );
      updateManyRoutes(
        () => {},
        () => {},
        routes,
      );
      setSamichlausGroupName(values);
    }
  };

  const changeEditMode = () => {
    Object.keys(tour).forEach((group) => {
      if (group === "Z") return;
      nameRef.current[group + "samichlaus"].value = tour[group].samichlaus;
      nameRef.current[group + "schmutzli"].value = tour[group].schmutzli;
      nameRef.current[group + "ruprecht"].value = tour[group].ruprecht;
      nameRef.current[group + "engel1"].value = tour[group].engel1;
      nameRef.current[group + "engel2"].value = tour[group].engel2;
    });
    setIsTableMode(!isTableMode);
    setTimeout(() => map.invalidateSize(), 50);
  };

  const dragEnter = (_, position) => {
    dragCounter.current++;
    setDragOverGroup(group);
    setDragTo(position);
  };

  const dragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverGroup("");
    }
  };

  const drop = (e) => {
    moveItem(
      parseInt(e.dataTransfer.getData("fromIndex")),
      dragTo,
      e.dataTransfer.getData("fromGroup"),
      dragOverGroup,
    );
  };

  const dragStart = (e, fromIndex, fromGroup) => {
    e.dataTransfer.setData("fromIndex", fromIndex);
    e.dataTransfer.setData("fromGroup", fromGroup);
  };

  const changeTourDate = (e) => {
    setTourDate(e.target.value);
  };

  const changeGroupStartTime = (e) => {
    setGroupStartTime(group, e.target.value + ":00");
  };

  const startResizing = () => setIsResizingMapWidth(true);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingMapWidth) return;

      const movement = e.movementX;
      if (movement > 0) {
        setMapWidth((old) => Math.min(80, old + 0.2));
        if (hideMap && mapWidth >= 11) setHideMap(false);
        setTimeout(() => map.invalidateSize(), 50);
      } else if (movement < 0) {
        if (mapWidth <= 10) setHideMap(true);
        setMapWidth((old) => Math.max(old - 0.2, 10));
        setTimeout(() => map.invalidateSize(), 50);
      }
    };

    const handleMouseUp = () => setIsResizingMapWidth(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapWidth]);

  useEffect(() => {
    const handleResize = () => {
      setScreenInnerWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className=" h-screen w-screen bg-white dark:bg-gray-900 dark:text-white">
      <CreateCustomer
        isOpen={isCreateCustomerOpen}
        onClose={onCloseCreateCustomer}
      />
      <Error isOpen={errorBool} onClose={onCloseError} />
      <Settings
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        setGroup={setGroup}
      />
      <div
        className={`flex flex-row h-full ${isResizingMapWidth ? "select-none" : ""}`}
      >
        <Sidebar
          openCreateCustomer={() => setIsCreateCustomerOpen(true)}
          openSettings={() => setIsSettingsOpen(true)}
        />
        <div className=" flex-grow">
          <div className="flex flex-col md:flex-row h-full w-auto">
            {/* MAP PAGE */}
            <div
              id="main-map"
              ref={mapRef}
              className={`md:h-full md:w-1/2 h-1/2 w-full select-none`}
              style={
                screenInnerWidth >= 768
                  ? {
                      width: `${screenInnerWidth * (mapWidth / 100) - 64}px`,
                      display: hideMap ? "none" : "block",
                    }
                  : {}
              }
            ></div>
            {/* MAP PAGE */}
            {/* RESIZER */}
            <div
              className="md:h-full md:block md:w-2 hidden cursor-col-resize hover:bg-blue-600"
              onMouseMove={(e) => {
                if (isResizingMapWidth)
                  setMapWidth((old) => old + 1 * e.movementX);
              }}
              onMouseDown={startResizing}
            ></div>
            {/* RESIZER */}
            {/* TABLE PAGE BEGIN*/}
            <div
              className={`w-auto md:h-full h-1/2 flex flex-row overflow-x-scroll mt-12 max-h-[calc(100vh-48px)] ${
                isTableMode ? "block" : "hidden"
              }`}
              style={
                screenInnerWidth < 768
                  ? {
                      height: `${window.innerHeight / 2}px`,
                      width: `${screenInnerWidth - 64}px`,
                    }
                  : hideMap
                    ? { width: `${screenInnerWidth - 72}px` }
                    : {
                        width: `${screenInnerWidth - (screenInnerWidth * (mapWidth / 100) + 8)}px`,
                      }
              }
            >
              <button
                className="ml-4 absolute p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white select-none -translate-y-8"
                onClick={() => saveSamichlausGroupNames()}
              >
                Save Changes
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
            {/* TABLE PAGE END*/}
            {/* GROUP OVERVIEW PAGE BEGIN*/}
            <div
              className={`h-full flex md:flex-row flex-col ${
                isTableMode ? "hidden" : "block"
              }`}
              style={
                screenInnerWidth < 768
                  ? {
                      height: `${window.innerHeight / 2}px`,
                      width: `${screenInnerWidth - 64}px`,
                    }
                  : {}
              }
            >
              <div
                className="md:h-full md:w-auto flex-grow h-1/2"
                style={
                  screenInnerWidth < 768
                    ? { width: `${screenInnerWidth - 64}px` }
                    : hideMap
                      ? { width: `${screenInnerWidth - 72}px` }
                      : {
                          width: `${screenInnerWidth - (screenInnerWidth * (mapWidth / 100) + 8)}px`,
                        }
                }
              >
                <div className="mt-2 h-14 border-b border-gray-100 dark:border-gray-500 shadow-sm">
                  <div className="flex mr-1 md:mx-4 gap-2 md:mr-32 overflow-x-hidden justify-between">
                    <div className="overflow-x-auto">
                      <GroupButtons
                        group={group}
                        moveItem={moveItem}
                        setGroup={setGroup}
                        setDragOverGroup={setDragOverGroup}
                      />
                    </div>
                    <div className="flex flex-col max-h-14">
                      <div className="flex flex-col gap-0 lg:flex-row lg:gap-4 text-xl flex-grow select-none">
                        <div>{year}</div>
                        <div className="text-nowrap">
                          Rayon {"I".repeat(rayon)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {group ? (
                  <div className="flex flex-col md:h-[calc(100vh-64px)] h-[calc(50vh-64px)] overflow-y-hidden md:overflow-auto lg:flex-row">
                    <div className="overflow-y-auto overflow-x-auto md:max-h-1/2 lg:w-1/2">
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
                              onDrop={(e) => drop(e)}
                              onDragOver={(e) => e.preventDefault()}
                              onDragEnter={(e) => dragEnter(e, i)}
                              onDragStart={(e) => dragStart(e, i, group)}
                              onDragLeave={() => dragLeave()}
                              draggable
                            >
                              <CardComponent
                                style={
                                  screenInnerWidth >= 1024
                                    ? {
                                        width: `${screenInnerWidth / 4 - 92}px`,
                                      }
                                    : screenInnerWidth >= 768
                                      ? {
                                          width: `${screenInnerWidth - screenInnerWidth * (mapWidth / 100) - 112}px`,
                                        }
                                      : {}
                                }
                                customer={customer}
                                index={i}
                                group={group}
                                dropItem={moveItem}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div
                        key={"list-component-+"}
                        className="flex flex-row bg-gray-50 dark:bg-gray-800 items-center border-white border-b dark:border-gray-700"
                      >
                        <span className="select-none h-20 w-20 flex items-center flex-shrink-0 justify-center text-2xl font-bold text-center cursor-default bg-gray-200 border-white dark:bg-gray-800 border-r dark:border-gray-700">
                          {tour[group].customers.length + 1}
                        </span>
                        <div
                          className="flex flex-grow  dark:bg-gray-800 items-center justify-around"
                          onDrop={(e) => drop(e)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={(e) =>
                            dragEnter(e, tour[group].customers.length)
                          }
                          onDragLeave={() => dragLeave()}
                        >
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
                    {/* OVERVIEW ALL GROUPS END*/}
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
                              onKeyDown={(e) => e.preventDefault()}
                              min={date.slice(0, 4) + "-01-01"}
                              max={date.slice(0, 4) + "-12-31"}
                              value={date}
                              onChange={(e) => changeTourDate(e)}
                            ></input>
                          </div>
                          <div className="flex-row flex gap-8 items-start justify-items-start">
                            <div className="select-none">Start Time: </div>
                            <input
                              className="dark:text-black border border-black rounded-md"
                              name="visit-time"
                              type="time"
                              value={tour[group].customerStart.slice(0, 5)}
                              onChange={(e) => changeGroupStartTime(e)}
                            ></input>
                          </div>
                        </div>
                      </div>
                      {tour["Z"].customers.length > 0 ? (
                        <div
                          onDragLeave={() => dragLeave()}
                          onDragEnter={() => dragCounter.current++}
                          onDragOver={(e) => e.preventDefault()}
                          className="rounded-sm m-1 dark:bg-gray-800 bg-gray-100"
                        >
                          <div className=" text-lg text-center text-nowrap">
                            Not assigned
                          </div>
                          <div className="lg:max-h-96 md:max-h-64 h-full overflow-y-auto">
                            {tour["Z"].customers.map((customer, index) => {
                              return (
                                <div
                                  key={"unassigned-" + index}
                                  className="h-20 bg-gray-50 dark:bg-gray-800"
                                  onDragStart={(e) => dragStart(e, index, "Z")}
                                  onDragOver={(e) => e.preventDefault()}
                                  draggable
                                >
                                  <CardComponent
                                    customer={customer}
                                    index={index}
                                    group={"Z"}
                                    dropItem={moveItem}
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
            {/* GROUP OVERVIEW PAGE */}
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
