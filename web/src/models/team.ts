import { Model, Attr, HasMany } from "spraypaint";
import ApplicationRecord from "./application-record";
import Room, { Participant } from "../models/room";

@Model()
export default class Team extends ApplicationRecord {
  static jsonapiType = "teams";

  @Attr() name?: string;

  isCurrent?: boolean;

  @HasMany() rooms?: Room[];
}
