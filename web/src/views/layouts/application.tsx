import React from "react";
import type { Request } from "express";

import useTeamStream from "../../hooks/use-team-stream";
import useParticipants from "../../hooks/use-participants";

import { RequestContext, TeamStreamContext } from "../../contexts";

import Team from "../../models/team";

export default function AppLayout({
  content,
  req,
}: {
  content: React.ReactElement;
  req: Request;
}): React.ReactElement {
  const {
    Form,
    p: { login },
    currentRoom,
    currentTeam,
    getTeamStream,
    user,
  } = req;

  const consumerHost = "https://present-dev.ngrok.io/cable";

  const team = currentTeam
    ? useTeamStream({
        teamName: "wm-ads",
        initialTeam: currentTeam,
        getTeamStream,
        user,
        consumerHost,
      })
    : new Team();

  return (
    <RequestContext.Provider value={req}>
      <TeamStreamContext.Provider value={team}>
        {req.user && (
          <div>
            <div>{req.user?.displayName}</div>
            <Form action={login.destroy({ id: "true" })} method="delete">
              <button className="submit">Logout</button>
            </Form>
          </div>
        )}

        <div>{content}</div>
      </TeamStreamContext.Provider>
    </RequestContext.Provider>
  );
}
