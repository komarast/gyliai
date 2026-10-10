'use client';

import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [23.8813, 55.1694], // Center of Lithuania
      zoom: 7,
    });

    mapInstance.current = map;

    map.on('load', () => {
      // WMS Layer for Bathymetry. 
      // Note: Update the LAYERS parameter with the exact layer name from Geoportal.lt
      map.addSource('bathymetry-wms', {
        type: 'raster',
        tiles: [
          'https://www.geoportal.lt/mapproxy/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX={bbox-epsg-3857}&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&LAYERS=batimetrija&STYLES=&FORMAT=image/png&TRANSPARENT=true'
        ],
        tileSize: 256
      });

      map.addLayer({
        id: 'bathymetry-layer',
        type: 'raster',
        source: 'bathymetry-wms',
        paint: {
          'raster-opacity': 0.7
        }
      });

      // Fetch and display Measurement Stations from meteo.lt
      fetch('/api/stations')
        .then((res) => res.json())
        .then((data) => {
          if (!data || !Array.isArray(data)) return;
          
          data.forEach((station: any) => {
            if (station.coordinates && station.coordinates.latitude && station.coordinates.longitude) {
              const el = document.createElement('div');
              el.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer';
              
              const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
                <div class="p-2 text-black">
                  <h3 class="font-bold text-lg">${station.name || 'Station'}</h3>
                  <p class="text-sm">ID: ${station.code || 'N/A'}</p>
                </div>
              `);

              new maplibregl.Marker(el)
                .setLngLat([station.coordinates.longitude, station.coordinates.latitude])
                .setPopup(popup)
                .addTo(map);
            }
          });
        })
        .catch((err) => console.error('Failed to fetch stations:', err));
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapContainer} className="w-full h-screen" />;
}
