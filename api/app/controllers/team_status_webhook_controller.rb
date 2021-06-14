class TeamStatusWebhookController < ApplicationController
  def create
    ActionCable.server.broadcast("teams:#{team_name}", message)
  end

  def message
    type = params[:StatusCallbackEvent]
    {
      roomName: room_name,
      user: user,
      type: type,
      body: body
    }
  end

  def body
    sequence = params[:SequenceNumber]
    room_session_id = params[:RoomSid]
    track_type = params[:TrackKind]
    body = {
      sequence: sequence,
      roomName: room_name,
      roomSessionId: room_session_id
    }
    body[:trackType] = track_type if track_type
    body
  end

  def user
    identity = params[:ParticipantIdentity]
    video_session_id = params[:ParticipantSid]
    {
      displayName: identity,
      videoSessionId: video_session_id
    }
  end

  def room_name
    params[:room_name]
  end

  def team_name
    params[:team_name]
  end
end
