class UserResource < ApplicationResource
  attribute :name, :string
  attribute :email, :string
  attribute :created_at, :datetime, writable: false
  attribute :updated_at, :datetime, writable: false
end
