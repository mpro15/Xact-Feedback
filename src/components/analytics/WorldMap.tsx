import React, { useState } from 'react';
import { Globe, Filter, Download } from 'lucide-react';

export const WorldMap: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const countryData = [
    { name: 'United States', candidates: 1247, percentage: 45.8, intensity: 100, lat: 39.8283, lng: -98.5795 },
    { name: 'United Kingdom', candidates: 456, percentage: 16.7, intensity: 37, lat: 55.3781, lng: -3.4360 },
    { name: 'Canada', candidates: 234, percentage: 8.6, intensity: 19, lat: 56.1304, lng: -106.3468 },
    { name: 'Australia', candidates: 189, percentage: 6.9, intensity: 15, lat: -25.2744, lng: 133.7751 },
    { name: 'Germany', candidates: 156, percentage: 5.7, intensity: 13, lat: 51.1657, lng: 10.4515 },
    { name: 'France', candidates: 123, percentage: 4.5, intensity: 10, lat: 46.2276, lng: 2.2137 },
    { name: 'India', candidates: 98, percentage: 3.6, intensity: 8, lat: 20.5937, lng: 78.9629 },
    { name: 'Netherlands', candidates: 67, percentage: 2.5, intensity: 5, lat: 52.1326, lng: 5.2913 }
  ];

  const cityData = {
    'United States': [
      { name: 'New York', candidates: 345, percentage: 27.7, lat: 40.7128, lng: -74.0060 },
      { name: 'San Francisco', candidates: 298, percentage: 23.9, lat: 37.7749, lng: -122.4194 },
      { name: 'Los Angeles', candidates: 234, percentage: 18.8, lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', candidates: 189, percentage: 15.2, lat: 41.8781, lng: -87.6298 },
      { name: 'Boston', candidates: 181, percentage: 14.5, lat: 42.3601, lng: -71.0589 }
    ],
    'United Kingdom': [
      { name: 'London', candidates: 298, percentage: 65.4, lat: 51.5074, lng: -0.1278 },
      { name: 'Manchester', candidates: 67, percentage: 14.7, lat: 53.4808, lng: -2.2426 },
      { name: 'Birmingham', candidates: 45, percentage: 9.9, lat: 52.4862, lng: -1.8904 },
      { name: 'Edinburgh', candidates: 46, percentage: 10.1, lat: 55.9533, lng: -3.1883 }
    ],
    'Canada': [
      { name: 'Toronto', candidates: 123, percentage: 52.6, lat: 43.6532, lng: -79.3832 },
      { name: 'Vancouver', candidates: 67, percentage: 28.6, lat: 49.2827, lng: -123.1207 },
      { name: 'Montreal', candidates: 44, percentage: 18.8, lat: 45.5017, lng: -73.5673 }
    ]
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'from-primary-700 to-primary-500';
    if (intensity >= 60) return 'from-primary-600 to-primary-400';
    if (intensity >= 40) return 'from-primary-500 to-primary-300';
    if (intensity >= 20) return 'from-primary-400 to-primary-200';
    if (intensity >= 10) return 'from-primary-300 to-primary-100';
    return 'from-primary-200 to-primary-50';
  };

  const getHeatmapSize = (intensity: number) => {
    if (intensity >= 80) return 'w-8 h-8';
    if (intensity >= 60) return 'w-7 h-7';
    if (intensity >= 40) return 'w-6 h-6';
    if (intensity >= 20) return 'w-5 h-5';
    if (intensity >= 10) return 'w-4 h-4';
    return 'w-3 h-3';
  };

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(selectedCountry === countryName ? null : countryName);
    setSelectedCity(null);
  };

  const exportData = () => {
    const csvContent = countryData.map(country => 
      `${country.name},${country.candidates},${country.percentage}%`
    ).join('\n');
    
    const blob = new Blob([`Country,Candidates,Percentage\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geographic_distribution.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="neumorphic-chart">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Geographic Distribution</h3>
          <p className="text-sm text-gray-600">Candidate feedback by location</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportData}
            className="neumorphic-btn p-2"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <Globe className="w-6 h-6 text-primary-600" />
        </div>
      </div>

      {/* World Map Visualization */}
      <div className="mb-6">
        <div className="neumorphic-world-map min-h-[400px] relative overflow-hidden">
          {/* World Map Background */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Simplified world map outline */}
              <path d="M150,200 Q200,180 250,200 L300,190 Q350,200 400,210 L450,200 Q500,190 550,200 L600,210 Q650,200 700,190 L750,200 Q800,210 850,200" 
                    stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M200,250 Q250,240 300,250 L350,240 Q400,250 450,260 L500,250 Q550,240 600,250 L650,260 Q700,250 750,240" 
                    stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M100,300 Q150,290 200,300 L250,290 Q300,300 350,310 L400,300 Q450,290 500,300 L550,310 Q600,300 650,290" 
                    stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Heatmap Points */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="grid grid-cols-4 gap-8 w-full max-w-4xl">
              {countryData.slice(0, 8).map((country, index) => (
                <div
                  key={index}
                  onClick={() => handleCountryClick(country.name)}
                  className={`relative cursor-pointer transform hover:scale-110 transition-all duration-300 ${
                    selectedCountry === country.name ? 'scale-125' : ''
                  }`}
                  style={{
                    gridColumn: `${(index % 4) + 1}`,
                    gridRow: `${Math.floor(index / 4) + 1}`
                  }}
                >
                  <div className={`${getHeatmapSize(country.intensity)} bg-gradient-to-r ${getIntensityColor(country.intensity)} neumorphic-heatmap-point mx-auto`} />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-xs font-medium text-gray-700 whitespace-nowrap">{country.name}</p>
                    <p className="text-xs text-gray-500">{country.candidates}</p>
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 neumorphic-notification text-xs opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {country.name}: {country.candidates} candidates ({country.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Heatmap Legend */}
          <div className="absolute bottom-4 left-4">
            <div className="neumorphic-card p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Candidate Density</p>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">Low</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-200 to-primary-50 rounded-full shadow-neumorphic-sm"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-300 to-primary-100 rounded-full shadow-neumorphic-sm"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-200 rounded-full shadow-neumorphic-sm"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full shadow-neumorphic-sm"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-neumorphic-sm"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-primary-700 to-primary-500 rounded-full shadow-neumorphic-sm"></div>
                </div>
                <span className="text-xs text-gray-500">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Country Data */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Countries</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {countryData.map((country, index) => (
            <div
              key={index}
              onClick={() => handleCountryClick(country.name)}
              className={`neumorphic-btn p-3 cursor-pointer transition-all ${
                selectedCountry === country.name
                  ? 'shadow-neumorphic-inset bg-primary-100'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getIntensityColor(country.intensity)} shadow-neumorphic-sm`} />
                  <span className="text-sm font-medium text-gray-800">{country.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">{country.candidates.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">{country.percentage}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* City Data */}
        {selectedCountry && cityData[selectedCountry as keyof typeof cityData] && (
          <div className="mt-6 neumorphic-card p-4">
            <h5 className="font-semibold text-gray-800 mb-3">Major Cities in {selectedCountry}</h5>
            <div className="space-y-2">
              {cityData[selectedCountry as keyof typeof cityData].map((city, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
                  className={`neumorphic-btn p-3 cursor-pointer transition-all ${
                    selectedCity === city.name
                      ? 'shadow-neumorphic-inset bg-primary-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{city.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">{city.candidates}</div>
                      <div className="text-xs text-gray-600">{city.percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-shadow/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Total Candidates</span>
          <span className="font-bold text-gray-800">2,727</span>
        </div>
      </div>
    </div>
  );
};