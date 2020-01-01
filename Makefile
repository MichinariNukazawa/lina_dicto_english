
all:
.PHONY: all run
.PHONY: overwrite change_dictionary dictionary copy package

run:
	make run -C lina_dicto/

overwrite:
	make copy_lina_dicto
	make change_dictionary
	cp -r overwrite/* lina_dicto/lina_dicto/
	sed -i -e 's/Esperanto/English/' lina_dicto/lina_dicto/index.html
	sed -i -e 's/Esperanto/English/'		lina_dicto/lina_dicto/package.json
	sed -i -e 's/lina_dicto/lina_dicto_english/'	lina_dicto/lina_dicto/package.json
	sed -i -e 's/lina_dicto/lina_dicto_english/' lina_dicto/lina_dicto/installer_debian_amd64_config.json
	sed -i -e 's/lina-dicto/lina-dicto-english/' lina_dicto/lina_dicto/installer_debian_amd64_config.json

change_dictionary:
	rm -rf lina_dicto/lina_dicto/dictionary/*
	mkdir -p lina_dicto/lina_dicto/dictionary/english/
	cp -r dictionary/english/dictionary_edict.json lina_dicto/lina_dicto/dictionary/english/
	cp -r dictionary/english/*.md lina_dicto/lina_dicto/dictionary/english/

copy_lina_dicto:
	rm -rf lina_dicto/
	- cp -r ../lina_dicto ./ >> work.log 2>&1
	rm -rf lina_dicto/lina_dicto/node_modules
	cd lina_dicto/lina_dicto && npm install

dictionary:
	bash ./dictionary/english/gen_dictionary.sh

package: overwrite
	make clean -C lina_dicto
	cd lina_dicto && bash ./release/installer_win32_x64.sh	english
	cd lina_dicto && bash ./release/installer_darwin.sh	english
	cd lina_dicto && bash ./release/installer_debian.sh	english

clean:
	rm -rf lina_dicto/

