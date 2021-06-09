import { Model, Attr } from "spraypaint";
import ApplicationRecord from "./application-record";

@Model()
export default class Team extends ApplicationRecord {
  static jsonapiType = "teams";

  @Attr() name?: string;
}
