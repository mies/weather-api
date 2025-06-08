
import { db } from '../db';
import { weatherTable } from '../db/schema';
import { type GetWeatherInput, type Weather } from '../schema';
import { eq, and, desc, type SQL } from 'drizzle-orm';

export const getWeather = async (input: GetWeatherInput): Promise<Weather> => {
  try {
    // Collect conditions
    const conditions: SQL<unknown>[] = [];
    conditions.push(eq(weatherTable.city, input.city));

    if (input.country) {
      conditions.push(eq(weatherTable.country, input.country));
    }

    // Build and execute query in a single chain
    const results = await db.select()
      .from(weatherTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(weatherTable.updated_at))
      .limit(1)
      .execute();

    if (results.length === 0) {
      throw new Error(`Weather data not found for city: ${input.city}${input.country ? `, ${input.country}` : ''}`);
    }

    const weather = results[0];

    // Convert numeric fields back to numbers
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
    console.error('Get weather failed:', error);
    throw error;
  }
};
