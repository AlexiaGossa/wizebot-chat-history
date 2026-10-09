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
 
const iMessageMaxCount = 40;

function CheckMessages ( bHighlightLast )
{
	var oMessages;
	var oMessage;
	var iMessagesCount;
	var iIndex;
	
	//console.log ( "CheckMessages "+bHighlightLast );
	
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
					//oMessage.style.animationDuration = "5s";
					//oMessage.style.animationName = "message_appear";
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
	
	//Remove all not displayed messages
	for (oMessage of oMessages)
	{
		const oElement = oMessage;
		if (window.getComputedStyle(oElement).display === "none")
		{
			oElement.remove();
		}
	}
	
	bindNickToMessageWidth ( );
	
/*	
	//Get all position
	oMessagesAll = document.getElementById ("messages").getElementsByClassName("message_div");
	oMessages = Array.from ( oMessagesAll ).filter ( oElement => {
		return window.getComputedStyle(oElement).display !== "none";
	} );
*/


//	oMessages = document.getElementById ("messages").getElementsByClassName("message_div");
//	iMessagesCount 	= oMessages.length;
//	if (iMessagesCount>1)
//	{
//		//Le dernier message
//		//oMessages[iMessagesCount-1].offsetHeight;
//		//oMessages[iMessagesCount-2].offsetHeight;
//		
//		/*
//		
//		Autre idée.
//		
//		
//		*/
//		
//		/*
//		
//		iLastMessageY = oMessages[iMessagesCount-1].getBoundingClientRect().top;
//		
//		//L'avant dernier message
//		iLastY = oMessages[iMessagesCount-2].getBoundingClientRect().top;
//		
//		
//		iDelta = iLastMessageY - iLastY;
//		
//		sTranslateY = "translateY("+iDelta+"px)"
//		
//		console.log ( iLastMessageY );
//		console.log ( iLastY );
//		console.log ( oMessages[iMessagesCount-1].getBoundingClientRect() );
//		
//		*/
//		/*
//		iDelta = oMessages[iMessagesCount-1].getBoundingClientRect().height;
//		
//		document.documentElement.style.setProperty(
//			"--message-up-origin",
//			iDelta+"px" );
//
//		
//		
//		
//		for (iIndex=0;iIndex<(iMessagesCount-1);iIndex++)
//		{
//			oMessages[iIndex].style.animation = "none";
//			oMessages[iIndex].offsetHeight;
//			oMessages[iIndex].style.animation = "";
//		}
//		
//		*/
//	}
	
}

window.onload = function() {
	CheckMessages(false);
}

function PageInjectCSS ( sFilename )
{
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = location.origin+"/"+sFilename;
    link.type = 'text/css';
    document.head.appendChild(link);
}


function bindNickToMessageWidth ( root = document )
{
	root.querySelectorAll(".message_div").forEach(
		container => {
			const nick = container.querySelector(".nicksimple");
			const msg  = container.querySelector(".message");
			if (!nick || !msg) return;
			if (container.__nickObserverBound) return;
			container.__nickObserverBound = true;

			function apply() 
			{
				const width = nick.getBoundingClientRect().width;
				msg.style.minWidth = width + "px";
			}			
			
			apply();

			new ResizeObserver(apply).observe(nick);
		}
	);
}

window.addEventListener ( 
	"load", () => {
		bindNickToMessageWidth();

		const mo = new MutationObserver(muts => {
		for (const m of muts)
		{
			for (const node of m.addedNodes)
			{
				if (node.nodeType === 1) bindNickToMessageWidth(node);
			}
		}
  }
);

  mo.observe(document.body, { childList: true, subtree: true });
});
