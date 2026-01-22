"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap, TileLayer as LeafletTileLayer, Marker as LeafletMarker, Popup as LeafletPopup } from 'leaflet';

// Dynamically import leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const iconPerson = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Coordinates {
  lat: number;
  lng: number;
}

export default function NavigationPage() {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [simulatedRouteActive, setSimulatedRouteActive] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [routeInstructions, setRouteInstructions] = useState<string[]>([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState<number>(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Color theme
  const containerStyle = "flex flex-col h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white font-sans overflow-hidden";
  const mapWrapperStyle = "flex-grow w-full h-1/2 border-b-4 border-white/20 shadow-lg relative z-0";
  const controlsStyle = "flex flex-col p-6 h-1/2 overflow-y-auto bg-white/10 backdrop-blur-md rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10";
  const buttonBase = "w-full py-6 mb-4 text-2xl font-bold rounded-xl border-2 border-white/50 transition-all focus:outline-none focus:ring-4 focus:ring-yellow-400 active:scale-95 shadow-lg relative overflow-hidden group";
  const primaryButton = `${buttonBase} bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400`;
  const secondaryButton = `${buttonBase} bg-white/20 text-white hover:bg-white/30 backdrop-blur`;
  const statusStyle = "text-xl mb-4 text-center font-mono text-blue-200";
  const instructionStyle = "text-2xl mt-4 text-center border-t border-white/20 pt-4 w-full font-semibold text-yellow-300 animate-pulse";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechRef.current = new SpeechSynthesisUtterance();
    }

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setError(null);
        },
        (err) => {
          console.error(err);
          setError(`Location error: ${err.message}`);
          speak(`Location error: ${err.message}`);
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  const speak = (text: string) => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      speechRef.current.text = text;
      window.speechSynthesis.speak(speechRef.current);
    }
  };

  const handleWhereAmI = async () => {
    if (!currentLocation) {
      const msg = "Searching for GPS signal. Please wait.";
      setAddress(msg);
      speak(msg);
      return;
    }

    setLoading(true);
    const msg = "Locating your position...";
    speak(msg);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}` 
      );
      const data = await response.json();

      if (data && data.display_name) {
        setAddress(data.display_name);
        const shortAddress = data.address.road ? `${data.address.road}, ${data.address.city || data.address.town}` : "current location";
        speak(`You are at: ${shortAddress}`);
      } else {
        throw new Error("Address not found");
      }
    } catch (err: any) {
      setError(err.message);
      speak("Sorry, I could not determine your address.");
    } finally {
      setLoading(false);
    }
  };

  const startTurnByTurnMock = () => {
    if (!destination.trim()) {
      speak("Please enter a destination first.");
      return;
    }

    setIsNavigating(!isNavigating);
    setSimulatedRouteActive(!simulatedRouteActive);
    
    if (!simulatedRouteActive) {
      speak(`Starting navigation to ${destination}.`);

      const instructions = [
        `Head towards ${destination}.`,
        "Continue straight for 100 meters.",
        "Turn right at the next intersection.",
        "Continue for 50 meters.",
        "Your destination is on the left.",
        `You have arrived at ${destination}.`
      ];

      setRouteInstructions(instructions);
      setCurrentInstructionIndex(0);

      instructions.forEach((instruction, index) => {
        setTimeout(() => {
          if (!simulatedRouteActive) return;
          setCurrentInstructionIndex(index);
          speak(instruction);
        }, index * 4000 + 1000);
      });
    } else {
      speak("Navigation stopped.");
      setIsNavigating(false);
      setRouteInstructions([]);
      setCurrentInstructionIndex(0);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
  };

  return (
    <div className={containerStyle} role="main" aria-label="Navigation Assistant">
      <div className={mapWrapperStyle} aria-hidden="true">
        {currentLocation ? (
          // @ts-ignore - types for dynamic imports
          <MapContainer center={[currentLocation.lat, currentLocation.lng]} zoom={18} style={{ height: '100%', width: '100%' }}>
            {/* @ts-ignore */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* @ts-ignore */}
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={iconPerson}>
              {/* @ts-ignore */}
              <Popup>You are here</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-black/50 text-white">
            <p className="text-2xl animate-pulse">Waiting for GPS...</p>
          </div>
        )}
      </div>

      <section className={controlsStyle} aria-label="Navigation Controls">
        <h1 className="text-3xl mb-6 text-white font-bold border-b border-white/20 pb-2 tracking-wide text-center">
          🧭 NAVIGATION ASSISTANT
        </h1>

        {error && (
          <div className="bg-red-500/90 text-white p-4 mb-4 rounded-xl border border-red-400 font-bold text-center" role="alert">
            {error}
          </div>
        )}

        <button
          onClick={handleWhereAmI}
          className={primaryButton}
          disabled={loading}
          aria-label="Get current location details"
          aria-live="polite"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              LOCATING...
            </span>
          ) : (
            "📍 WHERE AM I?"
          )}
        </button>

        <div className={statusStyle} role="status" aria-label="GPS Coordinates Status">
          {currentLocation ? (
            <p>GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
          ) : (
            <p>Acquiring Satellite Signal...</p>
          )}
        </div>

        {address && (
          <div className="bg-white/10 p-6 rounded-xl w-full text-center border border-white/20 mb-6 backdrop-blur-sm" role="status" aria-live="assertive">
            <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed">{address}</p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="destination" className="block text-xl font-semibold mb-3 text-yellow-300">
            DESTINATION
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={handleDestinationChange}
            placeholder="Enter destination..."
            className="w-full p-4 text-xl bg-white/20 border-2 border-white/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-transparent"
            aria-label="Destination input"
          />
        </div>

        {isNavigating && routeInstructions.length > 0 && (
          <div className="bg-green-500/20 p-6 rounded-xl w-full border-2 border-green-400 mb-6" role="status" aria-live="polite">
            <h3 className="text-xl font-bold mb-3 text-green-300">CURRENT ROUTE</h3>
            <div className="space-y-2">
              {routeInstructions.map((instruction, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg text-lg ${
                    index === currentInstructionIndex 
                      ? 'bg-green-500 text-white font-bold animate-pulse' 
                      : index < currentInstructionIndex 
                        ? 'bg-gray-600 text-gray-300 line-through' 
                        : 'bg-white/10 text-white'
                  }`}
                >
                  {index + 1}. {instruction}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={startTurnByTurnMock}
          className={secondaryButton}
          aria-label={simulatedRouteActive ? "Stop navigation" : "Start navigation"}
          aria-live="polite"
        >
          {simulatedRouteActive ? (
            <span className="flex items-center justify-center">
              🛑 STOP NAVIGATION
            </span>
          ) : (
            <span className="flex items-center justify-center">
              🧭 START NAVIGATION
            </span>
          )}
        </button>

        {simulatedRouteActive && (
          <div className={instructionStyle} role="status" aria-live="polite">
            <p>🗺️ Following route to {destination}...</p>
          </div>
        )}
      </section>
    </div>
  );
}
