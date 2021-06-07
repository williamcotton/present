import { Model, Attr } from "spraypaint";
import ApplicationRecord from "./application-record";

@Model()
export default class User extends ApplicationRecord {
  static jsonapiType = "users";

  @Attr() name: string = "";
  @Attr() email: string = "";
}
