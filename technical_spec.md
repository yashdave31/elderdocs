ElderDocs: Interactive API Documentation Platform

1. Introduction and Project Goal

Project Name: ElderDocs
Objective: To provide a highly interactive, modern, and minimalist API documentation solution that is easily deployed alongside Ruby on Rails applications. It converts standard OpenAPI specifications (definitions.json) and custom narrative content (articles.json) into a cohesive, single-page application (SPA) allowing users to directly interact with API endpoints.
Packaging: Ruby Gem (for seamless integration into the Rails asset pipeline and rake tasks).
Aesthetics: Modern, minimalist, and developer-centric design utilizing Tailwind CSS.

2. Architecture and Data Flow

ElderDocs uses a three-tier architecture: the CLI/Generator, the Data Layer, and the Frontend Viewer. The core principle is static generation for performance, with client-side JavaScript handling interactivity and API calls.

2.1 Core Components

CLI (Command Line Interface): The entry point for the user. Written in Ruby, it handles parsing, generation, and deployment tasks.

Generator (Ruby): The engine that processes input JSON files, validates them, and transforms the data into optimized, structured assets consumed by the React Viewer.

Frontend Viewer (React SPA): The client-side application responsible for rendering documentation, handling UI state, managing API keys, and executing real-time API calls.

Rails Integration (Ruby Gem): Handles mounting the generated static assets (HTML, JS, CSS) within the host Rails application, allowing it to be served under a specific route (e.g., /docs).

2.2 Technology Stack

Component

Technology

Rationale

Generator/CLI

Ruby, Thor Gem

Native integration with the Rails ecosystem and command-line execution (e.g., elderdocs deploy).

OpenAPI Parsing

openapi_parser (Ruby)

Reliable parsing and validation of OpenAPI/Swagger definitions directly within the Ruby CLI.

Frontend UI

React.js (with Vite build)

Provides a fast, component-based structure essential for a complex, interactive SPA.

Styling

Tailwind CSS

Ensures a consistent, modern, and minimalist design with rapid development and responsiveness.

Deployment Integration

Rails Asset Pipeline/Engine

Allows the Gem to compile and serve the static SPA files using standard Rails mechanisms.

3. Input Data Structures

The system relies on two primary input files, both located in the host application's root directory.

3.1 definitions.json (OpenAPI/Swagger 3.x)

This file must conform to the OpenAPI 3.x specification. It defines the API structure, including endpoints, methods, parameters, request bodies, and response schemas.

Example Snippet:

{
  "openapi": "3.0.0",
  "info": { ... },
  "paths": {
    "/users": {
      "get": {
        "summary": "Retrieve a list of users",
        "parameters": [ ... ],
        "responses": { ... }
      }
    }
  }
}


3.2 articles.json (Custom Narrative Documentation)

This file contains custom, long-form documentation (Markdown) organized hierarchically to create the navigation structure for the "Articles" or "Guides" section of the platform.

Structure:

[
  {
    "id": "getting_started",
    "title": "1. Getting Started",
    "markdown_content": "## Introduction\nWelcome to our API! This guide will help you set up..."
  },
  {
    "id": "authentication",
    "title": "2. Authentication",
    "markdown_content": "We use Bearer Tokens. Enter your key in the top bar to enable API interaction."
  },
  {
    "id": "endpoint_specific_guide",
    "title": "Endpoint Guide: Users",
    "related_path": "/users",
    "markdown_content": "This article expands on the `/users` endpoint..."
  }
]


4. Key Features and Implementation Details

4.1 CLI Deployment (elderdocs deploy)

The elderdocs deploy command orchestrates the build process:

Validation: The Ruby CLI validates both definitions.json (against the OpenAPI schema) and articles.json (against the required custom structure).

Data Compilation: OpenAPI and Article data are compiled into a single, optimized JavaScript object (data.js) to minimize initial load time and provide a structured data source for the React Viewer.

Frontend Build: The command triggers the internal Vite/React build process, which bundles the SPA and integrates data.js.

Asset Placement: The generated static assets (HTML, bundle.js, style.css) are placed into a directory within the Gem (e.g., lib/elder_docs/assets/).

4.2 Interactive API Explorer

The React Viewer will render API documentation alongside an interactive request panel.

Request Panel: Allows users to input required parameters, headers, and request body payload.

Authentication State: A globally accessible React Context manages the API Key. When the user enters a key (e.g., a Bearer Token), it is stored in the component state (or localStorage for persistence across sessions, but securely handled on the client side only) and automatically included in all subsequent requests sent via the Explorer.

Request Execution: Uses window.fetch to execute requests against the defined API server, displaying the raw request, response status, headers, and body in a clean, syntax-highlighted format.

4.3 Design and User Experience (UX)

The design will be driven entirely by Tailwind CSS for a minimalist feel.

Layout: Three-column layout:

Left Sidebar (Navigation): Toggle between "API Reference" (OpenAPI structure) and "Articles" (Custom Guides).

Central Content: Detailed documentation (rendered Markdown) for the selected endpoint or article.

Right Panel (Try It Out): The interactive API request/response panel.

Aesthetics: High contrast (dark mode suggested), use of large, clear typography (Inter font), subtle shadows, and rounded corners for interactive elements.

Responsiveness: Full support for mobile devices, collapsing the right "Try It Out" panel into a sticky bottom tab or modal on small screens.

5. Ruby Gem and Rails Compatibility

ElderDocs will be packaged as a standard Ruby Gem, utilizing a Rails Engine to integrate the generated assets without requiring manual user configuration in the Rails host application.

5.1 Gem Structure

elder_docs_gem/
├── lib/
│   ├── elder_docs.rb           # Gem initialization
│   ├── elder_docs/
│   │   ├── engine.rb            # Rails Engine definition (Critical for integration)
│   │   ├── cli.rb               # Thor CLI definitions
│   │   └── generator.rb         # Data processing and build orchestration
│   └── elder_docs/assets/
│       └── viewer/              # Generated static React files (HTML, JS, CSS)
│           └── index.html
├── frontend/
│   └── src/                     # React source code (Not included in the final Gem)
│       └── App.jsx
└── elder_docs.gemspec


5.2 Rails Engine Integration (engine.rb)

The ElderDocs::Engine module will automatically perform two key actions when the Gem is loaded into a Rails app:

Asset Serving: It will instruct Rails to serve the static assets located in lib/elder_docs/assets/viewer during deployment.

Route Mounting: It will automatically mount the documentation viewer at a user-defined or default route (e.g., /docs) using mount ElderDocs::Engine, at: '/docs'.

5.3 Deployment Workflow

Developer Action (Local/CI): The developer runs elderdocs deploy.

Generator: The Ruby generator parses the JSON files, bundles the React SPA, and places the resulting static files into the Gem's asset directory (lib/elder_docs/assets/viewer).

Rails Deployment: The host Rails application is deployed. Since the assets are part of the Gem, the Rails Asset Pipeline detects and serves them, making the documentation live at the configured route (e.g., yourdomain.com/docs).