require 'rails_helper'

RSpec.describe "rooms#show", type: :request do
  let(:params) { {} }

  subject(:make_request) do
    jsonapi_get "/api/v1/rooms/#{room.id}", params: params
  end

  describe 'basic fetch' do
    let!(:room) { create(:room) }

    it 'works' do
      expect(RoomResource).to receive(:find).and_call_original
      make_request
      expect(response.status).to eq(200)
      expect(d.jsonapi_type).to eq('rooms')
      expect(d.id).to eq(room.id)
    end
  end
end
