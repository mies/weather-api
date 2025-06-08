
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Weather, GetWeatherInput } from '../../server/src/schema';

function App() {
  const [allWeather, setAllWeather] = useState<Weather[]>([]);
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchData, setSearchData] = useState<GetWeatherInput>({
    city: '',
    country: undefined
  });

  const loadAllWeather = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getAllWeather.query();
      setAllWeather(result);
    } catch (error) {
      console.error('Failed to load weather data:', error);
      setError('Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllWeather();
  }, [loadAllWeather]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.city.trim()) return;

    setSearchLoading(true);
    setError(null);
    try {
      const result = await trpc.getWeather.query(searchData);
      setCurrentWeather(result);
    } catch (error) {
      console.error('Failed to search weather:', error);
      setError('City not found or weather data unavailable');
      setCurrentWeather(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('storm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    return '🌤️';
  };

  const getUVBadgeColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'bg-green-500';
    if (uvIndex <= 5) return 'bg-yellow-500';
    if (uvIndex <= 7) return 'bg-orange-500';
    if (uvIndex <= 10) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const getUVDescription = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const WeatherCard = ({ weather }: { weather: Weather }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon(weather.description)}
              {weather.city}, {weather.country}
            </CardTitle>
            <CardDescription className="capitalize">
              {weather.description}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-sm text-gray-500">
              Feels like {Math.round(weather.feels_like)}°C
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Humidity:</span>
              <span className="font-medium">{weather.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pressure:</span>
              <span className="font-medium">{weather.pressure} hPa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Visibility:</span>
              <span className="font-medium">{weather.visibility} km</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Wind:</span>
              <span className="font-medium">
                {weather.wind_speed} m/s {getWindDirection(weather.wind_direction)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">UV Index:</span>
              <Badge className={`${getUVBadgeColor(weather.uv_index)} text-white`}>
                {weather.uv_index} {getUVDescription(weather.uv_index)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Updated:</span>
              <span className="font-medium text-xs">
                {weather.updated_at.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌤️ Weather Dashboard
          </h1>
          <p className="text-gray-600">
            Get current weather conditions for any city worldwide
          </p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="search">🔍 Search Weather</TabsTrigger>
            <TabsTrigger value="all">🌍 All Cities</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Weather by City</CardTitle>
                <CardDescription>
                  Enter a city name to get current weather conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter city name (e.g., London, Paris, Tokyo)"
                      value={searchData.city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchData((prev: GetWeatherInput) => ({ 
                          ...prev, 
                          city: e.target.value 
                        }))
                      }
                      className="flex-1"
                      required
                    />
                    <Input
                      placeholder="Country (optional, e.g., GB, FR)"
                      value={searchData.country || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchData((prev: GetWeatherInput) => ({ 
                          ...prev, 
                          country: e.target.value.toUpperCase() || undefined
                        }))
                      }
                      className="w-32"
                      maxLength={2}
                    />
                    <Button type="submit" disabled={searchLoading}>
                      {searchLoading ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    {error}
                  </div>
                )}

                {currentWeather && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Search Results:</h3>
                    <WeatherCard weather={currentWeather} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                All Weather Data
              </h2>
              <Button onClick={loadAllWeather} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : '🔄 Refresh'}
              </Button>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allWeather.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Weather Data Available
                  </h3>
                  <p className="text-gray-500">
                    Search for a city to see weather information here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allWeather.map((weather: Weather) => (
                  <WeatherCard key={weather.id} weather={weather} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
