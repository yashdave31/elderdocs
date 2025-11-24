# frozen_string_literal: true

require_relative 'lib/elder_docs/version'

Gem::Specification.new do |spec|
  spec.name          = 'elder_docs'
  spec.version       = ElderDocs::VERSION
  spec.authors       = ['ElderDocs']
  spec.email         = ['yashdave00@gmail.com']

  spec.summary       = 'Interactive API documentation for Rails'
  spec.description   = 'Convert OpenAPI specs into beautiful, interactive documentation with live API testing'
  spec.homepage      = 'https://github.com/yashdave31/elder_docs'
  spec.license       = 'MIT'

  spec.files         = Dir['lib/**/*', 'exe/**/*', 'README.md', 'LICENSE.txt', 'elderdocs.yml.example']
  spec.bindir        = 'exe'
  spec.executables   = ['elderdocs']
  spec.require_paths = ['lib']

  spec.required_ruby_version = '>= 2.7.0'

  spec.add_dependency 'thor', '~> 1.2'
  spec.add_dependency 'openapi_parser', '~> 1.0'
  spec.add_dependency 'rails', '>= 6.0'
  spec.add_dependency 'json', '~> 2.6'

  spec.add_development_dependency 'bundler', '~> 2.0'
  spec.add_development_dependency 'rake', '~> 13.0'
end

