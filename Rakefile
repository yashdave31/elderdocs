# frozen_string_literal: true

require 'bundler/gem_tasks'
require 'rspec/core/rake_task'

RSpec::Core::RakeTask.new(:spec)

task default: :spec

namespace :elderdocs do
  desc 'Build the gem'
  task :build do
    sh 'gem build elder_docs.gemspec'
  end

  desc 'Build and install locally (for development)'
  task :install do
    sh './dev_build.sh'
  end

  desc 'Build, test, and optionally publish'
  task :deploy do
    sh './build_and_deploy.sh'
  end

  desc 'Quick rebuild for development'
  task :dev do
    sh './dev_build.sh'
  end

  desc 'Show current version'
  task :version do
    version_file = 'lib/elder_docs/version.rb'
    if File.exist?(version_file)
      version = File.read(version_file).match(/VERSION = '(.+)'/)[1]
      puts "Current version: #{version}"
    else
      puts "Version file not found"
    end
  end
end

