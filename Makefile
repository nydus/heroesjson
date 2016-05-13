json:
	node generate.js "/Applications/Heroes of the Storm/"

diff:
	json-diff -C ~/Source/www.heroesjson.com/heroes.json out/heroes.json | less -r

website:
	cd web/; node generate.js "/Applications/Heroes of the Storm/" dev
