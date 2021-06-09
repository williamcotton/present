import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      login: (options: { displayName: string }) => Promise<User>;
      logout: () => Promise<void>;
      user: User;
    }
  }
}

type User = { displayName: string };

export default () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session) {
      req.user = req.session.user;
    }
    res.expressLink.user = req.user;

    req.login = async ({ displayName }) => {
      const response = <{ login: User }>(
        await req.q(
          "mutation login($input: LoginCredentials) { login(input: $input) { displayName } }",
          { input: { displayName } }
        )
      );
      const { login: user } = response;
      return user;
    };

    req.logout = async () => {
      await req.q(
        "mutation logout($input: Boolean) { logout(input: $input) { success } }",
        { input: true }
      );
    };

    next();
  };
};
