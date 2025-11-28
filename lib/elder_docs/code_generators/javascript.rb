# frozen_string_literal: true

module ElderDocs
  module CodeGenerators
    class Javascript
      def initialize(request_data)
        @url = request_data[:url] || request_data['url']
        @method = (request_data[:method] || request_data['method'] || 'GET').to_s.upcase
        @headers = (request_data[:headers] || request_data['headers'] || {}).transform_keys(&:to_s)
        @body = request_data[:body] || request_data['body']
      end

      def generate(variant: 'fetch')
        case variant.to_s.downcase
        when 'fetch'
          generate_fetch
        when 'axios'
          generate_axios
        else
          generate_fetch
        end
      end

      private

      def generate_fetch
        headers_str = format_headers_for_js
        body_str = format_body_for_js
        
        code = <<~JS
          const response = await fetch('#{escape_js(@url)}', {
            method: '#{@method}',
            headers: {
              #{headers_str}
            }#{body_str ? ",\n    body: #{body_str}" : ''}
          });
          
          const data = await response.json();
          console.log(data);
        JS
        
        code.strip
      end

      def generate_axios
        headers_str = format_headers_for_js
        body_str = format_body_for_js
        
        config = <<~JS
          {
            method: '#{@method.downcase}',
            url: '#{escape_js(@url)}',
            headers: {
              #{headers_str}
            }#{body_str ? ",\n    data: #{body_str}" : ''}
          }
        JS
        
        code = <<~JS
          const axios = require('axios');
          
          const response = await axios(#{config.strip});
          console.log(response.data);
        JS
        
        code.strip
      end

      def format_headers_for_js
        return "'Content-Type': 'application/json'" if @headers.empty?
        
        @headers.map do |key, value|
          "  '#{escape_js(key)}': '#{escape_js(value)}'"
        end.join(",\n")
      end

      def format_body_for_js
        return nil unless @body && @body != 'null' && @body != 'nil' && ['POST', 'PUT', 'PATCH'].include?(@method)
        
        # Try to parse as JSON to format it nicely
        begin
          parsed = JSON.parse(@body.to_s)
          "JSON.stringify(#{parsed.inspect})"
        rescue JSON::ParserError, TypeError
          "'#{escape_js(@body.to_s)}'"
        end
      end

      def escape_js(str)
        str.to_s.gsub('\\', '\\\\').gsub("'", "\\'").gsub("\n", '\\n')
      end
    end
  end
end

