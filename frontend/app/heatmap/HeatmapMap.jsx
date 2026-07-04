'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function HeatmapMap({ points }) {
  const getColor = (result) => {
    if (result === 'counterfeit') return '#ff4d6d'
    if (result === 'recalled') return '#ff9500'
    return '#c5c4de'
  }

  return (
    <MapContainer
      center={[30.3753, 69.3451]}
      zoom={5}
      style={{ height: '100%', width: '100%', background: '#0d0e13' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {points.map((point, i) => (
        <CircleMarker
          key={i}
          center={[point.lat, point.lng]}
          radius={12}
          fillColor={getColor(point.result)}
          color={getColor(point.result)}
          weight={2}
          opacity={0.9}
          fillOpacity={0.5}
        >
          <Popup>
            <div style={{ fontFamily: 'sans-serif', minWidth: '160px' }}>
              <p style={{ fontWeight: 700, color: getColor(point.result), marginBottom: '4px', textTransform: 'uppercase' }}>
                ⚠️ {point.result}
              </p>
              <p style={{ fontSize: '12px', marginBottom: '2px' }}>📍 {point.location}</p>
              <p style={{ fontSize: '12px', marginBottom: '2px' }}>Batch: {point.batch}</p>
              <p style={{ fontSize: '11px', color: '#666' }}>{new Date(point.date).toLocaleDateString()}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}