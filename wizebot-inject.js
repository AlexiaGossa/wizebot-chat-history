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
 
const iMessageMaxCount = 100;

function CheckMessages ( bHighlightLast )
{
	var oMessages;
	var oMessage;
	var iMessagesCount;
	var iIndex;
	
	//Get the last message added
	if (bHighlightLast==true)
	{
		oMessage = document.getElementById ("messages").lastChild;
		if (oMessage!==null)
		{
			if (typeof bNewMessageHighlight !== 'undefined')
			{
				if (bNewMessageHighlight==true)
				{
					oMessage.style.animationDuration = "5s";
					oMessage.style.animationName = "message_appear";
				}
			}
		}
	}
	
	/*
	oNicks = document.getElementsByClassName ("nick");
	for (oNickname of oNicks)
	{
		oSticker = oNickname.parentElement.getElementsByClassName("sticker");
		oSticker[0].style.backgroundColor = oNickname.style.color;
		oNickname.style.textShadow = "";
		oNickname.style.color = "";
	}
	*/
	
	//Limit messages...
	oMessages = document.getElementById ("messages").getElementsByClassName("message_div");
	iMessagesCount 	= oMessages.length;
	iMessagesCount -= iMessageMaxCount;
	if (iMessagesCount>0)
	{
		for (iIndex=0;iIndex<iMessagesCount;iIndex++)
		{
			oMessages[0].remove();
		}
	}
	
	//Rename wizebot
	var oNicknames = document.getElementsByClassName("nick");
	for (oNickname of oNicknames)
	{
		if (oNickname.innerHTML=="WizeBot")
			oNickname.innerHTML = "OncleBot";
	}
	oNicknames = document.getElementsByClassName("nicksimple");
	for (oNickname of oNicknames)
	{
		if (oNickname.innerHTML=="WizeBot")
			oNickname.innerHTML = "OncleBot";
	}
	
	
	//Remove Bot system_start
	oMessages = document.getElementById ("messages").getElementsByClassName("message_div");
	for (oMessage of oMessages)
	{
		if (oMessage.getAttribute("id")=="system_start")
		{
			oMessage.style.display = "none";
		}
	}
}

window.onload = function() {
	CheckMessages(false);
}
