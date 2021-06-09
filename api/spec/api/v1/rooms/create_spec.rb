require 'rails_helper'

RSpec.describe "rooms#create", type: :request do
  subject(:make_request) do
    jsonapi_post "/api/v1/rooms", payload
  end

  describe 'basic create' do
    let(:params) do
      attributes_for(:room)
    end
    let(:payload) do
      {
        data: {
          type: 'rooms',
          attributes: params
        }
      }
    end

    it 'works' do
      expect(RoomResource).to receive(:build).and_call_original
      expect {
        make_request
        expect(response.status).to eq(201), response.body
      }.to change { Room.count }.by(1)
    end
  end
end
