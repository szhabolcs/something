import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";
import { jwt } from "hono/jwt";
import { getUserThings } from "../repositories/things.js";
import { getTopBadges, getAllBadges } from "../repositories/badges.js";
import { getLevels } from "../repositories/levels.js";
import {
  getLeaderBoard,
  currentLeaderBoardVisibility,
  toggleLeaderboardVisibility,
} from "../repositories/leaderboard.js";

export const userRouter = new Hono();

// JWT secret key
export const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

userRouter.get("/me/profile", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  try {
    // Step1: Get top 3 badess from badge repository (icon, name, description)
    const topBadges = await getTopBadges(user_uuid, 3);

    // Step2: Get level from level repository (current level, next level, level object definition(name, min_treshold))
    const levels = await getLevels(user_uuid);

    // Step3: Get past things from thing repository
    const things = await getUserThings(user_uuid);

    const result: any = {
      badges: topBadges,
      things: things,
      levels: levels,
    };
    return c.json(result, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

userRouter.get("me/badges", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  try {
    const badges = await getAllBadges(user_uuid);
    return c.json(badges, StatusCodes.OK);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

userRouter.get("/leaderboard/all", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;
  try {
    const leaderboard = await getLeaderBoard();
    const currentVisibility = await currentLeaderBoardVisibility(user_uuid);
    return c.json(
      { leaderboard, currentVisibility: currentVisibility[0].visibility },
      StatusCodes.OK
    );
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

userRouter.patch(
  "/leaderboard/toggle-visibility",
  jwt({ secret: jwtSecret }),
  async (c) => {
    const uuid = c.get("jwtPayload").uuid;
    try {
      await toggleLeaderboardVisibility(uuid);
      return c.json(
        { message: "Visibility toggled successfully" },
        StatusCodes.OK
      );
    } catch (error: any) {
      return c.json(
        { error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
);
