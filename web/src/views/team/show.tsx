import React, { useContext } from "react";

import { TeamStreamContext } from "../../contexts";

export default () => {
  const team = useContext(TeamStreamContext);
  return (
    <div>
      <h1>{team.name}</h1>
      <table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Participants</th>
          </tr>
        </thead>
        <tbody>
          {team.rooms?.map((room) => (
            <tr key={room.name}>
              <td>{room.name}</td>
              <td>{room.participants?.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
