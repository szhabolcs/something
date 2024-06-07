import { StatusCodes, reasonPhrase } from '../types/status-codes.js';
import { getUserThings } from '../repositories/things.js';
import { getTopBadges, getAllBadges } from '../repositories/badges.js';
import { getLevels } from '../repositories/levels.js';
import {
  getLeaderBoard,
  currentLeaderBoardVisibility,
  toggleLeaderboardVisibility as repoToggleLeaderboardVisibility
} from '../repositories/leaderboard.js';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  leaderboard,
  userBadges,
  userProfile,
  toggleLeaderboardVisibility
} from './user.definition.js';

export const userRouter = new OpenAPIHono()
  .openapi(userProfile, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    // Step1: Get top 3 badess from badge repository (icon, name, description)
    const topBadges = await getTopBadges(user_uuid, 3);

    // Step2: Get level from level repository (current level, next level, level object definition(name, min_treshold))
    const levels = await getLevels(user_uuid);

    // Step3: Get past things from thing repository
    const things = await getUserThings(user_uuid);

    const result = {
      badges: topBadges,
      things: things,
      levels: levels
    };
    return c.json(result, StatusCodes.OK);
  })

  .openapi(userBadges, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const badges = await getAllBadges(user_uuid);
    return c.json(badges, StatusCodes.OK);
  })

  .openapi(leaderboard, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;
    const leaderboard = await getLeaderBoard();
    const currentVisibility = await currentLeaderBoardVisibility(user_uuid);
    return c.json(
      {
        leaderboard,
        currentVisibility: currentVisibility[0].visibility
      },
      StatusCodes.OK
    );
  })

  .openapi(toggleLeaderboardVisibility, async (c) => {
    const uuid = c.get('jwtPayload').uuid;
    await repoToggleLeaderboardVisibility(uuid);
    return c.text(reasonPhrase(StatusCodes.OK), StatusCodes.OK);
  });
