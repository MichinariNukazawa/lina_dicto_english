'use strict';

module.exports = class Language{
	static get_code(){
		return 'en';
	}

	static get_code_by_google(){
		return 'en';
	}

	static command(keyword){
		if(0 === keyword.indexOf(":license")){
			let str = read_textfile('dictionary/english/LICENSE.md');
			return str;
		}

		return null;
	}

	static get_command_list(){
		return [":license"];
	}

};

