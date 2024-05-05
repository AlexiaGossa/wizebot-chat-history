/*
 *	License
 * 	Copyright 2024 Alexia Gossa / nemelit.com
 *	Some part are from @treguy on 2024-05-01 
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
	
	//Limit messages...
	oMessages 		= document.getElementsByClassName("message_div");
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
	const oNicknames = document.getElementsByClassName("nick");
	for (oNickname of oNicknames)
	{
		if (oNickname.innerHTML=="WizeBot")
			oNickname.innerHTML = "OncleBot";
	}
	
	//Remove Bot system_start
	oMessages = document.getElementById ("messages_backup").getElementsByClassName("message_div");
	for (oMessage of oMessages)
	{
		if (oMessage.getAttribute("id")=="system_start")
		{
			oMessage.style.display = "none";
		}
	}
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
