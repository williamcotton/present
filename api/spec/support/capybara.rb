RSpec.configure do |config|
  config.before(:each) do |example|
    Capybara.current_driver = :chrome_headless if example.metadata[:js]
  end

  config.after(:each) do
    Capybara.use_default_driver
  end
end

Capybara.register_driver :chrome_headless do |app|
  options = ::Selenium::WebDriver::Chrome::Options.new

  options.add_argument('--headless')
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-dev-shm-usage')
  options.add_argument('--window-size=1400,1400')

  Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
end

Capybara.javascript_driver = :chrome_headless

# Capybara.javascript_driver = :selenium_chrome_headless

Capybara.app_host = 'http://localhost:4200'
Capybara.run_server = false
