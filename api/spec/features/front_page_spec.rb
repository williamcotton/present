require 'rails_helper'

feature 'Homepage Features' do
  before { visit '/' }

  it 'shows the front page', :js do
    User.create(name: 'Steve', email: 'steve@meve.com')
    expect(page).to have_content 'Hello, World!'
  end
end
