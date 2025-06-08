
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherTable } from '../db/schema';
import { type CreateWeatherInput } from '../schema';
import { getAllWeather } from '../handlers/get_all_weather';

// Test weather data
const testWeatherData: CreateWeatherInput = {
  city: 'London',
  country: 'GB',
  temperature: 15.5,
  humidity: 78,
  pressure: 1013.25,
  description: 'Partly cloudy',
  wind_speed: 3.2,
  wind_direction: 240,
  visibility: 10.0,
  uv_index: 4.5,
  feels_like: 16.2
};

const testWeatherData2: CreateWeatherInput = {
  city: 'Paris',
  country: 'FR',
  temperature: 18.0,
  humidity: 65,
  pressure: 1015.50,
  description: 'Clear sky',
  wind_speed: 2.1,
  wind_direction: 180,
  visibility: 15.0,
  uv_index: 6.0,
  feels_like: 19.5
};

describe('getAllWeather', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no weather data exists', async () => {
    const result = await getAllWeather();
    
    expect(result).toEqual([]);
  });

  it('should return all weather records', async () => {
    // Insert test data
    await db.insert(weatherTable)
      .values([
        {
          ...testWeatherData,
          temperature: testWeatherData.temperature.toString(),
          pressure: testWeatherData.pressure.toString(),
          wind_speed: testWeatherData.wind_speed.toString(),
          visibility: testWeatherData.visibility.toString(),
          uv_index: testWeatherData.uv_index.toString(),
          feels_like: testWeatherData.feels_like.toString()
        },
        {
          ...testWeatherData2,
          temperature: testWeatherData2.temperature.toString(),
          pressure: testWeatherData2.pressure.toString(),
          wind_speed: testWeatherData2.wind_speed.toString(),
          visibility: testWeatherData2.visibility.toString(),
          uv_index: testWeatherData2.uv_index.toString(),
          feels_like: testWeatherData2.feels_like.toString()
        }
      ])
      .execute();

    const result = await getAllWeather();

    expect(result).toHaveLength(2);
    
    // Check first weather record
    const londonWeather = result.find(w => w.city === 'London');
    expect(londonWeather).toBeDefined();
    expect(londonWeather!.country).toEqual('GB');
    expect(londonWeather!.temperature).toEqual(15.5);
    expect(londonWeather!.humidity).toEqual(78);
    expect(londonWeather!.pressure).toEqual(1013.25);
    expect(londonWeather!.description).toEqual('Partly cloudy');
    expect(londonWeather!.wind_speed).toEqual(3.2);
    expect(londonWeather!.wind_direction).toEqual(240);
    expect(londonWeather!.visibility).toEqual(10.0);
    expect(londonWeather!.uv_index).toEqual(4.5);
    expect(londonWeather!.feels_like).toEqual(16.2);
    expect(londonWeather!.id).toBeDefined();
    expect(londonWeather!.updated_at).toBeInstanceOf(Date);
    
    // Check second weather record
    const parisWeather = result.find(w => w.city === 'Paris');
    expect(parisWeather).toBeDefined();
    expect(parisWeather!.country).toEqual('FR');
    expect(parisWeather!.temperature).toEqual(18.0);
    expect(parisWeather!.humidity).toEqual(65);
    expect(parisWeather!.pressure).toEqual(1015.50);
    expect(parisWeather!.description).toEqual('Clear sky');
  });

  it('should return numeric types correctly', async () => {
    // Insert test data
    await db.insert(weatherTable)
      .values({
        ...testWeatherData,
        temperature: testWeatherData.temperature.toString(),
        pressure: testWeatherData.pressure.toString(),
        wind_speed: testWeatherData.wind_speed.toString(),
        visibility: testWeatherData.visibility.toString(),
        uv_index: testWeatherData.uv_index.toString(),
        feels_like: testWeatherData.feels_like.toString()
      })
      .execute();

    const result = await getAllWeather();

    expect(result).toHaveLength(1);
    
    const weather = result[0];
    // Verify all numeric fields are properly converted to numbers
    expect(typeof weather.temperature).toBe('number');
    expect(typeof weather.pressure).toBe('number');
    expect(typeof weather.wind_speed).toBe('number');
    expect(typeof weather.visibility).toBe('number');
    expect(typeof weather.uv_index).toBe('number');
    expect(typeof weather.feels_like).toBe('number');
    
    // Verify integer fields remain integers
    expect(typeof weather.humidity).toBe('number');
    expect(typeof weather.wind_direction).toBe('number');
    expect(typeof weather.id).toBe('number');
  });
});
