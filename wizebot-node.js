/*
 *	License
 * 	Copyright 2024 Alexia Gossa / nemelit.com
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
if (fs.existsSync(sWizebotInjectCSS))
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
	
	//Get a list of all scripts, remove them, insert backup messages and backup the clean page
	var oScriptList = await oPage.evaluate( (sBackupMessages,sInjectCSS) => {
		var oScripts = document.getElementsByTagName('script');
		var oScriptList = [];
		for (oScript of oScripts)
		{
			if (oScript.src!="")
			{
				oScriptList.push ( 
					{ 
						src: oScript.src, 
						code: ""
					}
				);
				oScript.src = "";
			}
			else
			{
				oScriptList.push ( 
					{ 
						src: "", 
						code: oScript.innerText
					}
				);
				oScript.innerText = "";
			}
		}

		//Insert backup messages
		const oDivMessages = document.getElementById ( 'messages' );
		oDivMessages.innerHTML = sBackupMessages;
		
		
		//Insert inject CSS
		const oInsertStyle = document.createElement('style');
		oInsertStyle.innerHTML = sInjectCSS;
		document.head.appendChild ( oInsertStyle );
		
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
	}, sBackupMessages, sInjectCSS );
	
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
				
			case '':
				sScriptFileConcat += '\n';
				sScriptFileConcat += '//Concat javascript embedded code\n\n';
				sScriptFileConcat += oScript.code;
				sScriptFileConcat += '\n';
				break;
				
			default:
				sScriptFileConcat += '\n';
				sScriptFileConcat += '//Concat javascript external code : ' + oScript.src + '\n\n';
				sScriptFileConcat += await fileDownload ( oScript.src );
				sScriptFileConcat += '\n';
				break;
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
		sScriptFileConcat = "";
		console.log ( "Fatal error ! Wizebot code has been changed !!!" );
		process.exit(1);
	}
	
	//Write the index file
	fs.writeFileSync(sWizebotIndex, sPageHTML + "<script>" + sScriptFileConcat + "</script>", { encoding: '', flag: 'w' } );
	
	//Reload the index file and start new page
	var sLoadHTML = fs.readFileSync ( sWizebotIndex, 'utf8' );
	await oPage.close();
	oPage = await oBrowser.newPage();
	await oPage.setContent(sLoadHTML);
	
})();




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

//
//	HTTP/HTTPS Server processing
//
function ResponseServerToQuery ( req, res )
{
	//Get highlights and reset parameters
	const { searchParams } = new URL ( "https://fakedomain.com"+req.url );
	var bHighlight 	 	= searchParams.has("highlight");
	var bReset 		 	= searchParams.has("reset");
	var sHeight		 	= "";
	var sHeightColor 	= "";
	var sFontSize		= "";
	
	if (searchParams.has("height"))
		sHeight = searchParams.get("height");

	if (searchParams.has("heightcolor"))
		sHeightColor = searchParams.get("heightcolor");

	if (searchParams.has("messagesize"))
	{
		sFontSize = "<style>.message { font-size: "+searchParams.get("messagesize")+";}</style>";
	}

	if (searchParams.has("nicksize"))
	{
		sFontSize = "<style>.nicksimple { font-size: "+searchParams.get("nicksize")+";}</style>";
	}
	
	//Query data
	(async() => {
		var sData = await oPage.evaluate( (bReset,sHeight,sHeightColor,sFontSize) => {
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
					sGradient = 'linear-gradient(180deg, rgba(120, 120, 120, 0.5) 0%, rgba(120, 120, 120, 0.5) '+sHeight+', '+sHeightColor+' 1px, '+sHeightColor+' 100%)';
			}
			
			document.getElementById("messages").style.height 				= sHeight;
			document.getElementById("messagescontainer").style.background 	= sGradient;
			
			return document.documentElement.innerHTML + sFontSize;
		}, bReset,sHeight,sHeightColor,sFontSize );
		
		//Insert highlight parameter
		sData += "<script>var bNewMessageHighlight = "+bHighlight+";</script>";
		
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