import { useState } from "react";
import { Globe, Users, Coins, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

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

type CapitalDetailProps = {
  capital: Capital;
};

export function CapitalDetail({ capital }: CapitalDetailProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { photos, wikipedia } = capital;

  const nextPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      className="h-full flex flex-col bg-slate-900/95 backdrop-blur-sm overflow-hidden"
      data-llm={
        "The user is currently viewing the capital detail for " +
        capital.name +
        "Disregard all previous information about the capital the user was looking at. Here are additional information about the capital in case he asks for it: " +
        JSON.stringify({
          capital: capital.name,
          country: capital.country.name,
          description: wikipedia.capitalDescription,
          countryDescription: wikipedia.countryDescription,
        })
      }
    >
      {/* Photo Carousel */}
      {photos.length > 0 && (
        <div className="relative h-48 shrink-0 group">
          <img src={photos[currentPhotoIndex].url} alt={capital.name} className="w-full h-full object-cover" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />

          {/* Photo navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentPhotoIndex ? "bg-amber-400 w-3" : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Attribution */}
          <a
            href={photos[currentPhotoIndex].photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-2 text-[10px] text-white/60 hover:text-white/90 flex items-center gap-1"
          >
            📷 {photos[currentPhotoIndex].photographer}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start gap-3">
        <img
          src={capital.flag}
          alt={capital.country.name}
          className="w-12 h-8 object-cover rounded shadow-lg border border-white/10"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{capital.name}</h2>
          <p className="text-sm text-slate-400 truncate">{capital.country.name}</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={<Users className="w-4 h-4" />} label="Population" value={formatNumber(capital.population)} />
          <StatCard icon={<Globe className="w-4 h-4" />} label="Continent" value={capital.continent} />
        </div>

        {/* Currencies */}
        {capital.currencies.length > 0 && (
          <InfoSection icon={<Coins className="w-4 h-4" />} title="Currencies">
            <div className="space-y-1">
              {capital.currencies.map((curr) => (
                <div key={curr.code} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{curr.name}</span>
                  <span className="text-amber-400 font-mono">
                    {curr.symbol} ({curr.code})
                  </span>
                </div>
              ))}
            </div>
          </InfoSection>
        )}

        {/* Wikipedia Description */}
        {wikipedia.capitalDescription && (
          <div className="text-sm text-slate-300 leading-relaxed">{wikipedia.capitalDescription}</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-white font-semibold truncate">{value}</div>
    </div>
  );
}

function InfoSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}
