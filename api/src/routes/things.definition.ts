import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { bearerAuth, jsonc, textc, useJWT } from '../utils/openapi.js';
import { StatusCodes } from '../types/status-codes.js';

export const ThingPreviewModel = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  streakCount: z.number(),
  startTime: z.string(),
  endTime: z.string()
});

const ThingCardModel = z.object({
  photoUuid: z
    .string()
    .openapi({ description: 'This is actually the link to the picture' }),
  username: z.string(),
  thingName: z.string(),
  thingUuid: z.string()
});

const ThingDetailsModel = z.object({
  nextOccurrence: z.object({
    startTime: z.string(),
    endTime: z.string()
  }),
  sharedWith: z
    .object({
      userUuid: z.string(),
      username: z.string()
    })
    .array(),
  previousCheckpoints: ThingCardModel.omit({
    thingName: true,
    thingUuid: true
  }).array(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['personal', 'social'])
});

const ThingDTO = z.object({
  name: z.string(),
  description: z.string(),
  occurances: z.any(), // TODO: this needs refactoring
  sharedUsernames: z.string().array()
});

export const userThingsToday = createRoute({
  method: 'get',
  path: '/mine/today',
  middleware: useJWT(),
  security: bearerAuth,
  description:
    'Retrieve some data about upcoming things scheduled for today. <br> This is only a preview.',
  tags: ['Things'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(ThingPreviewModel.array()),
      description: `Snippet of user's things today.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const userThingsTodayAll = createRoute({
  method: 'get',
  path: '/mine/today/all',
  middleware: useJWT(),
  security: bearerAuth,
  description: 'Retrieve some data about things that are scheduled for today.',
  tags: ['Things'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(ThingPreviewModel.array()),
      description: `All things to be completed today by a user.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const userThingsAll = createRoute({
  method: 'get',
  path: '/mine/all',
  middleware: useJWT(),
  security: bearerAuth,
  description: `Retrieve some data about all of the user's things, created or shared with them.`,
  tags: ['Things'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(ThingPreviewModel.array()),
      description: `All things of a user.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const otherThingsToday = createRoute({
  method: 'get',
  path: '/others/today',
  middleware: useJWT(),
  security: bearerAuth,
  description:
    'Retrieve what others are doing today. <br> Only activity from shared things is shown (shared by user, or with the user).',
  tags: ['Things'],
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(ThingCardModel.array()),
      description: `Daily activities of the user's friends.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const thingDetails = createRoute({
  method: 'get',
  path: '/{uuid}/details',
  middleware: useJWT(),
  security: bearerAuth,
  description: 'Retrieve all info about a thing.',
  tags: ['Things'],
  request: {
    params: z.object({
      uuid: z.string().uuid()
    })
  },
  responses: {
    [StatusCodes.OK]: {
      ...jsonc(ThingDetailsModel),
      description: `Details about a thing.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const createThing = createRoute({
  method: 'post',
  path: '/create',
  middleware: useJWT(),
  security: bearerAuth,
  description: 'Create a new thing.',
  tags: ['Things'],
  request: {
    body: jsonc(ThingDTO)
  },
  responses: {
    [StatusCodes.CREATED]: {
      ...textc(z.string()),
      description: `New thing created.`
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});
