
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherTable } from '../db/schema';
import { type CreateWeatherInput } from '../schema';
import { createWeather } from '../handlers/create_weather';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateWeatherInput = {
  city: 'London',
  country: 'GB',
  temperature: 15.5,
  humidity: 65,
  pressure: 1013.25,
  description: 'Partly cloudy',
  wind_speed: 3.2,
  wind_direction: 180,
  visibility: 10.0,
  uv_index: 4.5,
  feels_like: 14.2
};

describe('createWeather', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a weather record', async () => {
    const result = await createWeather(testInput);

    // Basic field validation
    expect(result.city).toEqual('London');
    expect(result.country).toEqual('GB');
    expect(result.temperature).toEqual(15.5);
    expect(result.humidity).toEqual(65);
    expect(result.pressure).toEqual(1013.25);
    expect(result.description).toEqual('Partly cloudy');
    expect(result.wind_speed).toEqual(3.2);
    expect(result.wind_direction).toEqual(180);
    expect(result.visibility).toEqual(10.0);
    expect(result.uv_index).toEqual(4.5);
    expect(result.feels_like).toEqual(14.2);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save weather data to database', async () => {
    const result = await createWeather(testInput);

    // Query the database to verify data was saved
    const weatherRecords = await db.select()
      .from(weatherTable)
      .where(eq(weatherTable.id, result.id))
      .execute();

    expect(weatherRecords).toHaveLength(1);
    const saved = weatherRecords[0];
    
    expect(saved.city).toEqual('London');
    expect(saved.country).toEqual('GB');
    expect(parseFloat(saved.temperature)).toEqual(15.5);
    expect(saved.humidity).toEqual(65);
    expect(parseFloat(saved.pressure)).toEqual(1013.25);
    expect(saved.description).toEqual('Partly cloudy');
    expect(parseFloat(saved.wind_speed)).toEqual(3.2);
    expect(saved.wind_direction).toEqual(180);
    expect(parseFloat(saved.visibility)).toEqual(10.0);
    expect(parseFloat(saved.uv_index)).toEqual(4.5);
    expect(parseFloat(saved.feels_like)).toEqual(14.2);
    expect(saved.updated_at).toBeInstanceOf(Date);
  });

  it('should handle numeric type conversions correctly', async () => {
    const result = await createWeather(testInput);

    // Verify all numeric fields are returned as numbers, not strings
    expect(typeof result.temperature).toBe('number');
    expect(typeof result.pressure).toBe('number');
    expect(typeof result.wind_speed).toBe('number');
    expect(typeof result.visibility).toBe('number');
    expect(typeof result.uv_index).toBe('number');
    expect(typeof result.feels_like).toBe('number');
    
    // Verify integer fields remain as integers
    expect(typeof result.humidity).toBe('number');
    expect(typeof result.wind_direction).toBe('number');
    expect(Number.isInteger(result.humidity)).toBe(true);
    expect(Number.isInteger(result.wind_direction)).toBe(true);
  });

  it('should create weather with extreme values', async () => {
    const extremeInput: CreateWeatherInput = {
      city: 'Antarctica Base',
      country: 'AQ',
      temperature: -89.2, // Record low temperature
      humidity: 0,
      pressure: 870.0, // Very low pressure
      description: 'Clear and extremely cold',
      wind_speed: 0.0,
      wind_direction: 0,
      visibility: 50.0,
      uv_index: 0.0,
      feels_like: -95.0
    };

    const result = await createWeather(extremeInput);

    expect(result.temperature).toEqual(-89.2);
    expect(result.humidity).toEqual(0);
    expect(result.pressure).toEqual(870.0);
    expect(result.wind_speed).toEqual(0.0);
    expect(result.wind_direction).toEqual(0);
    expect(result.uv_index).toEqual(0.0);
    expect(result.feels_like).toEqual(-95.0);
  });
});
