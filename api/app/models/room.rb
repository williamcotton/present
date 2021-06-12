# frozen_string_literal: true

class Room < ApplicationRecord
  belongs_to :team

  TWILIO_ACCOUNT_SID = ENV['TWILIO_ACCOUNT_SID']
  TWILIO_AUTH_TOKEN = ENV['TWILIO_AUTH_TOKEN']
  TWILIO_API_KEY_SID = ENV['TWILIO_API_KEY_SID']
  TWILIO_API_KEY_SECRET = ENV['TWILIO_API_KEY_SECRET']

  def twilio_room_name
    "#{team.name}-#{name}"
  end

  def participants
    @participants ||= base_participants.map do |participant|
      { identity: participant.identity, tracks: tracks(participant.identity) }
    end
  end

  def twilio_token(identity)
    grant = Twilio::JWT::AccessToken::VideoGrant.new
    grant.room = twilio_room_name

    token = Twilio::JWT::AccessToken.new(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      [grant],
      identity: identity
    )

    token.to_jwt
  end

  def create_twilio_room
    twilio_client.video.rooms.create(
      status_callback: "http://present-dev.ngrok.io/team_status/#{team.name}/#{name}",
      type: 'peer-to-peer',
      unique_name: twilio_room_name
    )
  rescue Twilio::REST::RestError
    # We want to try and create the room without checking if it exists
    # so we have to swallow this error:
    #
    # Twilio::REST::RestError ([HTTP 400] 53113 : Unable to create record
    # Room exists
    # https://www.twilio.com/docs/errors/53113
  end

  private

  def twilio_client
    @twilio_client ||= Twilio::REST::Client.new(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  end

  def base_participants
    twilio_client.video.rooms(twilio_room_name).participants.list(status: 'connected')
  end

  def tracks(identity)
    published_tracks = twilio_client.video.rooms(twilio_room_name).participants(identity).published_tracks.list

    audio_track = published_tracks.find { |t| t.kind == 'audio' }
    video_track = published_tracks.find { |t| t.kind == 'video' }

    {
      audio: { enabled: audio_track.enabled },
      video: { enabled: video_track.enabled }
    }
  end
end
