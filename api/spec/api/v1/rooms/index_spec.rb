require 'rails_helper'

RSpec.describe "rooms#index", type: :request do
  let(:params) { {} }

  subject(:make_request) do
    jsonapi_get "/api/v1/rooms", params: params
  end

  describe 'basic fetch' do
    let!(:room1) { create(:room) }
    let!(:room2) { create(:room) }

    it 'works' do
      expect(RoomResource).to receive(:all).and_call_original
      make_request
      expect(response.status).to eq(200), response.body
      expect(d.map(&:jsonapi_type).uniq).to match_array(['rooms'])
      expect(d.map(&:id)).to match_array([room1.id, room2.id])
    end
  end
end
