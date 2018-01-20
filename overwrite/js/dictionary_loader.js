'use strict';

function dictionary_loader()
{
	const t = read_textfile('dictionary/english/dictionary_edict.json');
	let dict = JSON.parse(t);

	return dict;
}

