import { Model, SpraypaintBase } from "spraypaint";

@Model()
export default class ApplicationRecord extends SpraypaintBase {
  static baseUrl = global.window ? "" : process.env.API_BASE_URL || "";
  static apiNamespace = "/api/v1";
}
