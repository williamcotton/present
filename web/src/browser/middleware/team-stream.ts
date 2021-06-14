import {
  connect,
  createLocalAudioTrack,
  createLocalVideoTrack,
  LocalVideoTrack,
  LocalDataTrack,
  LocalTrack,
  LocalAudioTrack,
  LocalTrackPublication,
  LocalVideoTrackPublication,
  LocalAudioTrackPublication,
} from "twilio-video";

import Team from "../../models/team";
import Room from "../../models/room";
import RoomConnection from "../../models/room-connection";

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

let currentRoomSingleton: Room | null;
let currentTeamStreamSingleton: Team | null;
let localMediaSingleton: LocalMedia | null;

import type { Request, Response, NextFunction } from "express";

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
      currentRoom?: Room | null;
      currentTeam?: Team | null;
      getLocalMedia: () => Promise<LocalMedia | null>;
      disableMedia: ({
        type,
        disabled,
      }: {
        type: "audio" | "video" | "data" | "screenshare";
        disabled: boolean;
      }) => Promise<void>;
    }
  }
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }
}

function disconnectFromRoom() {
  currentRoomSingleton?.twilioRoom?.disconnect();
  currentRoomSingleton = null;
}

function disableTracks({
  publications,
  disabled,
}: {
  publications:
    | Map<string, LocalAudioTrackPublication>
    | Map<string, LocalVideoTrackPublication>;
  disabled: boolean;
}) {
  publications.forEach(
    (publication: LocalVideoTrackPublication | LocalAudioTrackPublication) => {
      if (!publication.track) return;
      if (disabled) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    }
  );
}

async function getScreenShareTrack() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: {
      frameRate: 30,
      height: 1080,
      width: 1920,
    },
  });
  const track = stream.getTracks()[0];
  return track;
}

let onlyFirst = true;

export default () => {
  document.addEventListener("beforeunload", disconnectFromRoom);

  return (req: Request, res: Response, next: NextFunction) => {
    async function connectToNewRoom({ name }: { name: string }) {
      const { teamName } = req;
      await req.destroyScreenshare();
      disconnectFromRoom();
      const roomConnection = new RoomConnection({
        roomName: name,
        teamName,
      });
      const { jwt, twilioRoomName } = roomConnection;
      if (onlyFirst) {
        onlyFirst = false;
      }
      const tracks = localMediaSingleton
        ? ([
            localMediaSingleton.audio.track,
            localMediaSingleton.video.track,
            localMediaSingleton.data.track,
          ] as LocalTrack[])
        : [];
      if (!jwt) {
        return null;
      }
      const twilioRoom = await connect(jwt, {
        name: twilioRoomName,
        tracks,
      });
      const { localParticipant } = twilioRoom;
      // after we connect to a room we need to broadcast the current state of our local media
      disableTracks({
        publications: localParticipant.audioTracks,
        disabled: !localMediaSingleton?.audio.enabled,
      });
      disableTracks({
        publications: localParticipant.videoTracks,
        disabled: !localMediaSingleton?.video.enabled,
      });
      const room = new Room({ name, twilioRoom });
      return room;
    }

    async function updateLocalMedia() {
      return req.q(
        "mutation ($input: LocalMediaInput) { updateLocalMedia(input: $input) { success } }",
        {
          input: {
            audio: localMediaSingleton?.audio.enabled,
            video: localMediaSingleton?.video.enabled,
          },
        }
      );
    }

    req.connectToRoom = async ({ name, skipCache }) => {
      currentRoomSingleton =
        currentRoomSingleton?.name === name && !skipCache
          ? currentRoomSingleton
          : await connectToNewRoom({ name });
      req.currentRoom = currentRoomSingleton;
      return currentRoomSingleton;
    };

    req.getCachedTeamStream = async ({ teamName }) => {
      if (!currentTeamStreamSingleton) {
        currentTeamStreamSingleton = await req.getTeamStream({ teamName });
      }
      return currentTeamStreamSingleton;
    };

    req.getTeamStream = async ({ teamName, abortController, cache = true }) => {
      const { data: team } = await Team.where({ name: teamName })
        .includes("rooms")
        .first();
      team?.rooms?.forEach((room) => {
        if (room.name === currentRoomSingleton?.name) {
          room.isCurrent = true;
        }
      });

      currentTeamStreamSingleton = team;

      req.currentTeam = team;
      return team;
    };

    req.getLocalMedia = async () => {
      // TODO #27: Support multiple tracks per type... sharing 2-3 screens at a time, sharing 2 audio tracks, etc
      if (!localMediaSingleton) {
        const videoTrack = await createLocalVideoTrack({
          width: 150,
        });
        const audioTrack = await createLocalAudioTrack();
        const dataTrack = new LocalDataTrack();
        const { localMedia } = await req.q(
          "query { localMedia { audio, video } }",
          {},
          { cache: false }
        );
        localMediaSingleton = {
          audio: { track: audioTrack, enabled: localMedia.audio },
          video: { track: videoTrack, enabled: localMedia.video },
          data: { track: dataTrack, enabled: true },
          screenshare: { track: false, enabled: false },
        };
      }
      return localMediaSingleton;
    };

    req.disconnectFromRoom = disconnectFromRoom;

    req.logoutVideo = () => {
      if (typeof localMediaSingleton?.video.track !== "boolean")
        localMediaSingleton?.video.track.stop();
      localMediaSingleton = null;
      disconnectFromRoom();
    };

    req.stopMedia = () => {
      if (typeof localMediaSingleton?.video.track !== "boolean")
        localMediaSingleton?.video.track.stop();
      localMediaSingleton = null;
    };

    req.disableMedia = async ({
      type,
      disabled,
    }: {
      type: "audio" | "video" | "data" | "screenshare";
      disabled: boolean;
    }) => {
      if (!localMediaSingleton || !currentRoomSingleton) return;
      localMediaSingleton[type].enabled = !disabled;
      await updateLocalMedia();
      const localParticipant =
        currentRoomSingleton.twilioRoom?.localParticipant;
      if (!localParticipant) return;
      const publications =
        type === "audio"
          ? localParticipant.audioTracks
          : localParticipant.videoTracks;
      disableTracks({ publications, disabled });
    };

    req.destroyScreenshare = async () => {
      if (!localMediaSingleton?.screenshare.track || !currentRoomSingleton)
        return;
      if (typeof localMediaSingleton?.screenshare.track !== "boolean")
        currentRoomSingleton?.twilioRoom?.localParticipant.unpublishTrack(
          localMediaSingleton.screenshare.track
        );
      currentRoomSingleton?.twilioRoom?.localParticipant.emit(
        "trackUnpublished",
        localMediaSingleton.screenshare.trackPublication
      );
      if (typeof localMediaSingleton?.screenshare.track !== "boolean")
        localMediaSingleton.screenshare.track.stop();
      localMediaSingleton.screenshare.track = false;
      localMediaSingleton.screenshare.enabled = false;
    };

    req.createScreenshare = async () => {
      try {
        const track = await getScreenShareTrack();
        const trackPublication = currentRoomSingleton
          ? await currentRoomSingleton?.twilioRoom?.localParticipant.publishTrack(
              track,
              {
                logLevel: "debug",
                priority: "high",
              }
            )
          : false;

        if (localMediaSingleton && trackPublication) {
          localMediaSingleton.screenshare.trackPublication = trackPublication;
          localMediaSingleton.screenshare.enabled = true;
          localMediaSingleton.screenshare.track = new LocalVideoTrack(track);
        }

        return track;
      } catch (e) {
        return {};
      }
    };
    next();
  };
};
