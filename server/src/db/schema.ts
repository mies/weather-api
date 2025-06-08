
import { serial, text, pgTable, timestamp, numeric, integer, varchar } from 'drizzle-orm/pg-core';

export const weatherTable = pgTable('weather', {
  id: serial('id').primaryKey(),
  city: varchar('city', { length: 100 }).notNull(),
  country: varchar('country', { length: 2 }).notNull(), // ISO 3166-1 alpha-2 country code
  temperature: numeric('temperature', { precision: 5, scale: 2 }).notNull(), // -99.99 to 99.99 Celsius
  humidity: integer('humidity').notNull(), // 0-100 percentage
  pressure: numeric('pressure', { precision: 7, scale: 2 }).notNull(), // atmospheric pressure in hPa
  description: text('description').notNull(), // weather description
  wind_speed: numeric('wind_speed', { precision: 5, scale: 2 }).notNull(), // wind speed in m/s
  wind_direction: integer('wind_direction').notNull(), // wind direction in degrees 0-360
  visibility: numeric('visibility', { precision: 5, scale: 2 }).notNull(), // visibility in km
  uv_index: numeric('uv_index', { precision: 3, scale: 1 }).notNull(), // UV index 0.0-11.0
  feels_like: numeric('feels_like', { precision: 5, scale: 2 }).notNull(), // apparent temperature in Celsius
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Weather = typeof weatherTable.$inferSelect; // For SELECT operations
export type NewWeather = typeof weatherTable.$inferInsert; // For INSERT operations

// Export all tables for proper query building
export const tables = { weather: weatherTable };
