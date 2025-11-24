# frozen_string_literal: true

require 'yaml'

module BetterDocs
  class Engine
    class UiConfigController < ActionController::Base
      include ActionController::MimeResponds
      
      # Enable sessions for authentication
      protect_from_forgery with: :null_session
      
      # Simple session-based authentication
      before_action :authenticate_admin, only: [:update]
      before_action :check_auth_for_api, only: [:show]
      
      def show_login
        render json: { requires_auth: true }
      end
      
      def login
        admin_password = BetterDocs.config.admin_password || ENV['BETTERDOCS_ADMIN_PASSWORD'] || 'admin'
        
        if params[:password] == admin_password
          session[:betterdocs_admin] = true
          render json: { success: true, message: 'Authentication successful' }
        else
          render json: { success: false, error: 'Invalid password' }, status: :unauthorized
        end
      end
      
      def show
        # If requesting HTML, serve the UI configurator page
        if request.format.html? || request.headers['Accept']&.include?('text/html')
          ui_config_path = Engine.root.join('lib', 'better_docs', 'assets', 'ui_config.html')
          if ui_config_path.exist?
            send_file ui_config_path, disposition: 'inline', type: 'text/html'
          else
            render plain: 'UI Configurator not found', status: :not_found
          end
        else
          # API endpoint - return JSON config (auth checked in check_auth_for_api)
          config_path = find_config_file
          current_config = load_config(config_path)
          
          render json: {
            ui_config: current_config['ui'] || {},
            config_path: config_path
          }
        end
      end
      
      def update
        config_path = find_config_file
        
        # Load existing config
        config = load_config(config_path) || {}
        
        # Update UI config
        config['ui'] = {
          'font_heading' => params[:font_heading],
          'font_body' => params[:font_body],
          'colors' => {
            'primary' => params[:color_primary],
            'secondary' => params[:color_secondary],
            'background' => params[:color_background],
            'surface' => params[:color_surface]
          },
          'corner_radius' => params[:corner_radius]
        }
        
        # Save to file
        save_config(config_path, config)
        
        # Reload config in memory
        BetterDocs.config.load_config_file
        
        render json: {
          success: true,
          message: 'UI configuration saved successfully',
          ui_config: config['ui']
        }
      end
      
      def logout
        session[:betterdocs_admin] = nil
        render json: { success: true, message: 'Logged out successfully' }
      end
      
      private
      
      def authenticate_admin
        unless session[:betterdocs_admin]
          render json: { requires_auth: true, error: 'Authentication required' }, status: :unauthorized
        end
      end
      
      def check_auth_for_api
        # Only require auth for JSON API requests, not HTML
        return if request.format.html? || request.headers['Accept']&.include?('text/html')
        
        authenticate_admin
      end
      
      def find_config_file
        config_paths = []
        
        if defined?(Rails) && Rails.root
          config_paths << Rails.root.join('betterdocs.yml').to_s
        end
        
        config_paths << File.join(Dir.pwd, 'betterdocs.yml')
        
        config_path = config_paths.find { |path| File.exist?(path) }
        
        # Create default config file if it doesn't exist
        unless config_path
          config_path = config_paths.first || File.join(Dir.pwd, 'betterdocs.yml')
          File.write(config_path, {}.to_yaml)
        end
        
        config_path
      end
      
      def load_config(config_path)
        return {} unless File.exist?(config_path)
        
        begin
          YAML.load_file(config_path) || {}
        rescue => e
          Rails.logger.error "Error loading config: #{e.message}"
          {}
        end
      end
      
      def save_config(config_path, config)
        File.write(config_path, config.to_yaml)
      rescue => e
        Rails.logger.error "Error saving config: #{e.message}"
        raise
      end
    end
  end
end

