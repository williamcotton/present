require 'rails_helper'

RSpec.describe TeamResource, type: :resource do
  describe 'creating' do
    let(:payload) do
      {
        data: {
          type: 'teams',
          attributes: attributes_for(:team)
        }
      }
    end

    let(:instance) do
      TeamResource.build(payload)
    end

    it 'works' do
      expect {
        expect(instance.save).to eq(true), instance.errors.full_messages.to_sentence
      }.to change { Team.count }.by(1)
    end
  end

  describe 'updating' do
    let!(:team) { create(:team) }

    let(:payload) do
      {
        data: {
          id: team.id.to_s,
          type: 'teams',
          attributes: { } # Todo!
        }
      }
    end

    let(:instance) do
      TeamResource.find(payload)
    end

    xit 'works (add some attributes and enable this spec)' do
      expect {
        expect(instance.update_attributes).to eq(true)
      }.to change { team.reload.updated_at }
      # .and change { team.foo }.to('bar') <- example
    end
  end

  describe 'destroying' do
    let!(:team) { create(:team) }

    let(:instance) do
      TeamResource.find(id: team.id)
    end

    it 'works' do
      expect {
        expect(instance.destroy).to eq(true)
      }.to change { Team.count }.by(-1)
    end
  end
end
