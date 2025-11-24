class ApplicationController < ActionController::Base
  def index
    render plain: "BetterDocs Test App\n\nVisit /docs to see the documentation"
  end
end

