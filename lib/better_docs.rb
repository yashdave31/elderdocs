# frozen_string_literal: true

require 'better_docs/version'
require 'better_docs/config'
require 'better_docs/engine' if defined?(Rails)
require 'better_docs/cli'
require 'better_docs/generator'

module BetterDocs
  class Error < StandardError; end
end

