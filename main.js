(async function(){
	if(window.self !== window.top){
		return;
	}
	
	let url = location.href;
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
	
	// Detection for adblock message
	if(document.querySelectorAll("#error-screen").length == 0){
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

		.html5-video-container {
			width: 100%;
			height: 100%;
		}
		
		#player video {
			width: 100% !important;
			height: 100% !important;
		}

		.ytp-chrome-bottom {
			width: 100% !important;
		}
	`;
	
	let mainCSSBlock = document.createElement("style");
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
})();
