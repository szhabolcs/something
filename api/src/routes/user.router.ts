import { StatusCodes, reasonPhrase } from '../types/status-codes.js';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  leaderboard,
  userBadges,
  userProfile,
  toggleLeaderboardVisibility,
  UserProfileModel
} from './user.definition.js';
import { zodErrorHandler } from '../utils/errors.js';
import { ThingService } from '../services/thing.service.js';
import { RewardService } from '../services/reward.service.js';
import { LeaderboardService } from '../services/leaderboard.service.js';

const thingService = new ThingService();
const rewardService = new RewardService();
const leaderboardService = new LeaderboardService();

export const userRouter = new OpenAPIHono({ defaultHook: zodErrorHandler })
  .openapi(userProfile, async (c) => {
    const userId = c.get('jwtPayload').id;
    // Step1: Get top 3 badess from badge repository (icon, name, description)
    const badges = await rewardService.getTopBadges(userId);

    // Step2: Get level from level repository (current level, next level, level object definition(name, min_treshold))
    const level = await rewardService.getUserLevel(userId);

    // Step3: Get past things from thing repository
    const things = await thingService.getUserThings(userId);

    const result: UserProfileModel = {
      badges,
      things,
      level
    };
    return c.json(result, StatusCodes.OK);
  })

  .openapi(userBadges, async (c) => {
    const userId = c.get('jwtPayload').id;
    const badges = await rewardService.getUserBadges(userId);
    return c.json(badges, StatusCodes.OK);
  })

  .openapi(leaderboard, async (c) => {
    const userId = c.get('jwtPayload').id;
    const leaderboard = await leaderboardService.getLeaderBoard();
    const currentVisibility = await leaderboardService.getUserVisibility(userId);
    return c.json({ leaderboard, currentVisibility }, StatusCodes.OK);
  })

  .openapi(toggleLeaderboardVisibility, async (c) => {
    const userId = c.get('jwtPayload').id;
    await leaderboardService.toggleUserVisibility(userId);
    return c.text(reasonPhrase(StatusCodes.OK), StatusCodes.OK);
  });
