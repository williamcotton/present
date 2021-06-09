require 'rails_helper'

RSpec.describe "rooms#update", type: :request do
  subject(:make_request) do
    jsonapi_put "/api/v1/rooms/#{room.id}", payload
  end

  describe 'basic update' do
    let!(:room) { create(:room) }

    let(:payload) do
      {
        data: {
          id: room.id.to_s,
          type: 'rooms',
          attributes: {
            # ... your attrs here
          }
        }
      }
    end

    # Replace 'xit' with 'it' after adding attributes
    xit 'updates the resource' do
      expect(RoomResource).to receive(:find).and_call_original
      expect {
        make_request
        expect(response.status).to eq(200), response.body
      }.to change { room.reload.attributes }
    end
  end
end
