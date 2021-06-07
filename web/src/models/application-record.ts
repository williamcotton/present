import { Model, SpraypaintBase } from "spraypaint";
import fetch from "isomorphic-fetch";

global.fetch = fetch;

@Model()
export default class ApplicationRecord extends SpraypaintBase {
  static baseUrl = global.window ? "" : process.env.API_BASE_URL || "";
  static apiNamespace = "/api/v1";
}
