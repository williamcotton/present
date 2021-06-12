import { makeExecutableSchema } from "graphql-tools";
import { v4 as uuid } from "uuid";
import type { Request } from "express";

import type { LocalMedia } from "./middleware/team-stream";

const resolveFunctions = {};

const schemaString = `
  # Response Types

  type User {
    displayName: String
  }

  type LocalMedia {
    audio: Boolean
    video: Boolean
    headsDown: Boolean
    lastRoom: String
  }

  type SuccessResponse {
    success: Boolean
  }

  # Queries

  type Query {
    user: User
    localMedia: LocalMedia
  }

  # Mutation Inputs

  input LoginCredentials {
    displayName: String
  }

  input LocalMediaInput {
    audio: Boolean
    video: Boolean
    headsDown: Boolean
    lastRoom: String
  }

  # Mutations

  type Mutation {
    login(input: LoginCredentials): User
    logout(input: Boolean): SuccessResponse
    updateLocalMedia(input: LocalMediaInput): SuccessResponse
  }
`;

const schema = makeExecutableSchema({
  typeDefs: schemaString,
  resolvers: resolveFunctions,
});

export default () => {
  const rootValue = {
    login: async (
      { input }: { input: { displayName: string } },
      req: Request
    ) => {
      const { displayName } = input;
      const user = { displayName };
      const sessionId = uuid();
      if (req.session) {
        req.session.user = { displayName, sessionId };
      }
      return user;
    },

    logout: async (_: any, req: Request) => {
      if (req.session) {
        req.session.user = false;
      }
      return { success: true };
    },

    user: async (_: any, req: Request) => req.session?.user,

    localMedia: async (_: any, req: Request) => {
      req.session = req.session || {};
      if (typeof req.session.localMedia === "undefined") {
        req.session.localMedia = {};
      }
      if (typeof req.session.localMedia.headsDown === "undefined") {
        req.session.localMedia.headsDown = false;
      }
      if (typeof req.session.localMedia.audio === "undefined") {
        req.session.localMedia.audio = true;
      }
      if (typeof req.session.localMedia.video === "undefined") {
        req.session.localMedia.video = true;
      }
      if (typeof req.session.localMedia.lastRoom === "undefined") {
        // TODO: replace lastRoom on referer header with a lookup in server_transactions type:room-connection-access-granted
        req.session.localMedia.lastRoom = "";
        return req.session.localMedia;
      }
    },

    updateLocalMedia: async (
      { input }: { input: LocalMedia },
      req: Request
    ) => {
      if (req.session) {
        req.session.localMedia = input;
      }
      return { success: true };
    },
  };

  return {
    schema,
    rootValue,
    graphiql: true,
  };
};
