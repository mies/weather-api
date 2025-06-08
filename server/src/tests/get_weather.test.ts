
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherTable } from '../db/schema';
import { type GetWeatherInput, type CreateWeatherInput } from '../schema';
import { getWeather } from '../handlers/get_weather';

// Test weather data
const testWeatherData: CreateWeatherInput = {
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
  feels_like: 14.8
};

const parisWeatherData: CreateWeatherInput = {
  city: 'Paris',
  country: 'FR',
  temperature: 18.2,
  humidity: 72,
  pressure: 1015.80,
  description: 'Clear sky',
  wind_speed: 2.1,
  wind_direction: 90,
  visibility: 15.0,
  uv_index: 6.2,
  feels_like: 17.5
};

describe('getWeather', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get weather data by city name', async () => {
    // Insert test weather data
    await db.insert(weatherTable)
      .values({
        city: testWeatherData.city,
        country: testWeatherData.country,
        temperature: testWeatherData.temperature.toString(),
        humidity: testWeatherData.humidity,
        pressure: testWeatherData.pressure.toString(),
        description: testWeatherData.description,
        wind_speed: testWeatherData.wind_speed.toString(),
        wind_direction: testWeatherData.wind_direction,
        visibility: testWeatherData.visibility.toString(),
        uv_index: testWeatherData.uv_index.toString(),
        feels_like: testWeatherData.feels_like.toString()
      })
      .execute();

    const input: GetWeatherInput = { city: 'London' };
    const result = await getWeather(input);

    // Verify all fields and numeric conversions
    expect(result.city).toEqual('London');
    expect(result.country).toEqual('GB');
    expect(result.temperature).toEqual(15.5);
    expect(typeof result.temperature).toBe('number');
    expect(result.humidity).toEqual(65);
    expect(result.pressure).toEqual(1013.25);
    expect(typeof result.pressure).toBe('number');
    expect(result.description).toEqual('Partly cloudy');
    expect(result.wind_speed).toEqual(3.2);
    expect(typeof result.wind_speed).toBe('number');
    expect(result.wind_direction).toEqual(180);
    expect(result.visibility).toEqual(10.0);
    expect(typeof result.visibility).toBe('number');
    expect(result.uv_index).toEqual(4.5);
    expect(typeof result.uv_index).toBe('number');
    expect(result.feels_like).toEqual(14.8);
    expect(typeof result.feels_like).toBe('number');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should get weather data by city and country', async () => {
    // Insert multiple cities with same name
    await db.insert(weatherTable)
      .values([
        {
          city: 'Paris',
          country: 'FR',
          temperature: parisWeatherData.temperature.toString(),
          humidity: parisWeatherData.humidity,
          pressure: parisWeatherData.pressure.toString(),
          description: parisWeatherData.description,
          wind_speed: parisWeatherData.wind_speed.toString(),
          wind_direction: parisWeatherData.wind_direction,
          visibility: parisWeatherData.visibility.toString(),
          uv_index: parisWeatherData.uv_index.toString(),
          feels_like: parisWeatherData.feels_like.toString()
        },
        {
          city: 'Paris',
          country: 'US',
          temperature: '22.0',
          humidity: 55,
          pressure: '1020.0',
          description: 'Sunny',
          wind_speed: '1.5',
          wind_direction: 45,
          visibility: '12.0',
          uv_index: '7.0',
          feels_like: '21.5'
        }
      ])
      .execute();

    const input: GetWeatherInput = { city: 'Paris', country: 'FR' };
    const result = await getWeather(input);

    expect(result.city).toEqual('Paris');
    expect(result.country).toEqual('FR');
    expect(result.temperature).toEqual(18.2);
    expect(result.description).toEqual('Clear sky');
  });

  it('should return most recent weather data when multiple records exist', async () => {
    const now = new Date();
    const oldDate = new Date(now.getTime() - 3600000); // 1 hour ago

    // Insert older record first
    await db.insert(weatherTable)
      .values({
        city: 'London',
        country: 'GB',
        temperature: '10.0',
        humidity: 80,
        pressure: '1000.0',
        description: 'Rainy',
        wind_speed: '5.0',
        wind_direction: 270,
        visibility: '5.0',
        uv_index: '1.0',
        feels_like: '8.0'
      })
      .execute();

    // Insert newer record
    await db.insert(weatherTable)
      .values({
        city: testWeatherData.city,
        country: testWeatherData.country,
        temperature: testWeatherData.temperature.toString(),
        humidity: testWeatherData.humidity,
        pressure: testWeatherData.pressure.toString(),
        description: testWeatherData.description,
        wind_speed: testWeatherData.wind_speed.toString(),
        wind_direction: testWeatherData.wind_direction,
        visibility: testWeatherData.visibility.toString(),
        uv_index: testWeatherData.uv_index.toString(),
        feels_like: testWeatherData.feels_like.toString()
      })
      .execute();

    const input: GetWeatherInput = { city: 'London' };
    const result = await getWeather(input);

    // Should return the newer record (partly cloudy, not rainy)
    expect(result.description).toEqual('Partly cloudy');
    expect(result.temperature).toEqual(15.5);
  });

  it('should throw error when weather data not found', async () => {
    const input: GetWeatherInput = { city: 'NonexistentCity' };

    await expect(getWeather(input)).rejects.toThrow(/weather data not found/i);
  });

  it('should throw error when city with specific country not found', async () => {
    // Insert Paris, FR
    await db.insert(weatherTable)
      .values({
        city: 'Paris',
        country: 'FR',
        temperature: '18.0',
        humidity: 70,
        pressure: '1015.0',
        description: 'Cloudy',
        wind_speed: '2.0',
        wind_direction: 90,
        visibility: '10.0',
        uv_index: '5.0',
        feels_like: '17.0'
      })
      .execute();

    // Try to get Paris, US (doesn't exist)
    const input: GetWeatherInput = { city: 'Paris', country: 'US' };

    await expect(getWeather(input)).rejects.toThrow(/weather data not found.*paris.*us/i);
  });
});
