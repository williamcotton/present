postcreate:
	cd web && yarn install
	cd api && bundle install && rails db:create db:schema:load

test: 
	cd web && yarn test && cd ../api && rspec
