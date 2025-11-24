# BetterDocs Test App

This is a minimal Rails application for testing BetterDocs.

## Setup

1. Install dependencies:
```bash
cd test_app
bundle install
```

2. Generate BetterDocs documentation:
```bash
bundle exec betterdocs deploy
```

3. Start the Rails server:
```bash
bundle exec rails server
# or
./start_server.sh
```

4. Visit http://localhost:3000/docs

## Test Files

- `definitions.json` - OpenAPI specification for testing
- `articles.json` - Sample documentation articles

These files are automatically used when you run `betterdocs deploy` from this directory.

## Troubleshooting

If you get errors:
1. Make sure you've run `bundle exec betterdocs deploy` first
2. Check that assets exist: `ls -la ../lib/better_docs/assets/viewer/`
3. Check Rails logs: `tail -f log/development.log`
