
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { getWeatherInputSchema, createWeatherInputSchema } from './schema';
import { getWeather } from './handlers/get_weather';
import { getAllWeather } from './handlers/get_all_weather';
import { createWeather } from './handlers/create_weather';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  getWeather: publicProcedure
    .input(getWeatherInputSchema)
    .query(({ input }) => getWeather(input)),
  getAllWeather: publicProcedure
    .query(() => getAllWeather()),
  createWeather: publicProcedure
    .input(createWeatherInputSchema)
    .mutation(({ input }) => createWeather(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
