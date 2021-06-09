require 'rails_helper'

RSpec.describe "rooms#destroy", type: :request do
  subject(:make_request) do
    jsonapi_delete "/api/v1/rooms/#{room.id}"
  end

  describe 'basic destroy' do
    let!(:room) { create(:room) }

    it 'updates the resource' do
      expect(RoomResource).to receive(:find).and_call_original
      expect {
        make_request
        expect(response.status).to eq(200), response.body
      }.to change { Room.count }.by(-1)
      expect { room.reload }
        .to raise_error(ActiveRecord::RecordNotFound)
      expect(json).to eq('meta' => {})
    end
  end
end
