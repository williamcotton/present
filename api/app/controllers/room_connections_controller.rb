class RoomConnectionsController < ApplicationController
  def create
    room_connection = RoomConnectionResource.build(params)

    if room_connection.save
      render jsonapi: room_connection, status: 201
    else
      render jsonapi_errors: room
    end
  end
end
