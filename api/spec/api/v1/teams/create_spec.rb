require 'rails_helper'

RSpec.describe "teams#create", type: :request do
  subject(:make_request) do
    jsonapi_post "/api/v1/teams", payload
  end

  describe 'basic create' do
    let(:params) do
      attributes_for(:team)
    end
    let(:payload) do
      {
        data: {
          type: 'teams',
          attributes: params
        }
      }
    end

    it 'works' do
      expect(TeamResource).to receive(:build).and_call_original
      expect {
        make_request
        expect(response.status).to eq(201), response.body
      }.to change { Team.count }.by(1)
    end
  end
end
