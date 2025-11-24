# frozen_string_literal: true

require_relative 'lib/better_docs/version'

Gem::Specification.new do |spec|
  spec.name          = 'better_docs'
  spec.version       = BetterDocs::VERSION
  spec.authors       = ['BetterDocs']
  spec.email         = ['hello@betterdocs.dev']

  spec.summary       = 'Interactive API documentation for Rails'
  spec.description   = 'Convert OpenAPI specs into beautiful, interactive documentation with live API testing'
  spec.homepage      = 'https://github.com/yourusername/better_docs'
  spec.license       = 'MIT'

  spec.files         = Dir['lib/**/*', 'exe/**/*', 'README.md', 'LICENSE.txt', 'betterdocs.yml.example']
  spec.bindir        = 'exe'
  spec.executables   = ['betterdocs']
  spec.require_paths = ['lib']

  spec.required_ruby_version = '>= 2.7.0'

  spec.add_dependency 'thor', '~> 1.2'
  spec.add_dependency 'openapi_parser', '~> 1.0'
  spec.add_dependency 'rails', '>= 6.0'
  spec.add_dependency 'json', '~> 2.6'

  spec.add_development_dependency 'bundler', '~> 2.0'
  spec.add_development_dependency 'rake', '~> 13.0'
end

