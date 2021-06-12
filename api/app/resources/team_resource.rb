class TeamResource < ApplicationResource
  attribute :name, :string
  attribute :participants, :array

  has_many :rooms
end
