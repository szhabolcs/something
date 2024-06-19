import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { bearerAuth, jsonc, textc, useAccessToken } from '../utils/openapi.js';
import { StatusCodes } from '../types/status-codes.js';
import { BadgeInfoModel, LevelInfoModel } from '../types/reward.js';
import { ThingPreviewModel } from '../types/thing.types.js';

export const UserProfileModel = z.object({
  level: LevelInfoModel,
  badges: BadgeInfoModel.array(),
  things: ThingPreviewModel.array()
});
export type UserProfileModel = z.infer<typeof UserProfileModel>;

const LeaderboardModel = z
  .object({
    username: z.string(),
    score: z.number()
  })
  .array();

export const userProfile = createRoute({
  method: 'get',
  path: '/me/profile',
  middleware: useAccessToken(),
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
  middleware: useAccessToken(),
  security: bearerAuth,
  description: 'Retrieve all badges.',
  tags: ['User'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(BadgeInfoModel.array()),
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
  middleware: useAccessToken(),
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
  middleware: useAccessToken(),
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

export const usernameExists = createRoute({
  method: 'get',
  path: '/username/{username}',
  middleware: useAccessToken(),
  security: bearerAuth,
  description: 'Retrieve if username exists.',
  tags: ['User'],
  responses: {
    [StatusCodes.OK]: {
      description: `Username exists.`
    },
    [StatusCodes.NOT_FOUND]: {
      description: `Username does not exists.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});
