import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { bearerAuth, jsonc, textc, useAccessToken } from '../utils/openapi.js';
import { StatusCodes } from '../types/status-codes.js';
import { ThingCardModel, ThingDTO, ThingDetailsModel, ThingPreviewModel } from '../types/thing.types.js';

export const userThingsToday = createRoute({
  method: 'get',
  path: '/mine/today',
  middleware: useAccessToken(),
  security: bearerAuth,
  description: 'Retrieve some data about upcoming things scheduled for today. <br> This is only a preview.',
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
  middleware: useAccessToken(),
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
  middleware: useAccessToken(),
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
  middleware: useAccessToken(),
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
  middleware: useAccessToken(),
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
  middleware: useAccessToken(),
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
