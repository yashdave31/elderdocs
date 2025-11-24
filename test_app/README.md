# ElderDocs Test App

This is a minimal Rails application for testing ElderDocs.

## Setup

1. Install dependencies:
```bash
cd test_app
bundle install
```

2. Generate ElderDocs documentation:
```bash
bundle exec elderdocs deploy
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

These files are automatically used when you run `elderdocs deploy` from this directory.

## Troubleshooting

If you get errors:
1. Make sure you've run `bundle exec elderdocs deploy` first
2. Check that assets exist: `ls -la public/elderdocs/`
3. Check Rails logs: `tail -f log/development.log`
