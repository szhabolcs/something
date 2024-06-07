import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { bearerAuth, jsonc, textc, useJWT } from '../utils/openapi.js';
import { StatusCodes } from '../types/status-codes.js';
import { ThingPreviewModel } from './things.definition.js';

const BadgeModel = z.object({
  icon: z.string(),
  name: z.string(),
  description: z.string()
});

const LevelModel = z.object({
  level: z.string(),
  minThreshold: z.number()
});
const LevelsModel = z.object({
  currentLevel: LevelModel,
  nextLevel: LevelModel,
  currentPoints: z.number()
});

const UserProfileModel = z.object({
  levels: LevelsModel,
  badges: BadgeModel.array(),
  things: ThingPreviewModel.array()
});

const LeaderboardModel = z
  .object({
    username: z.string(),
    points: z.number()
  })
  .array();

export const userProfile = createRoute({
  method: 'get',
  path: '/me/profile',
  middleware: useJWT(),
  security: bearerAuth,
  description: 'Retrieve data about the user.',
  tags: ['User'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(UserProfileModel),
      description: `User's profile.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const userBadges = createRoute({
  method: 'get',
  path: '/me/badges',
  middleware: useJWT(),
  security: bearerAuth,
  description: 'Retrieve all badges.',
  tags: ['User'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(BadgeModel.array()),
      description: `User's badges.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const leaderboard = createRoute({
  method: 'get',
  path: '/leaderboard/all',
  middleware: useJWT(),
  security: bearerAuth,
  description: 'Retrieve global leaderboard.',
  tags: ['Leaderboard'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(
        z.object({
          leaderboard: LeaderboardModel,
          currentVisibility: z.boolean()
        })
      ),
      description: `Global leaderboard.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const toggleLeaderboardVisibility = createRoute({
  method: 'patch',
  path: '/leaderboard/toggle-visibility',
  middleware: useJWT(),
  security: bearerAuth,
  description: `Toggle the user's visibility on the global leaderboard.`,
  tags: ['Leaderboard'],
  responses: {
    [StatusCodes.OK]: {
      ...textc(z.string()),
      description: `Visibility changed.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});
