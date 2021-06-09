require 'rails_helper'

RSpec.describe "teams#update", type: :request do
  subject(:make_request) do
    jsonapi_put "/api/v1/teams/#{team.id}", payload
  end

  describe 'basic update' do
    let!(:team) { create(:team) }

    let(:payload) do
      {
        data: {
          id: team.id.to_s,
          type: 'teams',
          attributes: {
            # ... your attrs here
          }
        }
      }
    end

    # Replace 'xit' with 'it' after adding attributes
    xit 'updates the resource' do
      expect(TeamResource).to receive(:find).and_call_original
      expect {
        make_request
        expect(response.status).to eq(200), response.body
      }.to change { team.reload.attributes }
    end
  end
end
