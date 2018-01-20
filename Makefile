
all:
.PHONY: all run
.PHONY: overwrite change_dictionary dictionary copy package

run: overwrite
	make run -C lina_dicto/

overwrite: copy change_dictionary
	cp -r overwrite/* lina_dicto/lina_dicto/
	sed -i -e 's/Esperanto/English/' lina_dicto/lina_dicto/index.html
	sed -i -e 's/lina_dicto/lina_dicto_english/' lina_dicto/lina_dicto/package.json

change_dictionary: copy
	rm -rf lina_dicto/lina_dicto/dictionary/*
	cp -r dictionary/english/ lina_dicto/lina_dicto/dictionary/

dictionary:
	bash ./dictionary/english/gen_dictionary.sh

copy:
	- cp -r ../lina_dicto ./ >> work.log 2>&1

package: overwrite
	cd lina_dicto && bash ./installer_win32_x64.sh	english
	cd lina_dicto && bash ./installer_darwin.sh	english
	cd lina_dicto && bash ./installer_debian.sh	english

clean:
	rm -rf lina_dicto/

