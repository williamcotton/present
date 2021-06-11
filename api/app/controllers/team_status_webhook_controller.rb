class TeamStatusWebhookController < ApplicationController
  def create
    puts message
  end

  def message
    type = params[:StatusCallbackEvent]
    {
      room: room.attributes,
      team: team.attributes,
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
      roomName: room.name,
      roomSessionId: room_session_id
    }
    body[:type] = track_type if track_type
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

  def team
    @team ||= Team.where(name: params[:team_name]).first
  end

  def room
    @room ||= team.rooms.where(name: params[:room_name]).first
  end
end
