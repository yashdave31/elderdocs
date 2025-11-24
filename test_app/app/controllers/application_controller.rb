class ApplicationController < ActionController::Base
  def index
    render plain: "ElderDocs Test App\n\nVisit /docs to see the documentation"
  end
end

