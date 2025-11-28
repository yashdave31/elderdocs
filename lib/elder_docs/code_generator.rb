# frozen_string_literal: true

module ElderDocs
  class CodeGenerator
    LANGUAGES = {
      javascript: { name: 'JavaScript', variants: ['fetch', 'axios'] },
      python: { name: 'Python', variants: ['requests', 'httpx'] },
      ruby: { name: 'Ruby', variants: ['net_http', 'httparty'] },
      php: { name: 'PHP', variants: ['curl', 'guzzle'] },
      go: { name: 'Go', variants: ['net_http'] },
      java: { name: 'Java', variants: ['okhttp', 'httpclient'] },
      csharp: { name: 'C#', variants: ['httpclient'] },
      swift: { name: 'Swift', variants: ['urlsession'] },
      kotlin: { name: 'Kotlin', variants: ['okhttp'] }
    }.freeze

    def self.generate(request_data, language:, variant: nil)
      language_sym = language.to_s.downcase.to_sym
      
      unless LANGUAGES.key?(language_sym)
        raise ArgumentError, "Unsupported language: #{language}"
      end

      generator_class_name = language_sym.to_s.split('_').map(&:capitalize).join
      generator_class = begin
        CodeGenerators.const_get(generator_class_name)
      rescue NameError
        raise ArgumentError, "Generator not implemented for language: #{language}"
      end

      generator = generator_class.new(request_data)
      variant ||= LANGUAGES[language_sym][:variants].first
      generator.generate(variant: variant.to_s)
    end

    def self.supported_languages
      LANGUAGES
    end
  end
end

# Load all code generators
require_relative 'code_generators/javascript'
require_relative 'code_generators/python'
require_relative 'code_generators/ruby'

