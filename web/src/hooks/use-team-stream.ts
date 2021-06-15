import AbortController from "abort-controller";
import { useEffect, useReducer } from "react";

import Room, { Participant } from "../models/room";
import Team from "../models/team";

import type { getTeamStream } from "../browser/middleware/team-stream";

const defaultTracks = {
  audio: { enabled: true },
  video: { enabled: true },
};

type TrackType = "audio" | "video";

type TrackEventOptions = {
  room: Room;
  trackType: TrackType;
  identity: string;
};

type RoomEventOptions = {
  team: Team;
  currentUser: {
    displayName: string;
  };
  room: Room;
  identity: string;
};

type EventType =
  | "server-refresh"
  | "room-created"
  | "participant-connected"
  | "participant-disconnected"
  | "track-added"
  | "track-removed"
  | "track-enabled"
  | "track-disabled";

type TeamStreamAction = {
  type: EventType;
  body?: {
    trackType: TrackType;
  };
  roomName?: string;
  currentUser: {
    displayName: string;
  };
  user?: {
    displayName: string;
  };
  team?: Team | null;
};

type User = {
  displayName: string;
};

type TeamStreamParams = {
  teamName: string;
  consumerHost: string;
  initialTeam: Team;
  getTeamStream: getTeamStream;
  user: User;
};

const findOrCreateParticipant = ({
  room,
  identity,
}: {
  room: Room;
  identity: string;
}) => {
  let participant = room.participants?.find((p) => p.identity === identity);

  if (!participant) {
    const tracks = defaultTracks;
    participant = { identity, tracks } as Participant;
    room.participants?.push(participant);
  }

  return participant;
};

const roomCreated = ({
  team,
  room,
  currentUser,
  identity,
}: RoomEventOptions) => {
  // do something at some point?
};

const participantConnected = ({
  currentUser,
  room,
  identity,
}: RoomEventOptions) => {
  findOrCreateParticipant({ room, identity });

  if (currentUser && currentUser.displayName === identity) {
    room.isCurrent = true;
  }
};

const participantDisconnected = ({
  currentUser,
  room,
  identity,
}: RoomEventOptions) => {
  const participant = room.participants?.find((p) => p.identity === identity);

  if (participant)
    room.participants = room.participants?.filter(
      (p) => p.identity !== identity
    );

  if (currentUser && currentUser.displayName === identity) {
    room.isCurrent = false;
  }
};

const trackAdded = ({ room, trackType, identity }: TrackEventOptions) => {
  // console.log('trackAdded', room, identity, trackType);
};

const trackRemoved = ({ room, trackType, identity }: TrackEventOptions) => {
  // console.log('trackRemoved', room, identity, trackType);
};

const trackEnabled = ({ trackType, identity, room }: TrackEventOptions) => {
  const participant = findOrCreateParticipant({ room, identity });
  participant.tracks[trackType].enabled = true;
};

const trackDisabled = ({ trackType, identity, room }: TrackEventOptions) => {
  const participant = findOrCreateParticipant({ room, identity });
  participant.tracks[trackType].enabled = false;
};

const teamStreamEventReducer = (team: Team, action: TeamStreamAction): Team => {
  if (action.type === "server-refresh" && action.team) {
    return action.team;
  }

  const { type, body, currentUser, user, roomName } = action;
  const trackType = body?.trackType;
  const identity = user?.displayName || "";

  let room = team.rooms?.find((r) => r.name === roomName);
  if (!room) {
    room = new Room({
      name: roomName,
      participants: [],
    });
    team.rooms?.push(room);
  }

  const roomEvent: RoomEventOptions = { team, room, currentUser, identity };

  type === "room-created"
    ? roomCreated(roomEvent)
    : type === "participant-connected"
    ? participantConnected(roomEvent)
    : type === "participant-disconnected"
    ? participantDisconnected(roomEvent)
    : null;

  if (trackType) {
    const trackEvent: TrackEventOptions = { room, trackType, identity };

    type === "track-added"
      ? trackAdded(trackEvent)
      : type === "track-removed"
      ? trackRemoved(trackEvent)
      : type === "track-enabled"
      ? trackEnabled(trackEvent)
      : type === "track-disabled"
      ? trackDisabled(trackEvent)
      : null;
  }

  return { ...team } as Team;
};

export default function useTeamStream(params: TeamStreamParams): Team {
  const {
    teamName,
    consumerHost,
    initialTeam,
    getTeamStream,
    user: currentUser,
  } = params;

  const [team, teamStreamEventDispatch] = useReducer(
    teamStreamEventReducer,
    initialTeam
  );

  useEffect(() => {
    const { createConsumer } = require("@rails/actioncable");
    const consumer = createConsumer(consumerHost);
    const teamStreamChannel = consumer.subscriptions.create(
      {
        channel: "TeamStreamChannel",
        team_name: teamName,
      },
      {
        received(data: TeamStreamAction) {
          teamStreamEventDispatch({ ...data, currentUser });
        },
        disconnected() {
          () => console.log("disconnect");
        },
      }
    );

    const abortController = new AbortController();
    async function refresh() {
      try {
        const updatedTeam = await getTeamStream({
          teamName,
          abortController,
          cache: false,
        });
        teamStreamEventDispatch({
          currentUser,
          team: updatedTeam,
          type: "server-refresh",
        });
      } catch (e) {
        if (!abortController.signal.aborted) {
          console.error(e);
        }
      }
    }
    refresh();

    return () => {
      teamStreamChannel.unsubscribe();
      consumer.disconnect();
      abortController.abort();
    };
  }, [teamName]);

  return team;
}
