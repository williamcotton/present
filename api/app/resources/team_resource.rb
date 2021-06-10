class TeamResource < ApplicationResource
  attribute :name, :string

  has_many :rooms
end
