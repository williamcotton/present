class RoomsController < ApplicationController
  def index
    rooms = RoomResource.all(params)
    respond_with(rooms)
  end

  def show
    room = RoomResource.find(params)
    respond_with(room)
  end

  def create
    room = RoomResource.build(params)

    if room.save
      render jsonapi: room, status: 201
    else
      render jsonapi_errors: room
    end
  end

  def update
    room = RoomResource.find(params)

    if room.update_attributes
      render jsonapi: room
    else
      render jsonapi_errors: room
    end
  end

  def destroy
    room = RoomResource.find(params)

    if room.destroy
      render jsonapi: { meta: {} }, status: 200
    else
      render jsonapi_errors: room
    end
  end
end
