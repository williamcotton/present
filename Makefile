all: test/screenshots .env

.env:
	cp default.env $@

test/screenshots:
	mkdir -p $@