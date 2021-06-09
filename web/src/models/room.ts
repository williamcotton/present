import { Model, Attr } from "spraypaint";
import ApplicationRecord from "./application-record";

@Model()
export default class Room extends ApplicationRecord {
  static jsonapiType = "rooms";

  @Attr() name?: string;
}
