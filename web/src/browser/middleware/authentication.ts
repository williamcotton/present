import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      login: (options: { displayName: string }) => Promise<User>;
      logout: () => Promise<void>;
    }
  }
}

type User = { displayName: string };

export default ({ expressLink }: { expressLink: any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.login = async ({ displayName }: { displayName: string }) => {
      const response = <{ login: User }>(
        await req.q(
          "mutation login($input: LoginCredentials) { login(input: $input) { displayName } }",
          { input: { displayName } }
        )
      );
      const { login: user } = response;
      expressLink.user = user;
      return user;
    };
    req.logout = async () => {
      await req.q(
        "mutation logout($input: Boolean) { logout(input: $input) { success } }",
        { input: true }
      );
      expressLink.user = false;
    };
    next();
  };
};
