# frozen_string_literal: true

require 'json'
require 'openapi_parser'
require 'fileutils'

module ElderDocs
  class Generator
    class ValidationError < StandardError; end
    
    attr_reader :definitions_path, :articles_path, :output_path, :api_server, :skip_build, :force_build
    
    def initialize(definitions_path:, articles_path:, output_path:, api_server: nil, skip_build: false, force_build: false)
      @definitions_path = definitions_path
      @articles_path = articles_path
      @output_path = File.expand_path(output_path, Dir.pwd)
      @api_server = api_server
      @skip_build = skip_build
      @force_build = force_build
    end
    
    def generate!
      validate_definitions!
      validate_articles!
      compile_data!
      
      # Check if assets already exist
      assets_exist = File.exist?(File.join(output_path, 'index.html'))
      
      if skip_build || (assets_exist && !force_build)
        say '⏭️  Skipping frontend build (assets already exist)', :yellow
        say '💾 Updating data.js only...', :cyan
        # Still update data.js with latest compiled data
        FileUtils.mkdir_p(output_path)
        File.write(File.join(output_path, 'data.js'), @compiled_data_js)
        say '✅ Data updated', :green
      else
        build_frontend!
        copy_assets!
      end
    end
    
    def build_frontend_only!
      # Build frontend without data compilation (for dynamic mode)
      # Check if assets already exist
      assets_exist = File.exist?(File.join(output_path, 'index.html'))
      
      if skip_build || (assets_exist && !force_build)
        say '⏭️  Skipping frontend build (assets already exist)', :yellow
        say '💡 Run with --force-build to rebuild', :cyan
      else
        build_frontend!
        copy_assets!
      end
    end
    
    private
    
    def validate_definitions!
      say '📋 Validating OpenAPI definitions...', :cyan
      
      begin
        # Parse JSON first to ensure it's valid JSON (read as UTF-8)
        json_content = File.read(definitions_path, encoding: 'UTF-8')
        parsed_json = JSON.parse(json_content)
        
        # Basic OpenAPI structure validation
        unless parsed_json.is_a?(Hash)
          raise ValidationError, 'OpenAPI definition must be a JSON object'
        end
        
        unless parsed_json['openapi'] || parsed_json['swagger']
          raise ValidationError, 'OpenAPI definition must include "openapi" or "swagger" field'
        end
        
        unless parsed_json['info']
          raise ValidationError, 'OpenAPI definition must include "info" field'
        end
        
        unless parsed_json['paths']
          raise ValidationError, 'OpenAPI definition must include "paths" field'
        end
        
        # Try to validate with OpenAPIParser, but don't fail if it has issues
        begin
          parser = OpenAPIParser.parse(
            json_content,
            {
              strict_reference_validation: false,
              coerce_value: false
            }
          )
          
          unless parser.valid?
            say '⚠️  Warning: OpenAPI parser validation failed, but continuing anyway', :yellow
          end
        rescue => parser_error
          say "⚠️  Warning: OpenAPI parser error (#{parser_error.message}), but continuing with basic validation", :yellow
        end
        
        # Use the parsed JSON directly, convert symbol keys to string keys for consistency
        @openapi_data = deep_stringify_keys(parsed_json)
        say '✅ OpenAPI definitions validated', :green
      rescue JSON::ParserError => e
        raise ValidationError, "Invalid JSON in definitions file: #{e.message}"
      rescue ValidationError
        raise
      rescue => e
        raise ValidationError, "Error processing OpenAPI definition: #{e.message}"
      end
    end
    
    def deep_stringify_keys(obj)
      case obj
      when Hash
        obj.each_with_object({}) do |(key, value), result|
          result[key.to_s] = deep_stringify_keys(value)
        end
      when Array
        obj.map { |item| deep_stringify_keys(item) }
      else
        obj
      end
    end
    
    def validate_articles!
      say '📚 Validating articles...', :cyan
      
      begin
        # Read as UTF-8 to handle emojis and special characters
        articles_content = File.read(articles_path, encoding: 'UTF-8')
        @articles_data = JSON.parse(articles_content)
        
        unless @articles_data.is_a?(Array)
          raise ValidationError, 'articles.json must be an array'
        end
        
        @articles_data.each_with_index do |article, index|
          validate_article!(article, index)
        end
        
        say '✅ Articles validated', :green
      rescue JSON::ParserError => e
        raise ValidationError, "Invalid JSON in articles file: #{e.message}"
      end
    end
    
    def validate_article!(article, index)
      required_fields = %w[id title markdown_content]
      missing_fields = required_fields - article.keys
      
      if missing_fields.any?
        raise ValidationError, "Article at index #{index} missing required fields: #{missing_fields.join(', ')}"
      end
      
      unless article['id'].is_a?(String) && !article['id'].empty?
        raise ValidationError, "Article at index #{index} must have a non-empty string 'id'"
      end
      
      unless article['title'].is_a?(String) && !article['title'].empty?
        raise ValidationError, "Article at index #{index} must have a non-empty string 'title'"
      end
      
      unless article['markdown_content'].is_a?(String)
        raise ValidationError, "Article at index #{index} must have a string 'markdown_content'"
      end
    end
    
    def compile_data!
      say '📦 Compiling data...', :cyan
      
      # Get API server from: CLI option > config file > OpenAPI servers
      final_api_server = api_server || ElderDocs.config.api_server || extract_api_server_from_openapi
      final_api_servers = ElderDocs.config.api_servers || []
      
      compiled_data = {
        openapi: @openapi_data,
        articles: @articles_data,
        api_server: final_api_server,
        api_servers: final_api_servers,
        auth_types: ElderDocs.config.auth_types || ['bearer', 'api_key', 'basic', 'oauth2'],
        ui_config: ElderDocs.config.ui_config || {},
        generated_at: Time.now.iso8601
      }
      
      @compiled_data_js = <<~JS
        window.ElderDocsData = #{compiled_data.to_json};
        window.dispatchEvent(new Event('elderdocs:data_loaded'));
      JS
      
      say '✅ Data compiled', :green
    end
    
    def extract_api_server_from_openapi
      servers = @openapi_data.dig('servers') || []
      servers.first&.dig('url') || ''
    end
    
    def build_frontend!
      say '🔨 Building frontend...', :cyan
      
      # Try multiple locations for frontend directory
      # 1. Relative to lib (development repo)
      # 2. At gem root (installed gem)
      # 3. Using Engine.root if available (Rails context)
      possible_paths = [
        File.join(File.dirname(__FILE__), '..', '..', 'frontend'), # Development: lib/elder_docs/../../frontend
        File.join(File.dirname(__FILE__), '..', '..', '..', 'frontend'), # Installed gem: lib/elder_docs/../../../frontend
      ]
      
      # If Engine is available, try relative to gem root
      if defined?(ElderDocs::Engine) && ElderDocs::Engine.root
        possible_paths << ElderDocs::Engine.root.join('frontend').to_s
      end
      
      frontend_dir = possible_paths.find { |path| Dir.exist?(path) }
      
      unless frontend_dir && Dir.exist?(frontend_dir)
        raise ValidationError, "Frontend directory not found. Tried: #{possible_paths.join(', ')}"
      end
      
      frontend_dir = File.expand_path(frontend_dir)
      
      # Write compiled data to frontend public directory (only if in static mode)
      if @compiled_data_js
        public_dir = File.join(frontend_dir, 'public')
        FileUtils.mkdir_p(public_dir)
        File.write(File.join(public_dir, 'data.js'), @compiled_data_js)
      end
      
      # Check if node_modules exists, if not, run npm install
      node_modules = File.join(frontend_dir, 'node_modules')
      unless Dir.exist?(node_modules)
        say '📦 Installing npm dependencies...', :cyan
        system("cd #{frontend_dir} && npm install") || raise('Failed to install npm dependencies')
      end
      
      # Run Vite build
      say '⚡ Running Vite build...', :cyan
      build_success = system("cd #{frontend_dir} && npm run build")
      
      unless build_success
        raise ValidationError, 'Frontend build failed'
      end
      
      @build_output_dir = File.join(frontend_dir, 'dist')
      
      unless Dir.exist?(@build_output_dir)
        raise ValidationError, 'Build output directory not found'
      end
      
      say '✅ Frontend built successfully', :green
    end
    
    def copy_assets!
      say '📁 Copying assets...', :cyan
      
      FileUtils.mkdir_p(output_path)
      FileUtils.rm_rf(Dir.glob(File.join(output_path, '*')))
      
      # Copy all files from dist to output_path
      Dir.glob(File.join(@build_output_dir, '**', '*')).each do |source|
        next if File.directory?(source)
        
        relative_path = source.sub(@build_output_dir + '/', '')
        dest_path = File.join(output_path, relative_path)
        FileUtils.mkdir_p(File.dirname(dest_path))
        FileUtils.cp(source, dest_path)
      end
      
      # Fix asset paths in index.html to work with engine mount point
      index_html_path = File.join(output_path, 'index.html')
      if File.exist?(index_html_path)
        html_content = File.read(index_html_path, encoding: 'UTF-8')
        mount_path = normalized_mount_path
        html_content.gsub!(/src="\.\//, %{src="#{mount_path}/})
        html_content.gsub!(/href="\.\//, %{href="#{mount_path}/})
        html_content.gsub!(/src="\/assets\//, %{src="#{mount_path}/assets/})
        html_content.gsub!(/href="\/assets\//, %{href="#{mount_path}/assets/})
        html_content.gsub!(/src="\/data\.js/, %{src="#{mount_path}/data.js})
        File.write(index_html_path, html_content)
      end
      
      say '✅ Assets copied', :green
    end
    
    def say(message, color = nil)
      return unless defined?(Thor)
      
      Thor::Base.shell.new.say(message, color)
    end
    
    def normalized_mount_path
      mount_path = ElderDocs.config.mount_path || '/docs'
      mount_path = "/#{mount_path}" unless mount_path.start_with?('/')
      mount_path = '/' if mount_path == '//'
      mount_path = mount_path.chomp('/')
      mount_path.empty? ? '' : mount_path
    end
  end
end

