/*
 *	License
 * 	Copyright 2024, 2025, 2026 Alexia Gossa / nemelit.com
 *	Some part are from Fabien Tregan on 2024-05-01 
 *
 *  License identifier : BSD-3-Clause
 *
 *  Alexia Gossa
 *  nemelit.com
 *  FRANCE
 */

//Load all NodeJS requires...
const fs 					= require ( 'fs');
const puppeteer 			= require ( 'puppeteer' );
const http 					= require ( 'http' );
const jsdom 				= require ( 'jsdom' );
const https					= require ( 'https' );
const path					= require ( 'path' );
const axios 				= require ( 'axios' );
const mime 					= require ( 'mime-types' );
const util					= require ( 'util' );

//All files...
const sWizebotURL			= 'wizebot-url.txt';					//Your Wizebot chat link in this file !
const sWizebotIndex			= 'wizebot-index.html';
const sWizebotInjectCSS 	= 'wizebot-inject.css';
const sWizebotInjectJS 		= 'wizebot-inject.js';
const sWizebotBackup 		= 'wizebot-backup.html';

//Cert files (if needed)
const sHttpsKey				= 'comodo-ssls-STAR-nemelit.com.key'; 		//Your certificate KEY file here !
const sHttpsCRT				= 'comodo-ssls-STAR-nemelit.com.crt'; 		//Your certificate CRT file here !
const sHttpsCABundle		= 'comodo-ssls-STAR-nemelit.com.ca-bundle'; //Your certificate CA bundle file here !

//Your listen port (HTTPS is optionnal if cert files not exist)
const iPortHTTP				= 8080;
const iPortHTTPS			= 8443;

const sBaseDir				= __dirname;

const sDomain				= 'https://nodejs.nemelit.com:'+iPortHTTPS;


//Main variables
var oBrowser;
var oPage;
var sPageDomain;


//
//	Read certificates
//
var httpsOptions = null;
if (fs.existsSync(sHttpsKey) && fs.existsSync(sHttpsCRT) && fs.existsSync(sHttpsCABundle) )
{
	httpsOptions = {
		key: 	fs.readFileSync ( sHttpsKey ),
		cert: 	fs.readFileSync ( sHttpsCRT ),
		ca: 	fs.readFileSync ( sHttpsCABundle ),
	};
}

//
//	Read wizebot chat URL (external private file)
//
var sURL;
if (fs.existsSync(sWizebotURL))
	sURL 				= fs.readFileSync ( sWizebotURL, { encoding: 'utf8', flag: 'r' } );
else
{
	console.log ( "The file "+sWizebotURL+" not exists.\n" );
	process.exit(1);
}
if (sURL.length<40)
{
	console.log ( "The file "+sWizebotURL+" is incorrect. You need to paste your Wizebot widget chat link.\n" );
	process.exit(1);
}

//
//	Read previous backup of messages
//
var sBackupMessages;
if (fs.existsSync(sWizebotBackup))
	sBackupMessages = fs.readFileSync ( sWizebotBackup, { encoding: 'utf8', flag: 'r' } );
else
	sBackupMessages = "";

//sBackupMessages = "";

//
//	Read inject CSS data
//
var sInjectCSS;
if (fs.existsSync(sWizebotInjectCSS))
	sInjectCSS 		= fs.readFileSync ( sWizebotInjectCSS, { encoding: 'utf8', flag: 'r' } );
else
{
	console.log ( "The file "+sWizebotInjectCSS+" not exists\n" );
	process.exit(1);
}

//
//	Read inject JS data
//
var sInjectJS;
if (fs.existsSync(sWizebotInjectJS))
	sInjectJS 		= fs.readFileSync ( sWizebotInjectJS, { encoding: 'utf8', flag: 'r' } );
else
{
	console.log ( "The file "+sWizebotInjectJS+" not exists\n" );
	process.exit(1);
}


//
//	Start web page preparation : concat, clean...
//
(async() => {
	
	//Start Puppeteer to the correct URL
	oBrowser = await puppeteer.launch({
		executablePath: process.env.CHROME_BIN,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--allow-insecure-localhost',
			'--allow-file-access-from-files',
			'--enable-local-file-accesses'
		]
	});
	oPage = await oBrowser.newPage();
	await oPage.goto(sURL);
	
	
	
	//
	//
	//	Get a list of all scripts, store a local copy of them, insert backup messages and backup the clean page
	//	Inject the OnMessage interception
	//
	//
	var oScriptList = await oPage.evaluate( (sBackupMessages,sInjectCSS,sDomain,sInjectJS) => {
		
		//
		//	Create cache filename with FNV1a
		//
		function getCacheFilename ( sUrl )
		{
			var sHex;
			var sHash;
			var iIndex;
			var sFilename;
			
			sHash = 0x811c9dc5;
			for (iIndex=0;iIndex<sUrl.length;iIndex++)
			{
				sHash ^= sUrl.charCodeAt(iIndex);
				sHash = Math.imul(sHash,0x01000193);
			}
			sHex = (sHash>>>0).toString(16).padStart(8,'0');
			sFilename = sUrl.split(/[?#]/, 1)[0].split('/').pop();
			return 'cache-' + sHex + '-' + sFilename;
		}
		
		//
		//	Enumerate all scripts from external source
		//
		var oScripts = document.getElementsByTagName('script');
		var oScriptList = [];
		for (oScript of oScripts)
		{
			if (oScript.src!="")
			{
				var sCacheFilename;
				var sPathCacheFilename;
				var sOriginalSrc;
				
				sCacheFilename 		= getCacheFilename ( oScript.src );
				sCacheFilenameUrl 	= sDomain + '/' + sCacheFilename;
				sOriginalSrc		= oScript.src;
				oScript.src 		= sCacheFilenameUrl;
				
				oScriptList.push ( 
					{ 
						src: "external",
						code: sOriginalSrc,
						file: sCacheFilename,
					}
				);
			}
		}
		
		//Insert backup messages
		const oDivMessages = document.getElementById ( 'messages' );
		oDivMessages.innerHTML = sBackupMessages;		
		
		//Insert inject CSS
		const oInsertStyle = document.createElement('style');
		oInsertStyle.innerHTML = sInjectCSS;
		document.head.appendChild ( oInsertStyle );

		//Insert inject JS
		const oInsertJS = document.createElement('script');
		oInsertJS.textContent = sInjectJS;
		document.head.prepend ( oInsertJS );
		
		//Get the origin
		const base = document.createElement('base');
		base.href = window.location.origin;
		document.head.insertBefore(base, document.head.firstChild);
		
		//Relative to absolute links
		var oLinks = document.getElementsByTagName('link');
		for (oLink of oLinks)
		{
			oLink.href = oLink.href;
		}
		
		//Relative to absolute styles
		var oStyles = document.getElementsByTagName('style');
		for (oStyle of oStyles)
		{
			oStyle.src = oStyle.src;
			oStyle.url = oStyle.url;
		}
		
		//Store the page
		oScriptList.push (
			{
				src: "page",
				code: document.documentElement.innerHTML
			}
		);		
		
		//Store the domain
		oScriptList.push (
			{
				src: "domain",
				code: base.href
			}
		);		
		
		return oScriptList;
	}, sBackupMessages, sInjectCSS, sDomain, sInjectJS );
	
	//Download and concat all scripts
	var sScriptFileConcat = "";
	var sPageHTML = "";
	for (oScript of oScriptList)
	{
		switch (oScript.src)
		{
			case 'page':
				sPageHTML = oScript.code;
				break;
				
			case 'domain':
				sPageDomain = oScript.code;
				break;
				
			case 'external':
				var sCacheFilename;
				var sFileData;
				
				//Load remote file
				sFileData = await fileDownload ( oScript.code );
				
				//Inject JS
				sFileData = ProcessInjectJS ( sFileData, "" );
				
				//Store as local file
				sCacheFilename = path.join ( sBaseDir, "direct", oScript.file );
				
				fs.writeFileSync ( 
					sCacheFilename, 
					sFileData, 
					{ encoding: '', flag: 'w' } );
				
				break;
				
			/*case '':
				var bCloseToNew = false;
				sScriptFileConcat += '\n';
				sScriptFileConcat += '//#### Concat javascript embedded code\n\n';
				if ((oScript.id!="") && (oScript.type!=""))
				{
					sScriptFileConcat += '</script><script id="' + oScript.id + '" type="' + oScript.type + '">';
					bCloseToNew = true;
				}
				sScriptFileConcat += oScript.code;
				if (bCloseToNew==true)
				{
					sScriptFileConcat += '</script><script>';
				}
				sScriptFileConcat += '\n';
				break;
			*/
			/*
			default:
				sScriptFileConcat += '\n';
				sScriptFileConcat += '//#### Concat javascript external code : ' + oScript.src + '\n\n';
				sScriptFileConcat += await fileDownload ( oScript.src );
				sScriptFileConcat += '\n';
				break;
			*/
		}
	}
	
	//Download all internal fonts
	let oMatch = sPageHTML.match(/url\((.+?)\)/g);
	for (sUrl of oMatch)
	{
		var iStringLength;
		var sTemp;
		var sAbsoluteUrl;
		var sDataBase64;
		var sMimeType;

		iStringLength = sUrl.length;
		sTemp = sUrl.substring(4,iStringLength-1);
		sAbsoluteUrl = path.join(sPageDomain,sTemp);
		
		sMimeType 	= await mime.lookup(sAbsoluteUrl);
		sDataBase64 = await fileDownloadToBase64 ( sAbsoluteUrl );
		sPageHTML 	= sPageHTML.replace ( sUrl,"url(data:"+sMimeType+";base64,"+sDataBase64+")");
	}	
	
	//Insert special JS code to intercept all onMessage events
	/*
	const sPattern = "function onMessage(";
	if (sScriptFileConcat.indexOf(sPattern)!=-1)
	{
		sScriptFileConcat = sInjectJS + sScriptFileConcat;
		sInsertCodeJS = 'function onMessage(type, channel, userstate, message, message_color) {\n';
		sInsertCodeJS += '  var sMessage = message.replace ( "<", "&shy;&nbsp;&#60;&nbsp;&shy;" );\n';
		sInsertCodeJS += '      sMessage = sMessage.replace ( ">", "&shy;&nbsp;&#62;&nbsp;&shy;" );\n';
		sInsertCodeJS += '  var oReturn = onMessageNext(type, channel, userstate, sMessage, message_color);\n';
		sInsertCodeJS += '  CheckMessages(true);\n';
		sInsertCodeJS += '  return oReturn; }\n';
		sInsertCodeJS += 'function onMessageNext(';
		sScriptFileConcat = sScriptFileConcat.replace ( sPattern, sInsertCodeJS );
	}
	else
	{
		//Fatal error : It seems the code has been changed from Wizebot
		//sScriptFileConcat = "";
		//console.log ( "Fatal error ! Wizebot code has been changed !!!" );
		//process.exit(1);
	}
	*/
	
	
	//Write the index file
	fs.writeFileSync(sWizebotIndex, sPageHTML + "<script>" + sScriptFileConcat + "</script>", { encoding: '', flag: 'w' } );
	
	//Reload the index file and start new page
	var sLoadHTML = fs.readFileSync ( sWizebotIndex, 'utf8' );
	await oPage.close();
	oPage = await oBrowser.newPage();
	await oPage.setContent(sLoadHTML);
	
})();


function ProcessInjectJS ( sSource, sInject )
{
	const sPattern = "function onMessage(";
	var sOutput;
	var sInsertCodeJS;
	
	sOutput = sSource;
	
	if (sOutput.indexOf(sPattern)!=-1)
	{
		sOutput = sInject + sOutput;
		sInsertCodeJS = 'function onMessage(type, channel, userstate, message, message_color) {\n';
		sInsertCodeJS += '  var sMessage = message.replace ( "<", "&shy;&nbsp;&#60;&nbsp;&shy;" );\n';
		sInsertCodeJS += '      sMessage = sMessage.replace ( ">", "&shy;&nbsp;&#62;&nbsp;&shy;" );\n';
		sInsertCodeJS += '  var oReturn = onMessageNext(type, channel, userstate, sMessage, message_color);\n';
		sInsertCodeJS += '  CheckMessages(true);\n';
		sInsertCodeJS += '  return oReturn; }\n';
		sInsertCodeJS += 'function onMessageNext(';
		sOutput = sOutput.replace ( sPattern, sInsertCodeJS );
	}

	return sOutput;
}



//
//	Save all backup messages
//
setTimeout ( ProcessBackupMessages, 2000 );
function ProcessBackupMessages ( )
{
	(async() => {
		
		var sBackupAllMessages = await oPage.evaluate(() => {
			var oMessages = document.getElementById("messages");
			var sHTML = null;
			
			if (oMessages!=null)
				sHTML = oMessages.innerHTML;
				
			return sHTML;
		});
		
		if (sBackupAllMessages!=null)
			fs.writeFileSync(sWizebotBackup, sBackupAllMessages, { encoding: '', flag: 'w' } );
		
	})();
	
	setTimeout ( ProcessBackupMessages, 1000 );
}


function fixMalformedEncoding(str) {
    return str.replace(/%([^0-9A-F]{2})/gi, "%25$1"); // Replaces bad encodings
}

//
//	HTTP/HTTPS Server processing
//
function ResponseServerToQuery ( req, res )
{
	//console.log ( "req = "+util.inspect(req) );
	//console.log ( "res = "+util.inspect(res) );
	//return;
	
	//We enable direct download of some files in the "direct" folder
	sDirectPath 	= path.join ( sBaseDir, "direct" );
	//console.log ( req.url );
	
	try {
		sDecodedPath 	= decodeURIComponent(fixMalformedEncoding(req.url));
	} catch (e) {
		res.statusCode = 200;
		res.end();
		return;
	}
	
	sFullPath		= path.normalize ( path.join ( sDirectPath, sDecodedPath ) );
	//console.log ( sFullPath );
	
	if (!sFullPath.startsWith(sDirectPath + path.sep))
	{
		//Block malicious traversal
		//console.log ( 'Block malicious traversal' );
		res.statusCode = 200;
		res.end();
		return;
	}
	if (fs.existsSync(sFullPath))
	{
		sData = fs.readFileSync ( sFullPath );
		res.statusCode = 200;
		res.write ( sData );
		res.end();
		//console.log ( 'serve data' );
		return;
	}
	
	//Get highlights and reset parameters
	const { searchParams } = new URL ( "https://fakedomain.com"+req.url );
	var bHighlight 	 	= searchParams.has("highlight");
	var bReset 		 	= searchParams.has("reset");
	var sHeight		 	= "";
	var sHeightColor 	= "";
	var sFontSize		= "";
	var sBackground		= "";
	
	if (searchParams.has("height"))
		sHeight = searchParams.get("height");

	if (searchParams.has("heightcolor"))
		sHeightColor = searchParams.get("heightcolor");

	if (searchParams.has("background"))
		sBackground = searchParams.get("background");

	if (searchParams.has("messagesize"))
	{
		sFontSize += "<style>.message { font-size: "+searchParams.get("messagesize")+";}</style>";
	}

	if (searchParams.has("nicksize"))
	{
		sFontSize += "<style>.nicksimple { font-size: "+searchParams.get("nicksize")+";}</style>";
	}
	
	var sChatAlign;
	sChatAlign  = "--chat-align:right; ";
	sChatAlign += "--chat-message-left:100%; ";
	sChatAlign += "--chat-message-transform: translate(-100%,0); ";
	sChatAlign += "--chat-message-border-radius: 0.5em 0 0.5em 0.5em; ";
	sChatAlign += "--chat-message-show-transform: translateX(100%);";
	sChatAlign += "--chat-messages-transform: perspective(140em) rotate3d(-2, 3, 0, -7deg); ";
	sChatAlign += "--chat-messages-transform-origin: 90% 80%; ";
	
	if (searchParams.has("chatalign"))
	{
		if (searchParams.get("chatalign")=="left")
		{
			sChatAlign  = "--chat-align:left; ";
			sChatAlign += "--chat-message-left:0%; ";
			sChatAlign += "--chat-message-transform: translate(0%,0); ";
			sChatAlign += "--chat-message-border-radius: 0 0.5em 0.5em 0.5em; ";
			sChatAlign += "--chat-message-show-transform: translateX(-100%);";
			sChatAlign += "--chat-messages-transform: perspective(140em) rotate3d(-2, -3, 0, -7deg); ";
			sChatAlign += "--chat-messages-transform-origin: 90% 80%; ";
			
		}
	}
	sFontSize = "<style>:root { " + sChatAlign + "  }</style>" + sFontSize;
	
	//Query data
	(async() => {
		var sData = await oPage.evaluate( (bReset,sHeight,sHeightColor,sBackground,sFontSize) => {
			var oMessages;
			var oMessage;
			var sGradient;
			
			if (bReset==true)
			{
				//Clear all messages
				document.getElementById("messages").innerHTML = "";
			}
			else
			{
				//Remove all animation remaining
				oMessages = document.getElementById ("messages").children;
				for (oMessage of oMessages)
				{
					oMessage.style.animationDuration = "";
					oMessage.style.animationName = "";
				}
			}
			
			if (sHeight=="")
				sGradient = "";
			else
			{
				if (sHeightColor=="")
					sGradient = ""
				else
				{
					if (sBackground=="")
						sGradient = 'linear-gradient(180deg, rgba(120, 120, 120, 0.5) 0%, rgba(120, 120, 120, 0.5) '+sHeight+', '+sHeightColor+' 1px, '+sHeightColor+' 100%)';
					else
						//sGradient = 'linear-gradient(180deg, rgba(120, 120, 120, 0.5) 0%, rgba(120, 120, 120, 0.5) '+sHeight+', '+sHeightColor+' 1px, '+sHeightColor+' 100%)';
						sGradient = 'linear-gradient(180deg, '+sBackground+' 0%, '+sBackground+' '+sHeight+', '+sHeightColor+' 1px, '+sHeightColor+' 100%)';
					console.log ( sBackground );
				}
			}
			
			document.getElementById("messages").style.height 				= sHeight;
			document.getElementById("messagescontainer").style.background 	= sGradient;
			
			return document.documentElement.innerHTML + sFontSize;
		}, bReset,sHeight,sHeightColor,sBackground,sFontSize );
		
		//Insert highlight parameter
		sData += "<script>var bNewMessageHighlight = "+bHighlight+";</script>";
		
		//Insert fonts
		sData += "<script>PageInjectCSS(\"fonts.css\");</script>";
		
		//Send output
		res.setHeader('Access-Control-Allow-Origin','*');
		res.setHeader('Access-Control-Allow-Methods','OPTIONS, GET, POST, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		res.setHeader('Access-Control-Allow-Credentials', true);
		res.setHeader('Referrer-Policy', 'unsafe-url');
		res.statusCode = 200;
		res.write ( sData );
		res.end();
		
	})();
}

//
//Create HTTPS and HTTP servers
//
if (httpsOptions!=null)
{
	const serverHTTPS = https.createServer ( httpsOptions, (req, res) => {
		ResponseServerToQuery ( req, res );
	}).listen(iPortHTTPS);
	console.log ( "HTTPS server started" );
}
const serverHTTP = http.createServer ( (req, res) => {
	ResponseServerToQuery ( req, res );
}).listen(iPortHTTP);
console.log ( "HTTP server started" );

//
//	Waiting for Puppeteer stops...
//
console.log ( "Running..." );

//
//	Download a file and convert it to Base64
//
async function fileDownloadToBase64 ( sUrl )
{
	try {

		//Get resource
		const image = await axios.get(
			sUrl, 
			{
				responseType: 'arraybuffer'
			}
		);
		
		//Convert to Base64
		const raw = Buffer.from(image.data).toString('base64');
		
		//Return data
		return raw;
		
	} catch(error)
	{
		return "";
	}
}

//
//	Download a file
//
async function fileDownload ( sUrl )
{
	try {

		//Get resource
		const image = await axios.get(
			sUrl, 
			{
				responseType: 'arraybuffer'
			}
		);
		
		//Convert to Base64
		const raw = Buffer.from(image.data);
		
		//Return data
		return raw;
		
	} catch(error)
	{
		return "";
	}
}


