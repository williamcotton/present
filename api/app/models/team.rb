class Team < ApplicationRecord
  has_many :rooms

  def participants
    @participants ||= rooms.map(&:participants).flatten
  end
end
