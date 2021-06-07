postcreate:
	cd web
	yarn install
	cd ../api
	bundle install
	rails db:create
	rails db:schema:load

test: 
	cd web && yarn test && cd ../api && rspec
