diff:
	json-diff -C ~/Source/www.heroesjson.com/heroes.json ~/Source/heroesjson/web/dist/heroes.json | less -r

latest:
	json-diff -C ~/Source/www.heroesjson.com/heroes.json ~/Source/heroesjson/web/dist/heroes.json | aha > latest.html

copy:
	cp ~/Source/heroesjson/web/dist/* ~/Source/www.heroesjson.com/

commit:
	git add latest.html
	git add index.html
	git add heroes.json
	git add mounts.json
