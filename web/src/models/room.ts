import { Model, Attr, BelongsTo } from "spraypaint";
import ApplicationRecord from "./application-record";
import Team from "./team";
import type { Room as TwilioRoom } from "twilio-video";

export type Track = {
  enabled: boolean;
};

export type Participant = {
  identity: string;
  tracks: {
    audio: Track;
    video: Track;
  };
};

@Model()
export default class Room extends ApplicationRecord {
  static jsonapiType = "rooms";

  @Attr() name?: string;
  @Attr() participants?: Participant[];

  isCurrent?: boolean;
  twilioRoom?: TwilioRoom;

  @BelongsTo("teams") team?: Team;
}
