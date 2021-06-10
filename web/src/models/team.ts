import { Model, Attr, HasMany } from "spraypaint";
import ApplicationRecord from "./application-record";
import Room from "./room";

@Model()
export default class Team extends ApplicationRecord {
  static jsonapiType = "teams";

  @Attr() name?: string;

  @HasMany() rooms?: Room[];
}
