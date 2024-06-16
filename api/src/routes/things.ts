import { StatusCodes, reasonPhrase } from '../types/status-codes.js';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  otherThingsToday,
  userThingsTodayAll,
  userThingsToday,
  userThingsAll,
  thingDetails,
  createThing
} from './things.definition.js';
import { zodErrorHandler } from '../utils/errors.js';
import { ThingService } from '../services/thing.service.js';

const thingService = new ThingService();

export const thingRouter = new OpenAPIHono({ defaultHook: zodErrorHandler })
  .openapi(userThingsToday, async (c) => {
    const userId = c.get('jwtPayload').id;
    const things = await thingService.getUserThingsToday(userId, 3);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(userThingsTodayAll, async (c) => {
    const userId = c.get('jwtPayload').id;
    const things = await thingService.getUserThingsToday(userId);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(userThingsAll, async (c) => {
    const userId = c.get('jwtPayload').id;
    const things = await thingService.getUserThings(userId);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(otherThingsToday, async (c) => {
    const userId = c.get('jwtPayload').id;
    const things = await thingService.getOthersThingsToday(userId);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(thingDetails, async (c) => {
    const userId = c.get('jwtPayload').id;
    const thingId = c.req.param('uuid');
    const thingsDetails = await thingService.getDetails(userId, thingId);
    return c.json(thingsDetails, StatusCodes.OK);
  })

  .openapi(createThing, async (c) => {
    const userId = c.get('jwtPayload').id;
    const body = c.req.valid('json');
    await thingService.create(userId, body);
    return c.text(reasonPhrase(StatusCodes.CREATED), StatusCodes.CREATED);
  });
