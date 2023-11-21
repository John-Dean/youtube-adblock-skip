const observeUrlChange = () => {
	let oldHref = document.location.href;
	const body = document.querySelector("body");
	const observer = new MutationObserver(mutations => {
		if(oldHref !== document.location.href){
			oldHref = document.location.href;
			antiAdBlockRefresh();
		}
	});
	observer.observe(body, { childList: true, subtree: true });
};

window.onload = observeUrlChange;

async function antiAdBlock(){
	if(window.self !== window.top){
		return;
	}
	
	let url = location.href;
	
	if(url.indexOf("watch?")<0){
		return;
	}
	
	let iframe = document.createElement("iframe");
	iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
	iframe.className = "iframeIncognito"
	iframe.scrolling = "no"


	let documentPlayer = await (
		new Promise(
			async function(resolve, reject){
				let documentPlayer;
				while(true){
					documentPlayer = document.body.querySelector("#player");
					if(documentPlayer == null){
						await (
							new Promise(
								function(resolve, reject){
									setTimeout(resolve, 10);
								}
							)
						)
					} else {
						break;
					}
				}
				return resolve(documentPlayer);
			}
		)
	)
	
	
	let errorScreen = document.querySelector("#error-screen");
	if(errorScreen == null){
		return;
	}
	let errorText = errorScreen.innerText;
	if(errorText.indexOf("Ad blocker") >= 0){
		// Adblock error message, so continue
	} else {
		return;
	}
	

	await (new Promise(function(resolve, reject){
		iframe.src = url;
		iframe.onload = function(){
			resolve();
		}
		documentPlayer.appendChild(iframe);
	})
	)
	

	let iFrameCSSBlock = document.createElement("style");
	iFrameCSSBlock.innerHTML = /* css */`
		/* The goal of this CSS is to make the player fill the iFrame */
		#masthead-container {
			display: none;
		}

		#player, #player #player-container-outer {
			position: fixed !important;
			top: 0;
			left: 0;
			z-index: 1000;
			width: 100%;
			height: 100%;
			max-width: none !important;
			min-width: none !important;
		}
		
		#player:after{
			content:"";
			position: fixed !important;
			top: 0;
			left: 0;
			z-index: 999;
			width: 100%;
			height: 100%;
			max-width: none !important;
			min-width: none !important;
			background-color: black;
		}

		.html5-video-container {
			width: 100%;
			height: 100%;
		}
		
		#player video {
			width: 100% !important;
			height: 100% !important;
		}

		.ytp-chrome-bottom {
			left: 50% !important;
			transform: translate(-50%, 0);
		}
		
		[data-title-no-tooltip="Cinema mode"] {
			display: none !important;
		}
		
	`;
	
	let mainCSSBlock = document.createElement("style");
	mainCSSBlock.className = "antiAdBlockCSS";
	mainCSSBlock.innerHTML = /* css */`
		/* The goal of this CSS is to make the iFramed player fill the previous player's space */
		.iframeIncognito {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 100000;
		}
	`;

	iframe.contentDocument.body.appendChild(iFrameCSSBlock);
	document.head.appendChild(mainCSSBlock);
	
	
	
	let playerCinemaButton = await (
		new Promise(
			async function(resolve, reject){
				let element;
				while(true){
					element = iframe.contentDocument.body.querySelector(`[data-title-no-tooltip="Cinema mode"]`);
					if(element == null){
						await (
							new Promise(
								function(resolve, reject){
									setTimeout(resolve, 10);
								}
							)
						)
					} else {
						break;
					}
				}
				return resolve(element);
			}
		)
	)
	
	let current_href = iframe.contentWindow.location.href;
	while(true){
		if(iframe.contentWindow.location.href != current_href){
			location.href = iframe.contentWindow.location.href;
			break;
		}
		await (
			new Promise(
				function(resolve, reject){
					setTimeout(resolve, 10);
				}
			)
		)
	}
}

function removeAntiAdBlock(){
	let element;
	element = document.querySelector(".antiAdBlockCSS");
	if(element != null){
		console.log("CSS Remove");
		element.parentNode.removeChild(element);
	}
	
	element = document.querySelector(".iframeIncognito");
	if(element != null){
		console.log("IFrame Remove");
		element.parentNode.removeChild(element);
	}
}

function antiAdBlockRefresh(){
	console.log("Triggered");
	removeAntiAdBlock();
	antiAdBlock();
}

antiAdBlock();

