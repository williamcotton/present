Rails.application.routes.draw do
  scope path: ApplicationResource.endpoint_namespace, defaults: { format: :jsonapi } do
    resources :posts
    resources :rooms
    resources :teams
    resources :users
    resources :room_connections
    mount VandalUi::Engine, at: '/vandal'
  end
  post '/team_status/:team_name/:room_name', to: 'team_status_webhook#create'
end
