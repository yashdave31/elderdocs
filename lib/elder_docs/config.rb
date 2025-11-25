# frozen_string_literal: true

require 'yaml'
require 'pathname'

module ElderDocs
  class Config
    attr_accessor :mount_path, :api_server, :auth_types, :ui_config, :admin_password, :output_path, :definitions_file, :articles_file
    
    def initialize
      @mount_path = nil
      @api_server = nil
      @auth_types = ['bearer', 'api_key', 'basic', 'oauth2']
      @ui_config = {}
      @admin_password = nil
      @api_servers = []
      @output_path = default_output_path
      @definitions_file = nil
      @articles_file = nil
      load_config_file
    end
    
    def load_config_file
      # Try to find config file in Rails root or current directory
      config_paths = []
      
      if defined?(Rails) && Rails.root
        config_paths << Rails.root.join('elderdocs.yml').to_s
      end
      
      config_paths << File.join(Dir.pwd, 'elderdocs.yml')
      
      config_path = config_paths.find { |path| File.exist?(path) }
      return unless config_path
      
      begin
        config = YAML.load_file(config_path)
        config_dir = File.dirname(config_path)
        @mount_path = config['mount_path'] if config['mount_path']
        @api_server = config['api_server'] if config['api_server']
        @api_servers = config['api_servers'] if config['api_servers']
        @auth_types = config['auth_types'] if config['auth_types']
        @ui_config = config['ui'] if config['ui']  # YAML uses 'ui' key, but we store as ui_config
        @admin_password = config['admin_password'] if config['admin_password']
        @definitions_file = config['definitions_file'] if config['definitions_file']
        @articles_file = config['articles_file'] if config['articles_file']
        if config['output_path']
          @output_path = File.expand_path(config['output_path'], config_dir)
        end
      rescue => e
        warn "Warning: Could not load elderdocs.yml: #{e.message}"
      end
    end
    
    def default_output_path
      base_path =
        if defined?(Rails) && Rails.root
          Rails.root
        else
          Pathname.new(Dir.pwd)
        end
      
      base_path.join('public', 'elderdocs').to_s
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

