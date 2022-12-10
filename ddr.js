var CryptoJS = require("crypto-js");
var pako = require("pako");
var fs = require("fs");
var path=require('path');

let myurl = __dirname;
function myReadfile(MyUrl) {
    fs.readdir(MyUrl, (err, files) => {

        files.forEach(file => {

            fs.stat(MyUrl+'/'+file, (err, stat) => {
                if (stat.isFile() && path.extname(file) == ".ddr" ) {
		    //console.log(path.extname(file));
                    console.log(file);
		    cvtddr(file);
                }
            })
        })
    })
}

function cvtddr(fname) {
try {
	var eAB = fs.readFileSync(fname);
	var wordArray = CryptoJS.lib.WordArray.create(eAB.slice(16));
	var hexStr = Array.prototype.map.call(new Uint8Array(eAB.slice(0, 16)), x => ('00' + x.toString(16)).slice(-2)).join('');
	var wordArray2 = CryptoJS.enc.Hex.parse(hexStr);

	var jsdec = CryptoJS.AES.decrypt({ciphertext:wordArray},wordArray2,{
	iv: wordArray2,
	mode: CryptoJS.mode.CBC
	});

	var binary_string = new Buffer.from(jsdec.toString(CryptoJS.enc.Base64), 'base64').toString('binary');
	var len = binary_string.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
	bytes[i] = binary_string.charCodeAt(i);
	}

	var data = pako.ungzip(bytes.buffer,{to:'string'});
	data = data.replaceAll("&lrm;", "");
	data = data.replaceAll("WEBVTT", "");
	fs.writeFileSync(fname.replace(/.ddr/g,'.srt'), data);
	console.log('done');
} catch (err) {
	if (err.code === 'ENOENT') {
	  console.error('File does not exists');
	} else {
	  throw err;
	}
}
}
myReadfile(myurl);

