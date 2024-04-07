import { useNavigate } from "react-router-dom";
import CreateCustomer from "../components/CreateCustomer";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  LEAFLET_SETTINGS,
} from "../constants/Constants";
import Settings from "../components/Settings";
import { useTour } from "../provider/TourProvider";
import GroupButtons from "../components/GroupButtons";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTableMode, setIsTableMode] = useState(false);
  const [group, setGroup] = useState("");
  const { rayon, year, visits, numOfGroups } = useTour();

  const navigate = useNavigate();
  const mapRef = useRef(null);

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

    L.control
      .layers(baseMaps, undefined, {
        position: "bottomleft",
      })
      .addTo(map);

    osm.addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  const onCloseCreateCustomer = () => {
    setIsCreateCustomerOpen(false);
  };

  const onCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const changeEditMode = () => {
    setIsTableMode(!isTableMode);
  };


  return (
    <section className=" h-screen w-screen bg-white dark:bg-gray-900 dark:text-white">
      <CreateCustomer
        isOpen={isCreateCustomerOpen}
        onClose={onCloseCreateCustomer}
      />
      <Settings isOpen={isSettingsOpen} onClose={onCloseSettings} />
      <div className="flex flex-row h-full  ">
        <Sidebar openCreateCustomer={() => setIsCreateCustomerOpen(true)} openSettings={() => setIsSettingsOpen(true)}/>
        <div className=" flex-grow">
          {/* TABLE PAGE */}
          <div className={`h-full w-full ${isTableMode ? "block" : "hidden"}`}>
            TABLE PAGE
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
                <div className="flex mx-4 md:mr-32 overflow-x-auto overflow-y-hidden">
                    <GroupButtons group={group} setGroup={setGroup} />
                  <div className=" flex-grow"></div>
                  <div className="flex flex-col max-h-14">
                    <div className="flex gap-4 text-xl flex-grow select-none text-nowrap">
                      <div>{year}</div>
                      <div>Rayon {"I".repeat(rayon)}</div>
                    </div>
                    {group ? (
                      <div className="flex gap-2">
                        <div>Start: </div>
                        <div>
                          {visits[group].date
                            .toLocaleDateString([], {
                              month: "long",
                              day: "numeric",
                            })
                            .slice(0, 5) +
                            ", " +
                            visits[group].date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div> 
              { group ?
              <div className="overflow-y-scroll md:max-h-[calc(100vh-64px)] max-h-[calc(100%-64px)] lg:w-1/2 h-full">
                {visits[group].arr.map((val, i) => {
                  return (
                    <div
                      key={"list-component-" + i}
                      className="flex flex-row bg-white dark:bg-gray-800 items-center border-gray-100 border dark:border-gray-700"
                    >
                      <span className="select-none h-20 w-20 flex items-center flex-shrink-0 justify-center text-2xl font-bold text-center cursor-default bg-gray-200 border-gray-100 dark:bg-gray-800 border-r-2 dark:border-gray-700">
                        {1 + i}
                      </span>
                      <div className="  flex-grow bg-gray-50 dark:bg-gray-900">
                        <div
                          className="cursor-grab active:cursor-grabbing select-none"
                          key={"card-component-" + i}
                          draggable
                        >
                          <div className="h-20">Test</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div
                  key={"list-component-12"}
                  className="flex flex-row bg-gray-50 dark:bg-gray-800 items-center border-gray-100 border dark:border-gray-700"
                >
                  <span className="select-none h-20 w-20 flex items-center flex-shrink-0 justify-center text-2xl font-bold text-center cursor-default bg-gray-200 border-gray-100 dark:bg-gray-800 border-r-2 dark:border-gray-700">
                    {12}
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
              : null }
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
