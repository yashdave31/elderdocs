# frozen_string_literal: true

require 'pathname'

module ElderDocs
  class Engine < ::Rails::Engine
    isolate_namespace ElderDocs
    
    # Define routes inline
    routes do
      # API endpoints for dynamic data
      get '/api/definitions', to: 'engine/api#definitions'
      get '/api/articles', to: 'engine/api#articles'
      get '/api/config', to: 'engine/api#config'
      get '/api/supported-languages', to: 'engine/api#supported_languages'
      post '/api/generate-code', to: 'engine/api#generate_code'
      
      # Serve static assets
      root 'engine/docs#show', defaults: { path: 'index.html' }
      get '/*path', to: 'engine/docs#show', defaults: { path: 'index.html' }
    end
    
    # Note: Engine must be manually mounted in routes.rb
    # We provide a helper to check for conflicts
    initializer 'elder_docs.check_routes' do |app|
      mount_path = ElderDocs.config.mount_path || '/docs'
      
      # Check if route already exists when routes are loaded
      app.config.after_initialize do
        begin
          # Try to generate URL helper for the mount path
          route_name = mount_path.gsub('/', '_').gsub('-', '_').sub(/^_/, '')
          if app.routes.url_helpers.respond_to?("#{route_name}_path")
            Rails.logger.warn "ElderDocs: Route #{mount_path} already exists. Please mount manually in config/routes.rb with a different path."
          end
        rescue => e
          # Route doesn't exist, which is fine
        end
      end
    end
    
    # Load API controller
    require_relative 'engine/api_controller'
    
    # Create a simple controller to serve the static files
    # Use API base to avoid CSRF protection
    class DocsController < ActionController::API
      include ActionController::MimeResponds
      
      def show
        viewer_path = resolve_viewer_path
        requested_path = params[:path]
        requested_path = requested_path.present? ? requested_path : 'index'
        requested_path = [requested_path, params[:format]].compact.join('.')
        requested_path = 'index.html' if requested_path == 'index'
        file_path = viewer_path.join(requested_path)
        
        # Security check: ensure file is within viewer directory
        if file_path.exist? && file_path.to_s.start_with?(viewer_path.to_s)
          send_file file_path, disposition: 'inline', type: mime_type_for(file_path)
        else
          # Fallback to index.html for SPA routing (but not for data.js or assets)
          if requested_path.end_with?('.js') || requested_path.end_with?('.css') || requested_path.end_with?('.json')
            head :not_found
          else
            send_file viewer_path.join('index.html'), disposition: 'inline', type: 'text/html'
          end
        end
      end
      
      private
      
      def resolve_viewer_path
        custom_path = ElderDocs.config.output_path
        if custom_path && Dir.exist?(custom_path)
          Pathname.new(custom_path)
        else
          fallback_viewer_path
        end
      end
      
      def fallback_viewer_path
        Engine.root.join('lib', 'elder_docs', 'assets', 'viewer')
      end
      
      def mime_type_for(file_path)
        ext = File.extname(file_path.to_s)
        case ext
        when '.js'
          'application/javascript'
        when '.css'
          'text/css'
        when '.json'
          'application/json'
        when '.html'
          'text/html'
        when '.png'
          'image/png'
        when '.jpg', '.jpeg'
          'image/jpeg'
        when '.svg'
          'image/svg+xml'
        else
          'application/octet-stream'
        end
      end
    end
  end
end

