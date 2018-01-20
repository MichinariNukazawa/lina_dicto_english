'use strict';

/*export default*/ class Language{
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

