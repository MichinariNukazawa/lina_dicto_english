
all:
.PHONY: all run
.PHONY: overwrite change_dictionary dictionary copy package

run: overwrite
	make run -C lina_dicto/

overwrite: copy change_dictionary
	cp -r overwrite/* lina_dicto/lina_dicto/
	sed -i -e 's/Esperanto/English/' lina_dicto/lina_dicto/index.html
	sed -i -e 's/Esperanto/English/'		lina_dicto/lina_dicto/package.json
	sed -i -e 's/lina_dicto/lina_dicto_english/'	lina_dicto/lina_dicto/package.json
	sed -i -e 's/lina_dicto/lina_dicto_english/' lina_dicto/lina_dicto/installer_debian_amd64_config.json
	sed -i -e 's/lina-dicto/lina-dicto-english/' lina_dicto/lina_dicto/installer_debian_amd64_config.json

change_dictionary: copy
	rm -rf lina_dicto/lina_dicto/dictionary/*
	cp -r dictionary/english/ lina_dicto/lina_dicto/dictionary/

dictionary:
	bash ./dictionary/english/gen_dictionary.sh

copy:
	rm -rf lina_dicto/
	- cp -r ../lina_dicto ./ >> work.log 2>&1

package: overwrite
	make clean -C lina_dicto
	cd lina_dicto && bash ./release/installer_win32_x64.sh	english
	cd lina_dicto && bash ./release/installer_darwin.sh	english
	cd lina_dicto && bash ./release/installer_debian.sh	english

clean:
	rm -rf lina_dicto/

