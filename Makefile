postcreate:
	cd web && yarn install
	cd api && bundle install && rails db:create db:schema:load db:seed

test:
	cd api && rails s -d -e test
	cd web && yarn test
	cd api && rspec
	kill -9 `cat api/tmp/pids/server.pid`
	rm api/tmp/pids/server.pid
