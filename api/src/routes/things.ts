import { StatusCodes, reasonPhrase } from '../types/status-codes.js';
import {
  getUserThingsToday,
  getOthersThingsToday,
  getUserThings,
  getThingDetails,
  createThing as repoCreateThing
} from '../repositories/things.js';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  otherThingsToday,
  userThingsTodayAll,
  userThingsToday,
  userThingsAll,
  thingDetails,
  createThing
} from './things.definition.js';

export const thingRouter = new OpenAPIHono()
  .openapi(userThingsToday, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const things = await getUserThingsToday(user_uuid, 3);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(userThingsTodayAll, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const things = await getUserThingsToday(user_uuid);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(userThingsAll, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const things = await getUserThings(user_uuid);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(otherThingsToday, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const things = await getOthersThingsToday(user_uuid);
    return c.json(things, StatusCodes.OK);
  })

  .openapi(thingDetails, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const thing_uuid = c.req.param('uuid');
    const thingsDetails = await getThingDetails(user_uuid, thing_uuid);
    return c.json(thingsDetails, StatusCodes.OK);
  })

  .openapi(createThing, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const { name, description, occurances, sharedUsernames } =
      c.req.valid('json');
    await repoCreateThing(
      user_uuid,
      name,
      description,
      occurances,
      sharedUsernames
    );
    return c.text(reasonPhrase(StatusCodes.CREATED), StatusCodes.CREATED);
  });
