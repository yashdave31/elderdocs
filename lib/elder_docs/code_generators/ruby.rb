# frozen_string_literal: true

module ElderDocs
  module CodeGenerators
    class Ruby
      def initialize(request_data)
        @url = request_data[:url] || request_data['url']
        @method = (request_data[:method] || request_data['method'] || 'GET').to_s.upcase
        @headers = (request_data[:headers] || request_data['headers'] || {}).transform_keys(&:to_s)
        @body = request_data[:body] || request_data['body']
      end

      def generate(variant: 'net_http')
        case variant.to_s.downcase
        when 'net_http'
          generate_net_http
        when 'httparty'
          generate_httparty
        else
          generate_net_http
        end
      end

      private

      def generate_net_http
        require_str = "require 'net/http'\nrequire 'uri'\nrequire 'json'\n\n"
        headers_str = format_headers_for_ruby
        body_str = format_body_for_ruby
        
        code = <<~RUBY
          #{require_str}uri = URI('#{escape_ruby(@url)}')
          
          http = Net::HTTP.new(uri.host, uri.port)
          http.use_ssl = true if uri.scheme == 'https'
          
          request = Net::HTTP::#{@method.capitalize}.new(uri)
          request['Content-Type'] = 'application/json'
          #{headers_str.split("\n").map { |h| "request#{h}" }.join("\n  ")}#{body_str ? "\n  request.body = #{body_str}" : ''}
          
          response = http.request(request)
          puts JSON.parse(response.body)
        RUBY
        
        code.strip
      end

      def generate_httparty
        require_str = "require 'httparty'\nrequire 'json'\n\n"
        headers_str = format_headers_for_ruby_hash
        body_str = format_body_for_ruby
        
        code = <<~RUBY
          #{require_str}response = HTTParty.#{@method.downcase}(
            '#{escape_ruby(@url)}',
            headers: {
              'Content-Type' => 'application/json',
              #{headers_str}
            }#{body_str ? ",\n    body: #{body_str}" : ''}
          )
          
          puts JSON.parse(response.body)
        RUBY
        
        code.strip
      end

      def format_headers_for_ruby
        return '' if @headers.empty?
        
        @headers.map do |key, value|
          "['#{escape_ruby(key)}'] = '#{escape_ruby(value)}'"
        end.join("\n  request")
      end

      def format_headers_for_ruby_hash
        return '' if @headers.empty?
        
        @headers.map do |key, value|
          "  '#{escape_ruby(key)}' => '#{escape_ruby(value)}'"
        end.join(",\n")
      end

      def format_body_for_ruby
        return nil unless @body && ['POST', 'PUT', 'PATCH'].include?(@method)
        
        begin
          parsed = JSON.parse(@body)
          format_ruby_hash(parsed)
        rescue JSON::ParserError
          "'#{escape_ruby(@body)}'.to_json"
        end
      end

      def format_ruby_hash(obj, indent = 0)
        case obj
        when Hash
          if obj.empty?
            '{}'
          else
            items = obj.map do |k, v|
              "#{'  ' * (indent + 1)}'#{k}' => #{format_ruby_hash(v, indent + 1)}"
            end.join(",\n")
            "{\n#{items}\n#{'  ' * indent}}"
          end
        when Array
          if obj.empty?
            '[]'
          else
            items = obj.map { |v| "#{'  ' * (indent + 1)}#{format_ruby_hash(v, indent + 1)}" }.join(",\n")
            "[\n#{items}\n#{'  ' * indent}]"
          end
        when String
          "'#{escape_ruby(obj)}'"
        when Numeric, TrueClass, FalseClass, NilClass
          obj.inspect
        else
          "'#{escape_ruby(obj.to_s)}'"
        end
      end

      def escape_ruby(str)
        str.to_s.gsub('\\', '\\\\').gsub("'", "\\'").gsub("\n", '\\n')
      end
    end
  end
end

