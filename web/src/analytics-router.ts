import router from "router";
import type { Request, Response } from "express";

export const analyticsRouter = router();

analyticsRouter.get("/", (req: Request, res: Response) => {
  res.pageview({ title: "Front Page" });
});

export default analyticsRouter;
