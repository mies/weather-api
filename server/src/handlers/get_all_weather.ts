
import { db } from '../db';
import { weatherTable } from '../db/schema';
import { type Weather } from '../schema';

export const getAllWeather = async (): Promise<Weather[]> => {
  try {
    const results = await db.select()
      .from(weatherTable)
      .execute();

    // Convert numeric fields back to numbers for schema compliance
    return results.map(weather => ({
      ...weather,
      temperature: parseFloat(weather.temperature),
      pressure: parseFloat(weather.pressure),
      wind_speed: parseFloat(weather.wind_speed),
      visibility: parseFloat(weather.visibility),
      uv_index: parseFloat(weather.uv_index),
      feels_like: parseFloat(weather.feels_like)
    }));
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
};
