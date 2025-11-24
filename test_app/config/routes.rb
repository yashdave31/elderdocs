Rails.application.routes.draw do
  mount BetterDocs::Engine, at: '/docs'
  
  # Handle Chrome DevTools requests (harmless, just silences the error)
  get '/.well-known/*path', to: proc { |_env| [404, {}, ['']] }
  
  root 'application#index'
end

