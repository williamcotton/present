import { Model, Attr, BelongsTo } from "spraypaint";
import ApplicationRecord from "./application-record";
import Team from "./team";

type Track = {
  enabled: boolean;
};

type Participant = {
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

  @BelongsTo("teams") team?: Team;
}
