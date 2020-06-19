'use strict';

const fs = require('fs');
const path = require('path');
//const Dictionary = require('../../js/dictionary');

const datafile = path.join(__dirname, 'tmp/dictionary_edict_src10.json');
const dstfile = path.join(__dirname, 'dictionary_edict.json');

const t = fs.readFileSync(datafile, 'utf8');
let dict = JSON.parse(t);
for (let i = 0; i < dict.length; i++) {
	if(0 == i % 5000){ console.log('progress:', i, '/', dict.length); }

	dict[i][2] = dict[i][0]
			.replace(/\//g, '')
			.toLowerCase()
			;
}
let t2 = JSON.stringify(dict);
t2 = t2.replace(/\],\[/g, "],\n[");
fs.writeFileSync(dstfile, t2);

