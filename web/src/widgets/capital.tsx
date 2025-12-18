import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { MapView } from "./components/MapView";
import { CapitalDetail } from "./components/CapitalDetail";
import { NearbyList } from "./components/NearbyList";
import { mountWidget, useDisplayMode } from "skybridge/web";
import { useCallTool, useToolInfo } from "../helpers";
import "@/index.css";

function CapitalExplorer() {
  const [displayMode, setDisplayMode] = useDisplayMode();
  const isFullscreen = displayMode === "fullscreen";

  const { input, output, responseMetadata, isPending } = useToolInfo<"capital">();
  const [selectedCapital, setSelectedCapital] = useState(input.name);
  const allCapitals = responseMetadata?.allCapitals || [];
  const mapCenter = allCapitals.find((capital) => capital.name === selectedCapital)?.coordinates || { lat: 0, lng: 0 };

  const { callTool: travelTo, isPending: isTraveling, data } = useCallTool("capital");
  const isLoadingCapital = isTraveling || isPending;
  const capital = data?.structuredContent.capital || output?.capital;

  const handleCapitalClick = (capitalName: string) => {
    setSelectedCapital(capitalName);
    travelTo({ name: capitalName });
  };

  return (
    <div
      className={`
        bg-slate-950 overflow-hidden transition-all duration-500 ease-out
        ${isFullscreen ? "fixed inset-0 z-50" : "relative h-[500px] rounded-xl"}
      `}
    >
      {/* Map Container */}
      <div className="absolute inset-0">
        <MapView
          capitals={allCapitals}
          selectedCapital={selectedCapital}
          center={mapCenter}
          zoom={5}
          onCapitalClick={handleCapitalClick}
          onMapClick={() => setDisplayMode("fullscreen")}
        />
      </div>

      {/* Left Panel - Nearby Capitals */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-72 transition-transform duration-500
          ${isFullscreen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <NearbyList
          capitals={allCapitals}
          mapCenter={mapCenter}
          selectedCapital={selectedCapital}
          onCapitalSelect={handleCapitalClick}
        />
      </div>

      {/* Right Panel - Capital Details */}
      <div
        className={`
          absolute right-0 top-0 bottom-0 w-80 transition-transform duration-500
          ${isFullscreen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {isLoadingCapital ? (
          <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-sm overflow-hidden items-center justify-center">
            <Spinner color="white" />
          </div>
        ) : capital ? (
          <CapitalDetail capital={capital} />
        ) : null}
      </div>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          onClick={() => setDisplayMode("inline")}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-sm rounded-full border border-slate-700/50 hover:bg-slate-800 transition-colors"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );
}

function CapitalWidget() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CapitalExplorer />}>
          <Route path="/:capitalName" element={<CapitalExplorer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default CapitalWidget;

mountWidget(<CapitalWidget />);
