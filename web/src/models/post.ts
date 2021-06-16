import { Model, Attr, HasMany } from "spraypaint";
import ApplicationRecord from "./application-record";

@Model()
export default class Post extends ApplicationRecord {
  static jsonapiType = "posts";

  @Attr() title?: string;
  @Attr() upvotes?: number;
  @Attr() active?: boolean;
}
