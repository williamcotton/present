class RoomResource < ApplicationResource
  attribute :name, :string
  attribute :participants, :array

  filter :team_id, :integer

  belongs_to :team
end
