# frozen_string_literal: true

require 'yaml'

module BetterDocs
  class Config
    attr_accessor :mount_path, :api_server, :auth_types, :ui_config, :admin_password
    
    def initialize
      @mount_path = nil
      @api_server = nil
      @auth_types = ['bearer', 'api_key', 'basic', 'oauth2']
      @ui_config = {}
      @admin_password = nil
      load_config_file
    end
    
    def load_config_file
      # Try to find config file in Rails root or current directory
      config_paths = []
      
      if defined?(Rails) && Rails.root
        config_paths << Rails.root.join('betterdocs.yml').to_s
      end
      
      config_paths << File.join(Dir.pwd, 'betterdocs.yml')
      
      config_path = config_paths.find { |path| File.exist?(path) }
      return unless config_path
      
      begin
          config = YAML.load_file(config_path)
          @mount_path = config['mount_path'] if config['mount_path']
          @api_server = config['api_server'] if config['api_server']
          @api_servers = config['api_servers'] if config['api_servers']
          @auth_types = config['auth_types'] if config['auth_types']
          @ui_config = config['ui'] if config['ui']  # YAML uses 'ui' key, but we store as ui_config
          @admin_password = config['admin_password'] if config['admin_password']
        rescue => e
          warn "Warning: Could not load betterdocs.yml: #{e.message}"
        end
      end
      
      attr_reader :api_servers
    
    def self.instance
      @instance ||= new
    end
  end
  
  def self.config
    Config.instance
  end
end

