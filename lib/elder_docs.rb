# frozen_string_literal: true

require 'elder_docs/version'
require 'elder_docs/config'
require 'elder_docs/engine' if defined?(Rails)
require 'elder_docs/cli'
require 'elder_docs/generator'
require 'elder_docs/code_generator'

module ElderDocs
  class Error < StandardError; end
end

