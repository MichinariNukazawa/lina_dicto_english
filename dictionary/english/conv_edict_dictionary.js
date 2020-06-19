'use strict';

const fs = require('fs');
const path = require('path');

class Edict{
	static get_etoj(data)
	{
		/*! 和英辞書データを英和データに変換する(単純変換なので順は変換したまま)
		*/
		let dict = [];
		let count_remove = 0;
		for(let i = 0; i < data.length; i++){
			if(0 === i){continue;} // 最初の要素を無視する(辞書データ名が入っている)
			if(0 === i%10000){process.stdout.write("+");}

			let jkeyword = data[i][0];
			jkeyword = jkeyword.replace(/\s*\[.+\]\s*$/, ""); // 読みを除去 // 将来的には結果に加える？
			jkeyword = jkeyword.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
				    return String.fromCharCode(s.charCodeAt(0) - 65248);
			}); // 全角文字を半角文字に変換

			let ekeywords = data[i][1].split("/");
			for(let t = 0; t < ekeywords.length; t++){
				ekeywords[t] = ekeywords[t].replace(/^(\([^\)]+\)\s*)*/g, "");
				if(0 === ekeywords[t].length){ continue; } // (末尾の)空キーワードを除去

				let ekeyword_search = ekeywords[t].replace(/(\s*\([^\)]+\)\s*)*/g, ""); // 括弧とその中の文字を除去

				if(3 < ekeyword_search.split(" ").length){
					count_remove++;
					continue;
				} // 3ワード以上のキーワードを除外

				// 前後空白を除去
				jkeyword = jkeyword.replace(/^\s*/, "").replace(/\s*$/, "");
				let ekeyword = ekeywords[t].replace(/^\s*/, "").replace(/\s*$/, "");

				const item = [ekeyword, jkeyword];
				dict.push(item);
			}
		}
		process.stdout.write(`-[${dict.length}][${count_remove}]\n`);

		/*! アイテムの重複を除去
		 * `["repetition of kanji (sometimes voiced)"],["々"],`や`["decimal"],["10進"],`の重複が無くなる
		 */
		let dict2 = [];
		for(let i = 0; i < dict.length; i++){
			if(0 === i%10000){process.stdout.write("+");}

			// 順に並んでいるので、全てマッチしなくても、
			// 直近のjkeywordが重複している項目をチェックすれば足りる(はず)
			let is_exist = false;
			for(let t = dict2.length - 1; 0 <= t; t--){
				if(dict2[t][1] != dict[i][1]){ // jkeywordが合わなくなったらチェック終了
					break;
				}
				if(dict2[t][0] == dict[i][0]){
					is_exist = true;
					break;
				}
			}
			if(!is_exist){
				dict2.push(dict[i]);
			}
		}
		dict = dict2;
		process.stdout.write(`-[${dict.length}]\n`);

		/*! アルファベット順(unicode順)に並び替え
		 */
		let dict_ex = new Array(256);
		for(let ix0 = 0; ix0 < 256; ix0++){
			dict_ex[ix0] = new Array(256);
			for(let ix1 = 0; ix1 < 256; ix1++){
				dict_ex[ix0][ix1] = [];
			}
		}
		// とりあえず先頭文字毎に分ける
		for(let i = 0; i < dict.length; i++){
			if(0 === i%10000){process.stdout.write("+");}
			// 検索順：大文字小文字は区別しない, 先頭の記号は除く
			const ekeyword = this.get_showword(dict[i][0]);
			const ix0 = ekeyword.charCodeAt(0);
			let ix1_ = ekeyword.charCodeAt(1);
			const ix1 = (ix1_)? ix1_ : 0;
			if(256 <= ix0 || 256 <= ix1){
				process.stdout.write(`(${i}:${ix0},${ix1})`);
				continue;
			}
			if(!dict_ex[ix0][ix1]){
				process.stdout.write(`X(${i}:${ekeyword}:${ix0},${ix1})`);
				dict_ex[ix0][ix1] = [];
			}
			dict_ex[ix0][ix1].push(dict[i]);
		}
		process.stdout.write("-\n");

		// console.log(dict_ex['i'.charCodeAt(0)]['a'.charCodeAt(0)]);

		/*! 統計情報
		 */
		for(let ix0 = 0x61; ix0 <= 0x7a; ix0++){
			let count = 0;
			for(let ix1 = 0x61; ix1 <= 0x7a; ix1++){
				count += dict_ex[ix0][ix1].length;
				process.stdout.write(`${dict_ex[ix0][ix1].length},\t`);
				if(0x70 == ix1){process.stdout.write("\n ");}
			}
			process.stdout.write("-\n");
			process.stdout.write(`${String.fromCharCode(ix0)}:${count}\n`);
		}
		process.stdout.write("-\n");

		/*! ソート
		 */
		let start = Date.now();
		for(let ix0 = 0; ix0 < 256; ix0++){
			if(0x61 <= ix0 && ix0 <= 0x7a){
				process.stdout.write(String.fromCharCode(ix0));
			}else{
				process.stdout.write("+");
			}

			for(let ix1 = 0; ix1 < 256; ix1++){
				dict_ex[ix0][ix1] = this.sort_item(dict_ex[ix0][ix1]);
			}
		}
		let end = Date.now();
		process.stdout.write(`[${Math.floor((end - start) / 1000)}]-\n`);

		// console.log(dict_ex[0x6d][0x00]); // m\0
		// console.log(dict_ex['z'.charCodeAt(0)]['a'.charCodeAt(0)]);

		/*! 1次元配列に戻す (keyword毎の日本語訳語まとめも同時に行う)
		 */
		let dict3 = [];
		for(let ix0 = 0; ix0 < 256; ix0++){
			for(let ix1 = 0; ix1 < 256; ix1++){
				for(let i = 0; i < dict_ex[ix0][ix1].length; i++){
					if(0 == dict3.length || dict3[dict3.length - 1][0] != dict_ex[ix0][ix1][i][0]){
						dict3.push(dict_ex[ix0][ix1][i]);
					}else{
						dict3[dict3.length - 1][1] += ";" + dict_ex[ix0][ix1][i][1];
					}
				}
			}
			process.stdout.write("+");
		}
		dict = dict3;
		process.stdout.write("-\n");

		return dict;
	}

	static get_showword(str)
	{
		return str.toLowerCase().replace(/^[^0-9a-zA-Z]*([\w])/, "$1");
	}

	static sort_item(dict)
	{
		let dict2 = [];
		for(let i = 0; i < dict.length; i++){
			const ekeyword = this.get_showword(dict[i][0]);

			let i2 = 0;
			if(0 < dict2.length){ // 高速化
				for(let l = 0; l < 10; l++){
					let ix = Math.floor((dict2.length / 10) * l);
					const ekeyword2 = this.get_showword(dict2[ix][0]);
					if(0 < this.strcmp(ekeyword, ekeyword2)){
						break;
					}else{
						i2 = ix;
					}
				}
			}
			for(; i2 < dict2.length; i2++){
				const ekeyword2 = this.get_showword(dict2[i2][0]);
				if(0 < this.strcmp(ekeyword, ekeyword2)){
					break;
				}
			}
			dict2.splice(i2, 0, dict[i]);
		}

		return dict2;
	}

	static strcmp(str0, str1)
	{
		// return str0.localeCompare(str1); // コードポイントより先に文字列長でソートする様子
		let len = (str0.length > str1.length)? str0.length : str1.length;
		for(let i = 0; i < len; i++){
			let s0 = str0.charCodeAt(i);
			let s1 = str1.charCodeAt(i);
			if(s0 === s1){
				continue;
			}
			s0 = (s0)? s0 : 0;
			s1 = (s1)? s1 : 0;
			return (s1 - s0);
		}

		return 0;
	}

	static write_append(fs, filepath, data)
	{
		//let strdata = JSON.stringify(data, null, '\t');
		let strdata = "[" + JSON.stringify(data[0]) + "," + JSON.stringify(data[1]) + "]";
		try{
			fs.appendFileSync(filepath, strdata);
		}catch(err){
			return 'The "data to append" was appended to file!';
		}


		return null;
	}

	/*
	static write(fs, filepath, dict)
	{
		process.stdout.write("path:`" + filepath + "`\n");

		try{
			fs.unlinkSync(filepath);
		} catch (err) {
			console.error(filepath);
			return "delete history error:\n" + err.message;
		}

		try{
			fs.appendFileSync(filepath, '[\n');
		}catch(err){
			return 'The "data to append" was appended to file!';
		}

		for(let i = 0; i < dict.length; i++){
			if(0 === i%10000){process.stdout.write("+");}

			// if(i > 1000){continue;}

			const ret = this.write_append(fs, filepath, dict[i]);
			if(null !== ret){
				return ret;
			}

			if(i != dict.length - 1){
				fs.appendFileSync(filepath, ',\n');
			}else{
				fs.appendFileSync(filepath, '\n');
			}
		}
		process.stdout.write("-\n");

		try{
			fs.appendFileSync(filepath, ']\n');
		}catch(err){
			return 'The "data to append" was appended to file!';
		}

		return null;
	}
	*/
};

const datafile = path.join(__dirname, 'tmp/dictionary_edict_00.json');
const dstfile = path.join(__dirname, 'tmp/dictionary_edict_src10.json');

console.log(datafile);
const t = fs.readFileSync(datafile, 'utf8');

let dict = Edict.get_etoj(JSON.parse(t));
let t2 = JSON.stringify(dict);
t2 = t2.replace(/\],\[/g, "],\n[");
fs.writeFileSync(dstfile, t2);
//Edict.write(fs, dstfile, dict);

