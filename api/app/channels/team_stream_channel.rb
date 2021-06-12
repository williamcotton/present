class TeamStreamChannel < ApplicationCable::Channel
  def subscribed
    stream_from "teams:#{params[:team_name]}"
  end
end
