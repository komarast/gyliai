'use client';

import { useRef, useEffect, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LITHUANIAN_WATERS, LakeData } from '@/data/lakes';

// Ensure worker URL is explicitly set for MapLibre 6+ in Next.js
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

interface HydroStation {
  code: string;
  name: string;
  waterBody: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  const [stations, setStations] = useState<HydroStation[]>([]);
  const [selectedItem, setSelectedItem] = useState<{
    title: string;
    type: string;
    details: string;
    subDetails?: string;
    liveLevel?: string;
    coords: [number, number];
  } | null>(null);

  const [filter, setFilter] = useState<'all' | 'lake' | 'reservoir' | 'station'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSeamap, setShowSeamap] = useState(true);

  const lakeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Fetch hydro stations
  useEffect(() => {
    fetch('/api/stations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStations(data);
        }
      })
      .catch((err) => console.error('Failed to load hydro stations:', err));
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          },
          'openseamap': {
            type: 'raster',
            tiles: [
              'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          },
          {
            id: 'openseamap-layer',
            type: 'raster',
            source: 'openseamap',
            minzoom: 8,
            maxzoom: 18,
            layout: {
              visibility: 'visible'
            }
          }
        ]
      },
      center: [23.8813, 55.1694], // Centras: Lietuva
      zoom: 7.2,
      maxBounds: [
        [20.0, 53.5], // SW
        [27.5, 56.8]  // NE
      ]
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Toggle OpenSeaMap layer
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('openseamap-layer')) {
      map.setLayoutProperty('openseamap-layer', 'visibility', showSeamap ? 'visible' : 'none');
    }
  }, [showSeamap]);

  // Update Lake Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear previous lake markers
    lakeMarkersRef.current.forEach(m => m.remove());
    lakeMarkersRef.current = [];

    if (filter === 'station') return;

    const filteredLakes = LITHUANIAN_WATERS.filter(item => {
      const matchType = filter === 'all' || item.type === filter;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });

    filteredLakes.forEach(lake => {
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';
      
      const isReservoir = lake.type === 'reservoir';
      const bgColor = isReservoir ? 'bg-amber-600' : 'bg-blue-600';
      const labelType = isReservoir ? 'Tvenkinys' : lake.type === 'lagoon' ? 'Marios' : 'Ežeras';

      el.innerHTML = `
        <div class="flex items-center gap-1 ${bgColor} text-white px-2 py-1 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform">
          <span class="text-xs font-bold whitespace-nowrap">${lake.name}</span>
          <span class="bg-white/20 text-[10px] px-1 rounded font-semibold">${lake.maxDepth}m</span>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedItem({
          title: lake.name,
          type: labelType,
          details: `Didžiausias gylis: ${lake.maxDepth} m ${lake.avgDepth ? `| Vidutinis: ${lake.avgDepth} m` : ''}`,
          subDetails: `Plotas: ${lake.areaKm2} km² | Vieta: ${lake.location}. ${lake.description || ''}`,
          coords: lake.coordinates
        });

        map.flyTo({
          center: lake.coordinates,
          zoom: 12,
          speed: 1.2
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(lake.coordinates)
        .addTo(map);

      lakeMarkersRef.current.push(marker);
    });
  }, [filter, searchQuery]);

  // Update Hydro Stations Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear previous station markers
    stationMarkersRef.current.forEach(m => m.remove());
    stationMarkersRef.current = [];

    if (filter === 'lake' || filter === 'reservoir') return;

    const filteredStations = stations.filter(station => {
      return (
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.waterBody.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    filteredStations.forEach(station => {
      if (!station.coordinates?.latitude || !station.coordinates?.longitude) return;

      const el = document.createElement('div');
      el.className = 'cursor-pointer p-1';
      el.innerHTML = `
        <div class="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-md hover:scale-125 transition-transform flex items-center justify-center title="${station.waterBody} (${station.name})">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedItem({
          title: `${station.waterBody} - ${station.name}`,
          type: 'Upių hidrologinė stotis (LHMT)',
          details: `Telkinys / Upė: ${station.waterBody}`,
          subDetails: `Stoties kodas: ${station.code}. Kraunami realaus laiko duomenys...`,
          coords: [station.coordinates.longitude, station.coordinates.latitude]
        });

        map.flyTo({
          center: [station.coordinates.longitude, station.coordinates.latitude],
          zoom: 11,
          speed: 1.2
        });

        // Fetch live water level for this station
        fetch(`/api/stations/${station.code}`)
          .then(res => res.json())
          .then(data => {
            if (data?.observations && data.observations.length > 0) {
              const latest = data.observations[data.observations.length - 1];
              setSelectedItem(prev => prev ? {
                ...prev,
                liveLevel: `Vandens lygis: ${latest.waterLevel ?? 'N/A'} cm | Temperatūra: ${latest.waterTemperature ?? 'N/A'}°C (${latest.observationTimeUtc})`
              } : null);
            } else {
              setSelectedItem(prev => prev ? {
                ...prev,
                liveLevel: 'Nėra naujausių matavimo duomenų šiai dienai.'
              } : null);
            }
          })
          .catch(() => {
            setSelectedItem(prev => prev ? {
              ...prev,
              liveLevel: 'Nepavyko gauti vandens lygio duomenų.'
            } : null);
          });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([station.coordinates.longitude, station.coordinates.latitude])
        .addTo(map);

      stationMarkersRef.current.push(marker);
    });
  }, [stations, filter, searchQuery]);

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans">
      {/* Top Header & Search */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm sm:max-w-md w-full">
        <div className="bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-blue-900 tracking-tight flex items-center gap-2">
              🌊 Lietuvos vandenų gyliai
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              Batimetrija & Upės
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Ieškoti ežero, tvenkinio ar upės..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Visi ({LITHUANIAN_WATERS.length + stations.length})
            </button>
            <button
              onClick={() => setFilter('lake')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'lake' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Ežerai ({LITHUANIAN_WATERS.filter(l => l.type === 'lake').length})
            </button>
            <button
              onClick={() => setFilter('reservoir')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'reservoir' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Tvenkiniai ({LITHUANIAN_WATERS.filter(l => l.type === 'reservoir').length})
            </button>
            <button
              onClick={() => setFilter('station')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'station' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Upių stotys ({stations.length})
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 overflow-x-auto pt-1 border-t border-gray-100">
            <span className="font-semibold text-gray-400">Greita:</span>
            <button
              onClick={() => {
                mapInstance.current?.flyTo({ center: [25.8617, 55.4461], zoom: 12 });
              }}
              className="hover:text-blue-600 underline whitespace-nowrap"
            >
              Tauragnas (62.5m)
            </button>
            <span>•</span>
            <button
              onClick={() => {
                mapInstance.current?.flyTo({ center: [24.1500, 54.8667], zoom: 11 });
              }}
              className="hover:text-blue-600 underline whitespace-nowrap"
            >
              Kauno marios
            </button>
            <span>•</span>
            <button
              onClick={() => {
                mapInstance.current?.flyTo({ center: [21.1500, 55.4500], zoom: 9 });
              }}
              className="hover:text-blue-600 underline whitespace-nowrap"
            >
              Kuršių marios
            </button>
          </div>
        </div>

        {/* Selected Info Card */}
        {selectedItem && (
          <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border border-blue-100 flex flex-col gap-2 relative animate-fade-in">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {selectedItem.type}
            </span>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              {selectedItem.title}
            </h2>
            <div className="text-sm font-semibold text-blue-900 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100/50">
              {selectedItem.details}
            </div>
            {selectedItem.liveLevel && (
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                📊 {selectedItem.liveLevel}
              </div>
            )}
            {selectedItem.subDetails && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedItem.subDetails}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Layer Toggles & Legend */}
      <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-3 border border-gray-100 flex items-center gap-3 text-xs font-medium text-gray-700">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSeamap}
              onChange={(e) => setShowSeamap(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>OpenSeaMap Navigacija & Gyliai</span>
          </label>
        </div>

        <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-3 border border-gray-100 flex flex-col gap-1 text-[11px] text-gray-600">
          <div className="font-semibold text-gray-800 mb-0.5">Sutartiniai ženklai:</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white shadow-sm"></span>
            <span>Ežeras (maksimalus gylis)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block border border-white shadow-sm"></span>
            <span>Tvenkinys (rezervuaras)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-white shadow-sm"></span>
            <span>Upių matavimo stotis (LHMT)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}
