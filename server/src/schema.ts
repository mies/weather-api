
import { z } from 'zod';

// Weather condition schema
export const weatherSchema = z.object({
  id: z.number(),
  city: z.string(),
  country: z.string(),
  temperature: z.number(), // in Celsius
  humidity: z.number().int().min(0).max(100), // percentage
  pressure: z.number(), // in hPa
  description: z.string(),
  wind_speed: z.number(), // in m/s
  wind_direction: z.number().int().min(0).max(360), // degrees
  visibility: z.number(), // in km
  uv_index: z.number().min(0).max(11), // UV index scale
  feels_like: z.number(), // apparent temperature in Celsius
  updated_at: z.coerce.date()
});

export type Weather = z.infer<typeof weatherSchema>;

// Input schema for getting weather by city
export const getWeatherInputSchema = z.object({
  city: z.string().min(1).trim(),
  country: z.string().min(2).max(2).optional() // ISO 3166-1 alpha-2 country code
});

export type GetWeatherInput = z.infer<typeof getWeatherInputSchema>;

// Input schema for creating/updating weather data
export const createWeatherInputSchema = z.object({
  city: z.string().min(1).trim(),
  country: z.string().min(2).max(2),
  temperature: z.number(),
  humidity: z.number().int().min(0).max(100),
  pressure: z.number().positive(),
  description: z.string().min(1),
  wind_speed: z.number().nonnegative(),
  wind_direction: z.number().int().min(0).max(360),
  visibility: z.number().nonnegative(),
  uv_index: z.number().min(0).max(11),
  feels_like: z.number()
});

export type CreateWeatherInput = z.infer<typeof createWeatherInputSchema>;
