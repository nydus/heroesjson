json:
	node generate.js "/Applications/Heroes of the Storm/"

diff:
	json-diff -C out/heroes.json ~/Source/www.heroesjson.com/heroes.json | less -r

website:
	cd web/; node generate.js "/Applications/Heroes of the Storm/" dev
