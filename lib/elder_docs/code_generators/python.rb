# frozen_string_literal: true

module ElderDocs
  module CodeGenerators
    class Python
      def initialize(request_data)
        @url = request_data[:url] || request_data['url']
        @method = (request_data[:method] || request_data['method'] || 'GET').to_s.upcase
        @headers = (request_data[:headers] || request_data['headers'] || {}).transform_keys(&:to_s)
        @body = request_data[:body] || request_data['body']
      end

      def generate(variant: 'requests')
        case variant.to_s.downcase
        when 'requests'
          generate_requests
        when 'httpx'
          generate_httpx
        else
          generate_requests
        end
      end

      private

      def generate_requests
        headers_str = format_headers_for_python
        body_str = format_body_for_python
        
        code = <<~PY
          import requests
          
          url = "#{escape_python(@url)}"
          headers = {
              #{headers_str}
          }#{body_str ? "\n          #{body_str}" : ''}
          
          response = requests.#{@method.downcase}(url#{body_str ? ', json=payload' : ''}, headers=headers)
          print(response.json())
        PY
        
        if body_str
          code = <<~PY
            import requests
            import json
            
            url = "#{escape_python(@url)}"
            headers = {
                #{headers_str}
            }
            payload = #{format_python_dict(@body)}
            
            response = requests.#{@method.downcase}(url, json=payload, headers=headers)
            print(response.json())
          PY
        end
        
        code.strip
      end

      def generate_httpx
        headers_str = format_headers_for_python
        body_str = format_body_for_python
        
        code = <<~PY
          import httpx
          
          url = "#{escape_python(@url)}"
          headers = {
              #{headers_str}
          }#{body_str ? "\n          #{body_str}" : ''}
          
          async with httpx.AsyncClient() as client:
              response = await client.#{@method.downcase}(url#{body_str ? ', json=payload' : ''}, headers=headers)
              print(response.json())
        PY
        
        if body_str
          code = <<~PY
            import httpx
            import json
            
            url = "#{escape_python(@url)}"
            headers = {
                #{headers_str}
            }
            payload = #{format_python_dict(@body)}
            
            async with httpx.AsyncClient() as client:
                response = await client.#{@method.downcase}(url, json=payload, headers=headers)
                print(response.json())
          PY
        end
        
        code.strip
      end

      def format_headers_for_python
        return '"Content-Type": "application/json"' if @headers.empty?
        
        @headers.map do |key, value|
          "    \"#{escape_python(key)}\": \"#{escape_python(value)}\""
        end.join(",\n")
      end

      def format_body_for_python
        return nil unless @body && ['POST', 'PUT', 'PATCH'].include?(@method)
        
        format_python_dict(@body)
      end

      def format_python_dict(body_str)
        begin
          parsed = JSON.parse(body_str)
          format_python_object(parsed)
        rescue JSON::ParserError
          "{'data': '#{escape_python(body_str)}'}"
        end
      end

      def format_python_object(obj, indent = 0)
        case obj
        when Hash
          if obj.empty?
            '{}'
          else
            items = obj.map do |k, v|
              "#{'  ' * (indent + 1)}\"#{k}\": #{format_python_object(v, indent + 1)}"
            end.join(",\n")
            "{\n#{items}\n#{'  ' * indent}}"
          end
        when Array
          if obj.empty?
            '[]'
          else
            items = obj.map { |v| "#{'  ' * (indent + 1)}#{format_python_object(v, indent + 1)}" }.join(",\n")
            "[\n#{items}\n#{'  ' * indent}]"
          end
        when String
          "\"#{escape_python(obj)}\""
        when Numeric, TrueClass, FalseClass, NilClass
          obj.inspect
        else
          "\"#{escape_python(obj.to_s)}\""
        end
      end

      def escape_python(str)
        str.to_s.gsub('\\', '\\\\').gsub('"', '\\"').gsub("\n", '\\n')
      end
    end
  end
end

