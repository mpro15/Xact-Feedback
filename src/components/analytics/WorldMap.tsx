import React, { useState, useEffect } from 'react';
import { Globe, Download } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const WorldMap: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [cityData, setCityData] = useState<Record<string, any[]>>({});
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocationData() {
      setLoading(true);
      setError(null);
      // Get current user and company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (!profile?.company_id) {
        setError('No company found');
        setLoading(false);
        return;
      }
      // Fetch all candidates for aggregation
      const { data: candidates, error: candidateError } = await supabase
        .from('candidates')
        .select('country,city')
        .eq('company_id', profile.company_id);
      if (candidateError) {
        setError(candidateError.message);
        setLoading(false);
        return;
      }
      // Aggregate country and city data
      const countryMap: Record<string, { name: string; candidates: number; cities: Record<string, number>; } > = {};
      let total = 0;
      candidates.forEach((c: any) => {
        const country = c.country || 'Unknown';
        const city = c.city || 'Unknown';
        if (!countryMap[country]) {
          countryMap[country] = { name: country, candidates: 0, cities: {} };
        }
        countryMap[country].candidates++;
        countryMap[country].cities[city] = (countryMap[country].cities[city] || 0) + 1;
        total++;
      });
      // Format countryData and cityData
      const countryArr = Object.values(countryMap).map((country) => ({
        name: country.name,
        candidates: country.candidates,
        percentage: total ? ((country.candidates / total) * 100).toFixed(1) : 0,
        intensity: country.candidates, // Use raw count for heatmap
      }));
      const cityObj: Record<string, any[]> = {};
      Object.values(countryMap).forEach((country) => {
        cityObj[country.name] = Object.entries(country.cities).map(([city, count]) => ({
          name: city,
          candidates: count,
          percentage: country.candidates ? ((count / country.candidates) * 100).toFixed(1) : 0,
        }));
      });
      setCountryData(countryArr);
      setCityData(cityObj);
      setTotalCandidates(total);
      setLoading(false);
    }
    fetchLocationData();
  }, []);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
          <span className="font-bold text-gray-800">{totalCandidates.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};