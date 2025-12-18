import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { MapView } from "./components/MapView";
import { CapitalDetail } from "./components/CapitalDetail";
import { NearbyList } from "./components/NearbyList";
import { getCapitalForCountry, DEFAULT_CAPITAL } from "@/data/country-to-capital";
import { mountWidget, useDisplayMode } from "skybridge/web";
import { useCallTool, useToolInfo } from "../helpers";
import "@/index.css";

// Full capital details (fetched on demand)
type Capital = {
  name: string;
  country: { name: string; cca2: string; cca3: string };
  coordinates: { lat: number; lng: number };
  flag: string;
  population: number;
  continent: string;
  currencies: Array<{ code: string; name: string; symbol: string }>;
  photos: Array<{
    url: string;
    thumbUrl: string;
    photographer: string;
    photographerUrl: string;
  }>;
  wikipedia: {
    capitalDescription?: string;
    countryDescription?: string;
  };
};

// Minimal summary for map markers (from initial load)
type CapitalSummary = {
  name: string;
  countryName: string;
  cca2: string;
  coordinates: { lat: number; lng: number };
};

type ToolOutput = {
  capital: Capital; // Initial capital from tool call
};

type ToolMeta = {
  slug: string;
  allCapitals: CapitalSummary[];
};

// Get user location from OpenAI meta
function getUserLocation(): { country?: string; lat?: number; lng?: number } {
  try {
    // @ts-expect-error - OpenAI injects this
    const meta = window.openai?._meta;
    const userLocation = meta?.["openai/userLocation"];

    if (userLocation) {
      return {
        country: userLocation.country,
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
    }
  } catch {
    // Ignore errors
  }
  return {};
}

function CapitalExplorer() {
  const navigate = useNavigate();

  const [displayMode, setDisplayMode] = useDisplayMode();
  const isFullscreen = displayMode === "fullscreen";

  const { input, output, responseMetadata, isPending } = useToolInfo<"capital">();
  const paramCapitalName = useParams<{ capitalName: string }>().capitalName;
  const allCapitals = responseMetadata?.allCapitals || [];
  const selectedCapital = paramCapitalName || input.name;
  const mapCenter = { lat: 0, lng: 0 };

  const { callTool: travelTo, isPending: isTraveling, data } = useCallTool("capital");
  const isLoadingCapital = isTraveling || isPending;
  const capital = output?.capital || data?.structuredContent.capital;

  const handleCapitalClick = () => {
    setDisplayMode("fullscreen");
  };

  return (
    <div
      className={`
        relative bg-slate-950 overflow-hidden transition-all duration-500 ease-out
        ${isFullscreen ? "fixed inset-0 z-50" : "h-[500px] rounded-xl"}
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
          onMapClick={handleCapitalClick}
          onMoveEnd={handleCapitalClick}
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
          ${isFullscreen && isLoadingCapital ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {isLoadingCapital ? (
          <div className="h-full flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
            <Spinner />
          </div>
        ) : capital ? (
          <CapitalDetail capital={capital} />
        ) : null}
      </div>

      {/* Initial State Overlay - Shows before first interaction */}
      {/* {!hasInteracted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-700/50 animate-pulse">
            <p className="text-slate-300 text-sm">Click anywhere on the map to explore</p>
          </div>
        </div>
      )} */}

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
