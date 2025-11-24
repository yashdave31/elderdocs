# frozen_string_literal: true

module BetterDocs
  class Engine < ::Rails::Engine
    isolate_namespace BetterDocs
    
    # Define routes inline
    routes do
      # UI Configuration endpoints (before catch-all)
      get '/ui', to: 'engine/ui_config#show'
      get '/ui/login', to: 'engine/ui_config#show_login'
      post '/ui/login', to: 'engine/ui_config#login'
      post '/ui/logout', to: 'engine/ui_config#logout'
      post '/ui/config', to: 'engine/ui_config#update'
      
      # Serve data.js explicitly before catch-all
      get '/data.js', to: 'engine/docs#show', defaults: { path: 'data.js' }
      root 'engine/docs#show', defaults: { path: 'index.html' }
      get '/*path', to: 'engine/docs#show', defaults: { path: 'index.html' }
    end
    
    # Note: Engine must be manually mounted in routes.rb
    # We provide a helper to check for conflicts
    initializer 'better_docs.check_routes' do |app|
      mount_path = BetterDocs.config.mount_path || '/docs'
      
      # Check if route already exists when routes are loaded
      app.config.after_initialize do
        begin
          # Try to generate URL helper for the mount path
          route_name = mount_path.gsub('/', '_').gsub('-', '_').sub(/^_/, '')
          if app.routes.url_helpers.respond_to?("#{route_name}_path")
            Rails.logger.warn "BetterDocs: Route #{mount_path} already exists. Please mount manually in config/routes.rb with a different path."
          end
        rescue => e
          # Route doesn't exist, which is fine
        end
      end
    end
    
    # Load UI config controller
    require_relative 'engine/ui_config_controller'
    
    # Create a simple controller to serve the static files
    # Use API base to avoid CSRF protection
    class DocsController < ActionController::API
      include ActionController::MimeResponds
      
      def show
        viewer_path = Engine.root.join('lib', 'better_docs', 'assets', 'viewer')
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

