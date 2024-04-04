import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";
import { jwt } from "hono/jwt";
import {
  getUserThingsToday,
  getOthersThingsToday,
  getUserThings,
  getThingDetails,
  createThing,
} from "../repositories/things";

export const thingRouter = new Hono();

// JWT secret key
export const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

thingRouter.get("/mine/today", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  try {
    const things = await getUserThingsToday(user_uuid, 3);
    return c.json(things, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

thingRouter.get("/mine/today/all", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  try {
    const things = await getUserThingsToday(user_uuid);
    return c.json(things, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

thingRouter.get("/others/today", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  try {
    const things = await getOthersThingsToday(user_uuid);
    return c.json(things, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

thingRouter.get("/mine/all", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  try {
    const things = await getUserThings(user_uuid);
    return c.json(things, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

thingRouter.get("/:uuid/details", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  const thing_uuid = c.req.param("uuid");
  try {
    const thingsDetails = await getThingDetails(user_uuid, thing_uuid);
    return c.json(thingsDetails, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

thingRouter.post("/create", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;

  const { name, description, occurances, sharedUsernames } = await c.req.json();

  try {
    const things = await createThing(
      user_uuid,
      name,
      description,
      occurances,
      sharedUsernames
    );
    return c.json({ message: "Successfully added thing!" }, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});
