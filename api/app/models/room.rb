# frozen_string_literal: true

class Room < ApplicationRecord
  belongs_to :team

  TWILIO_ACCOUNT_SID = ENV['TWILIO_ACCOUNT_SID']
  TWILIO_AUTH_TOKEN = ENV['TWILIO_AUTH_TOKEN']
  TWILIO_API_KEY_SID = ENV['TWILIO_API_KEY_SID']
  TWILIO_API_KEY_SECRET = ENV['TWILIO_API_KEY_SECRET']

  def base_participants
    twilio_client.video.rooms(twilio_room_name).participants.list(status: 'connected')
  end

  def twilio_client
    @twilio_client ||= Twilio::REST::Client.new(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  end

  def twilio_room_name
    "#{team.name}-#{name}"
  end

  def participants
    base_participants.map do |participant|
      { identity: participant.identity, tracks: tracks(participant.identity) }
    end
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

  def token(identity)
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

  # const accessToken = new AccessToken(
  #   twilioAccountSid,
  #   twilioApiKeySid,
  #   twilioApiKeySecret
  # ); // TODO #18: remove and dependecy inject AccessToken and VideoGrant

  # accessToken.identity = user.displayName;

  # const grant = new VideoGrant();
  # grant.room = serverRoomName({ serverName, name });
  # accessToken.addGrant(grant);

  # const jwt = accessToken.toJwt();

  # return jwt;
end
