/* eslint-disable no-nested-ternary, no-unused-expressions, no-param-reassign, no-unused-vars */
// import { createConsumer } from "@rails/actioncable";
import AbortController from "abort-controller";
import { useEffect, useReducer } from "react";

import Room, { Participant } from "../models/room";
import Team from "../models/team";

const defaultTracks = {
  audio: { enabled: true },
  video: { enabled: true },
};

type TrackType = "audio" | "video";

type TrackEventOptions = {
  team: Team;
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
  | "room-created" // TODO: implement!
  | "participant-connected"
  | "participant-disconnected"
  | "track-added"
  | "track-removed"
  | "track-enabled"
  | "track-disabled";

type Action = {
  type: EventType;
  body?: {
    trackType: TrackType;
  };
  room?: Room;
  currentUser: {
    displayName: string;
  };
  user?: {
    displayName: string;
  };
  team?: Team | null;
};

const roomCreated = ({
  team,
  room,
  currentUser,
  identity,
}: RoomEventOptions) => {
  const existingRoom = team.rooms?.find((r) => r.name === room.name);

  if (!existingRoom) {
    room = new Room(room);
    team.rooms?.push(room);
  }
};

const participantConnected = ({
  team,
  currentUser,
  room,
  identity,
}: RoomEventOptions) => {
  const existingTeamParticipant = team.participants?.find(
    (p) => p.identity === identity
  );

  const tracks =
    existingTeamParticipant && existingTeamParticipant.tracks
      ? existingTeamParticipant.tracks
      : defaultTracks;

  if (!existingTeamParticipant) team.participants?.push({ identity, tracks });

  const existingRoomParticipant = room.participants?.find(
    (p) => p.identity === identity
  );
  if (!existingRoomParticipant) room.participants?.push({ identity, tracks });

  if (currentUser && currentUser.displayName === identity) {
    room.isCurrent = true;
  }
};

const participantDisconnected = ({
  team,
  currentUser,
  room,
  identity,
}: RoomEventOptions) => {
  const existingParticipant = room.participants?.find(
    (p) => p.identity === identity
  );

  if (existingParticipant)
    room.participants = room.participants?.filter(
      (p) => p.identity !== identity
    );

  const existingServerParticipant = team.participants?.find(
    (p) => p.identity === identity
  );

  if (!existingServerParticipant && existingParticipant)
    team.participants?.push(existingParticipant);

  if (currentUser && currentUser.displayName === identity) {
    room.isCurrent = false;
  }
};

const trackAdded = ({ team, room, trackType, identity }: TrackEventOptions) => {
  // console.log('trackAdded', room, identity, trackType);
};

const trackRemoved = ({
  team,
  room,
  trackType,
  identity,
}: TrackEventOptions) => {
  // console.log('trackRemoved', room, identity, trackType);
};

const trackEnabled = ({ team, trackType, identity }: TrackEventOptions) => {
  let participant = team.participants?.find((p) => p.identity === identity);

  if (!participant) {
    const tracks = defaultTracks;
    participant = { identity, tracks } as Participant;
    team.participants?.push(participant);
  }

  participant.tracks[trackType].enabled = true;
};

const trackDisabled = ({ team, trackType, identity }: TrackEventOptions) => {
  let participant = team.participants?.find((p) => p.identity === identity);

  if (!participant) {
    const tracks = defaultTracks;
    participant = { identity, tracks } as Participant;
    team.participants?.push(participant);
  }

  participant.tracks[trackType].enabled = false;
};

const teamStreamEventReducer = (team: Team, action: Action): Team => {
  if (action.type === "server-refresh" && action.team) {
    return action.team;
  }

  const { type, body, currentUser, user } = action;
  let { room } = action;
  const trackType = body?.trackType;

  const identity = user?.displayName || "";

  if (!room) {
    room = new Room(room);
    team.rooms?.push(room);
  }
  type === "room-created"
    ? roomCreated({ team, room, currentUser, identity })
    : type === "participant-connected"
    ? participantConnected({ team, currentUser, room, identity })
    : type === "participant-disconnected"
    ? participantDisconnected({ team, currentUser, room, identity })
    : type === "track-added" && trackType
    ? trackAdded({ team, room, trackType, identity })
    : type === "track-removed" && trackType
    ? trackRemoved({
        team,
        room,
        trackType,
        identity,
      })
    : type === "track-enabled" && trackType
    ? trackEnabled({
        team,
        room,
        trackType,
        identity,
      })
    : type === "track-disabled" && trackType
    ? trackDisabled({
        team,
        room,
        trackType,
        identity,
      })
    : null;
  return { ...team } as Team;
};

export default function useTeamStream({
  teamName,
  consumerHost,
  initialTeam,
  getTeamStream,
  user: currentUser,
}: {
  teamName: string;
  consumerHost: string;
  initialTeam: Team;
  getTeamStream: ({
    teamName,
    abortController,
    cache,
  }: {
    teamName: string;
    abortController?: AbortController;
    cache?: boolean;
  }) => Promise<Team | null>;
  user: {
    displayName: string;
  };
}): Team {
  const [team, teamStreamEventDispatch] = useReducer(
    teamStreamEventReducer,
    initialTeam
  );

  useEffect(() => {
    let updatedTeam;
    const { createConsumer } = require("@rails/actioncable");
    const consumer = createConsumer(consumerHost);
    const teamStreamChannel = consumer.subscriptions.create(
      {
        channel: "TeamStreamChannel",
        team_name: teamName,
      },
      {
        received(data: Action) {
          console.log(data);
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
        updatedTeam = await getTeamStream({
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
