class RoomConnectionResource < ApplicationResource
  self.adapter = Graphiti::Adapters::Null

  self.model = OpenStruct

  attribute :jwt, :string
  attribute :twilio_room_name, :string
  attribute :room_name, :string
  attribute :team_name, :string
  attribute :identity, :string

  def identity
    context.request.env['HTTP_X_IDENTITY']
  end

  def save(model)
    team = Team.where(name: model.team_name).first
    room = team.rooms.where(name: model.room_name).first
    model.jwt = room.token(identity)
    model.twilio_room_name = room.twilio_room_name
    model.identity = identity
    model
  end
end
