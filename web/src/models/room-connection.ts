import { Model, Attr, BelongsTo } from "spraypaint";
import ApplicationRecord from "./application-record";

@Model()
export default class RoomConnection extends ApplicationRecord {
  static jsonapiType = "room_connections";

  @Attr() roomName?: string;
  @Attr() twilioRoomName?: string;
  @Attr() teamName?: string;
  @Attr() identity?: string;
  @Attr() jwt?: string;
}
