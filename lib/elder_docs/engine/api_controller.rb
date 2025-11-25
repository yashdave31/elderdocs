# frozen_string_literal: true

require 'json'

module ElderDocs
  class Engine
    class ApiController < ActionController::API
      include ActionController::MimeResponds
      
      def definitions
        definitions_path = find_definitions_file
        if definitions_path && File.exist?(definitions_path)
          render json: JSON.parse(File.read(definitions_path, encoding: 'UTF-8'))
        else
          render json: { error: 'definitions.json not found' }, status: :not_found
        end
      end
      
      def articles
        articles_path = find_articles_file
        if articles_path && File.exist?(articles_path)
          render json: JSON.parse(File.read(articles_path, encoding: 'UTF-8'))
        else
          render json: []
        end
      end
      
      def config
        # Reload config to get latest from elderdocs.yml
        ElderDocs.config.load_config_file
        
        config_data = {
          api_server: ElderDocs.config.api_server,
          api_servers: ElderDocs.config.api_servers || [],
          auth_types: ElderDocs.config.auth_types || ['bearer', 'api_key', 'basic', 'oauth2'],
          ui_config: ElderDocs.config.ui_config || {}
        }
        
        render json: config_data
      end
      
      private
      
      def find_definitions_file
        config = ElderDocs.config
        
        # Check config file for definitions_file path
        if config.respond_to?(:definitions_file) && config.definitions_file
          config_path = find_config_file
          if config_path
            config_dir = File.dirname(config_path)
            definitions_path = File.expand_path(config.definitions_file, config_dir)
            return definitions_path if File.exist?(definitions_path)
          end
        end
        
        # Fallback to standard locations
        paths = []
        if defined?(Rails) && Rails.root
          paths << Rails.root.join('definitions.json').to_s
          paths << Rails.root.join('elderdocs', 'definitions.json').to_s
        end
        paths << File.join(Dir.pwd, 'definitions.json')
        paths << File.join(Dir.pwd, 'elderdocs', 'definitions.json')
        
        paths.find { |path| File.exist?(path) }
      end
      
      def find_articles_file
        config = ElderDocs.config
        
        # Check config file for articles_file path
        if config.respond_to?(:articles_file) && config.articles_file
          config_path = find_config_file
          if config_path
            config_dir = File.dirname(config_path)
            articles_path = File.expand_path(config.articles_file, config_dir)
            return articles_path if File.exist?(articles_path)
          end
        end
        
        # Fallback to standard locations
        paths = []
        if defined?(Rails) && Rails.root
          paths << Rails.root.join('articles.json').to_s
          paths << Rails.root.join('elderdocs', 'articles.json').to_s
        end
        paths << File.join(Dir.pwd, 'articles.json')
        paths << File.join(Dir.pwd, 'elderdocs', 'articles.json')
        
        paths.find { |path| File.exist?(path) } || create_empty_articles_file
      end
      
      def create_empty_articles_file
        # Create empty articles.json if it doesn't exist
        default_path = if defined?(Rails) && Rails.root
          Rails.root.join('articles.json').to_s
        else
          File.join(Dir.pwd, 'articles.json')
        end
        
        File.write(default_path, [].to_json) unless File.exist?(default_path)
        default_path
      end
      
      def find_config_file
        config_paths = []
        if defined?(Rails) && Rails.root
          config_paths << Rails.root.join('elderdocs.yml').to_s
        end
        config_paths << File.join(Dir.pwd, 'elderdocs.yml')
        config_paths.find { |path| File.exist?(path) }
      end
    end
  end
end

