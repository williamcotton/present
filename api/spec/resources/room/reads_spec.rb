require 'rails_helper'

RSpec.describe RoomResource, type: :resource do
  describe 'serialization' do
    let!(:room) { create(:room) }

    it 'works' do
      render
      data = jsonapi_data[0]
      expect(data.id).to eq(room.id)
      expect(data.jsonapi_type).to eq('rooms')
    end
  end

  describe 'filtering' do
    let!(:room1) { create(:room) }
    let!(:room2) { create(:room) }

    context 'by id' do
      before do
        params[:filter] = { id: { eq: room2.id } }
      end

      it 'works' do
        render
        expect(d.map(&:id)).to eq([room2.id])
      end
    end
  end

  describe 'sorting' do
    describe 'by id' do
      let!(:room1) { create(:room) }
      let!(:room2) { create(:room) }

      context 'when ascending' do
        before do
          params[:sort] = 'id'
        end

        it 'works' do
          render
          expect(d.map(&:id)).to eq([
            room1.id,
            room2.id
          ])
        end
      end

      context 'when descending' do
        before do
          params[:sort] = '-id'
        end

        it 'works' do
          render
          expect(d.map(&:id)).to eq([
            room2.id,
            room1.id
          ])
        end
      end
    end
  end

  describe 'sideloading' do
    # ... your tests ...
  end
end
