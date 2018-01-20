
all:
.PHONY: all run
.PHONY: overwrite copy_dictionary dictionary copy package

run:
	make copy_dictionary
	make overwrite
	make run -C lina_dicto/

overwrite:
	cp -r overwrite/* lina_dicto/lina_dicto/
	sed -i -e 's/Esperanto/English/' lina_dicto/lina_dicto/index.html

copy_dictionary: copy
	rm -rf lina_dicto/lina_dicto/dictionary/*
	cp -r dictionary/english/ lina_dicto/lina_dicto/dictionary/

dictionary:
	bash ./dictionary/english/gen_dictionary.sh

copy:
	- cp -r ../lina_dicto ./ >> work.log 2>&1

package:
	LINA_DICTO_LANGUAGE=english make package -C lina_dicto/

clean:
	rm -rf lina_dicto/

