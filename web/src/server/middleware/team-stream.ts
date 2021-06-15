import type { Request, Response, NextFunction } from "express";

import type {
  LocalAudioTrack,
  LocalDataTrack,
  LocalTrackPublication,
  LocalVideoTrack,
} from "twilio-video";
import Team from "../../models/team";
import Room from "../../models/room";

const noop = () => {};

export type LocalMedia = {
  audio: { track: LocalAudioTrack | boolean; enabled: boolean };
  video: { track: LocalVideoTrack | boolean; enabled: boolean };
  data: { track: LocalDataTrack | boolean; enabled: boolean };
  screenshare: {
    track: MediaStreamTrack | LocalVideoTrack | boolean;
    trackPublication?: LocalTrackPublication;
    enabled: boolean;
  };
};

declare global {
  namespace Express {
    interface Request {
      getTeamStream: ({
        teamName,
        abortController,
        cache,
      }: {
        teamName: string;
        abortController?: AbortController;
        cache?: boolean;
      }) => Promise<Team | null>;
      getCachedTeamStream: ({
        teamName,
        abortController,
        cache,
      }: {
        teamName: string;
        abortController?: AbortController;
        cache?: boolean;
      }) => Promise<Team | null>;
      connectToRoom: (opts: {
        name: string;
        skipCache?: boolean;
      }) => Promise<Room | null>;
      getLocalMedia: () => Promise<LocalMedia | null>;
      currentRoom?: Room | null;
      currentTeam?: Team | null;
      teamName?: string;
      roomName?: string;
      logoutVideo: typeof noop;
      disconnectFromRoom: typeof noop;
      disableMedia: ({
        type,
        disabled,
      }: {
        type: "audio" | "video" | "data" | "screenshare";
        disabled: boolean;
      }) => Promise<void>;
      destroyScreenshare: () => Promise<void>;
      createScreenshare: typeof noop;
      stopMedia: typeof noop;
    }
  }
}

export default () => (req: Request, res: Response, next: NextFunction) => {
  req.connectToRoom = async ({ name }: { name: string }) => {
    const { teamName } = req;
    const { data: room } = await Room.where({
      name,
    }).first();
    req.currentRoom = room as Room;
    return room as Room;
  };
  req.logoutVideo = noop;
  req.disconnectFromRoom = noop;
  req.getTeamStream = async ({ teamName }: { teamName: string }) => {
    const { roomName } = req;
    const { data: team } = await Team.where({ name: teamName })
      .includes("rooms")
      .first();
    team?.rooms?.forEach((room) => {
      if (room.name === roomName) {
        room.isCurrent = true;
      }
    });
    return team;
  };
  req.getCachedTeamStream = req.getTeamStream;
  req.getLocalMedia = async () => {
    const { localMedia } =
      (await req.q("query { localMedia { audio, video } }")) || {};
    return {
      audio: { track: true, enabled: localMedia.audio },
      video: { track: true, enabled: localMedia.video },
      data: { track: true, enabled: true },
      screenshare: { track: false, enabled: false },
    } as LocalMedia;
  };
  req.disableMedia = async () => {};
  req.destroyScreenshare = async () => {};
  req.createScreenshare = noop;
  req.stopMedia = noop;
  next();
};
