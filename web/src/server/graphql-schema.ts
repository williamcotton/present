import { makeExecutableSchema } from "graphql-tools";
import { v4 as uuid } from "uuid";
import type { Request } from "express";

const resolveFunctions = {};

const schemaString = `
  # Response Types

  type User {
    displayName: String
  }

  type SuccessResponse {
    success: Boolean
  }

  # Queries

  type Query {
    user: User
  }

  # Mutation Inputs

  input LoginCredentials {
    displayName: String
  }

  # Mutations

  type Mutation {
    login(input: LoginCredentials): User
    logout(input: Boolean): SuccessResponse
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
  };

  return {
    schema,
    rootValue,
    graphiql: true,
  };
};
