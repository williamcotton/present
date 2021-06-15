import React, { useContext } from "react";

import Room from "../../../models/room";

export default ({ room }: { room: Room }) => {
  return (
    <div>
      <h1>{room.name}</h1>
      <div>
        {room.participants?.map((p) => (
          <div key={p.identity}>{JSON.stringify(p)}</div>
        ))}
      </div>
    </div>
  );
};
