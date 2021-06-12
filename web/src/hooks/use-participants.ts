import { useEffect, useState } from "react";

import { RemoteParticipant } from "twilio-video";

import Room from "../models/room";

declare module "twilio-video" {
  interface RemoteParticipant {
    messages: {}[];
  }
}

RemoteParticipant.prototype.messages = [];

export default function useParticipants({ room }: { room: Room }) {
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);

  function participantConnected(participant: RemoteParticipant) {
    participant.on("trackEnabled", () => {
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    });
    participant.on("trackDisabled", () => {
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    });
    participant.tracks.forEach((publication) => {
      if (publication.isEnabled) {
        setParticipants((prevParticipants) => [
          ...prevParticipants,
          participant,
        ]);
      }
    });
    participant.on("trackSubscribed", (track) => {
      if (track.kind === "data") {
        track.on("message", (data: string) => {
          const json = JSON.parse(data);
          json.receivedTimestamp = Date.now();
          participant.messages.push(json);
          setParticipants((prevParticipants) => [
            ...prevParticipants,
            participant,
          ]);
          console.log(json);
        });
      }
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    });
    participant.on("trackUnpublished", () => {
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    });
  }

  function participantDisconnected(participant: RemoteParticipant) {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p !== participant)
    );
  }

  useEffect(() => {
    if (!room?.twilioRoom) return;
    room.twilioRoom.on("participantConnected", participantConnected);
    room.twilioRoom.on("participantDisconnected", participantDisconnected);
    room.twilioRoom.on("disconnected", () => {
      room.twilioRoom?.participants.forEach(participantDisconnected);
    });
    room.twilioRoom?.participants.forEach(participantConnected);
  }, [room]);

  return { room, participants: [...new Set(participants)] };
}
