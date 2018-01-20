#!/bin/bash
#

set -eu
set -o pipefail
set -x

trap 'echo "error:$0($LINENO) \"$BASH_COMMAND\" \"$@\""' ERR


SCRIPT_DIR=$(cd $(dirname $0); pwd)

INPUT_FILE=""
OUTPUT_FILE=""

function download_file(){
	if [ ! -e ${DST_FILE} -o ! -s ${DST_FILE} ] ; then
		mkdir -p $(dirname ${DST_FILE})
		wget --tries=3 --wait=5 --continue \
			${SRC_URL} \
			-O ${DST_FILE}
	fi
}

function convert_utf(){
	OUTPUT_FILE=${INPUT_FILE%.*}_utf8.txt
	iconv -f EUC-JP-MS -t UTF8 "${INPUT_FILE}" |  perl -p -e 's/\r\n/\n/' > "${OUTPUT_FILE}"
}

function convert_json(){
	echo -e "[" > "${OUTPUT_FILE}"
	cat "${INPUT_FILE}" | perl -p -e 's/"/\\"/g' | \
		perl -p -e 's/^([^\/]+)\/(.*)$/["\1","\2"],/' >> "${OUTPUT_FILE}"
	sed -i '$s/.$//' "${OUTPUT_FILE}"	# 末尾の','を除去する
	echo -e "]" >> "${OUTPUT_FILE}"
}


pushd ${SCRIPT_DIR}

mkdir -p tmp/
pushd tmp/

SRC_URL=http://ftp.monash.edu/pub/nihongo/edict.zip
DST_FILE=./edict.zip
download_file

unzip -o ./edict.zip

INPUT_FILE="edict"
convert_utf
#rm ${INPUT_FILE}

INPUT_FILE="edict_utf8.txt"
OUTPUT_FILE="./dictionary_edict_00.json"
convert_json
#rm ${INPUT_FILE}

popd

node conv_edict_dictionary.js

popd

