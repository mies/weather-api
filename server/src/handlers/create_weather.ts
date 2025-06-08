
import { db } from '../db';
import { weatherTable } from '../db/schema';
import { type CreateWeatherInput, type Weather } from '../schema';

export const createWeather = async (input: CreateWeatherInput): Promise<Weather> => {
  try {
    // Insert weather record
    const result = await db.insert(weatherTable)
      .values({
        city: input.city,
        country: input.country,
        temperature: input.temperature.toString(),
        humidity: input.humidity,
        pressure: input.pressure.toString(),
        description: input.description,
        wind_speed: input.wind_speed.toString(),
        wind_direction: input.wind_direction,
        visibility: input.visibility.toString(),
        uv_index: input.uv_index.toString(),
        feels_like: input.feels_like.toString()
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const weather = result[0];
    return {
      ...weather,
      temperature: parseFloat(weather.temperature),
      pressure: parseFloat(weather.pressure),
      wind_speed: parseFloat(weather.wind_speed),
      visibility: parseFloat(weather.visibility),
      uv_index: parseFloat(weather.uv_index),
      feels_like: parseFloat(weather.feels_like)
    };
  } catch (error) {
    console.error('Weather creation failed:', error);
    throw error;
  }
};
