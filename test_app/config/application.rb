require_relative 'boot'

# Only require what we need - skip ActiveRecord and other unnecessary components
require "rails"
require "active_model/railtie"
require "action_controller/railtie"
require "action_view/railtie"
require "sprockets/railtie"

Bundler.require(*Rails.groups)

module TestApp
  class Application < Rails::Application
    config.load_defaults 7.0
    config.api_only = false
  end
end

