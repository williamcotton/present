import React from "react";
import User from "../../models/user";

export default ({ user, success }: { user: User; success: boolean }) => {
  return <h3>{user.email}</h3>;
};
