# frozen_string_literal: true

require 'thor'
require 'elder_docs/generator'

module ElderDocs
  class CLI < Thor
    desc 'deploy', 'Generate and deploy API documentation'
    method_option :definitions, type: :string, default: 'definitions.json', aliases: '-d'
    method_option :articles, type: :string, default: 'articles.json', aliases: '-a'
    method_option :output, type: :string, default: nil, aliases: '-o', desc: 'Directory to write built assets (default: public/elderdocs)'
    method_option :api_server, type: :string, default: nil, desc: 'Default API server URL'
    method_option :skip_build, type: :boolean, default: false, desc: 'Skip frontend build if assets exist'
    method_option :force_build, type: :boolean, default: false, desc: 'Force rebuilding frontend assets'
    
    def deploy
      say '🚀 Starting ElderDocs deployment...', :green
      
      definitions_path = options[:definitions]
      articles_path = options[:articles]
      
      unless File.exist?(definitions_path)
        say "❌ Error: #{definitions_path} not found in current directory", :red
        exit 1
      end
      
      unless File.exist?(articles_path)
        say "⚠️  Warning: #{articles_path} not found. Creating empty articles file...", :yellow
        File.write(articles_path, [].to_json)
      end
      
      output_path = File.expand_path(options[:output] || default_output_path, Dir.pwd)
      
      ElderDocs.config.output_path = output_path
      
      generator = Generator.new(
        definitions_path: definitions_path,
        articles_path: articles_path,
        output_path: output_path,
        api_server: options[:api_server],
        skip_build: options[:skip_build],
        force_build: options[:force_build]
      )
      
      begin
        generator.generate!
        say '✅ Documentation generated successfully!', :green
        say "📦 Assets placed in: #{generator.output_path}", :cyan
      rescue Generator::ValidationError => e
        say "❌ Validation Error: #{e.message}", :red
        exit 1
      rescue StandardError => e
        say "❌ Error: #{e.message}", :red
        say e.backtrace.first(5).join("\n"), :yellow if options[:verbose]
        exit 1
      end
    end
    
    desc 'version', 'Show ElderDocs version'
    def version
      say "ElderDocs version #{ElderDocs::VERSION}", :green
    end
    
    default_task :deploy
    
    private
    
    def default_output_path
      ElderDocs.config.output_path || File.join(Dir.pwd, 'public', 'elderdocs')
    end
  end
end

