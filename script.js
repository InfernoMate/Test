////////////////
// PARAMETERS //
////////////////

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";
const avatarMap = new Map();

const mainContainer = document.getElementById('mainContainer');
const alertBox = document.getElementById('alertBox');
const avatarElement = document.getElementById('avatar');
const avatarSmallElement = document.getElementById('avatarButItsSmallerThanTheOneFromBeforeForPrettinessPurposes');
const usernameLabel = document.getElementById('username');
const usernameTheSecondLabel = document.getElementById('usernameTheSecond');
const descriptionLabel = document.getElementById('description');
const attributeLabel = document.getElementById('attribute');
const theContentThatShowsFirstInsteadOfSecond = document.getElementById('theContentThatShowsFirstInsteadOfSecond');
const theContentThatShowsLastInsteadOfFirst = document.getElementById('theContentThatShowsLastInsteadOfFirst');
const messageLabel = document.getElementById('message');

let widgetLocked = false;
let alertQueue = [];

/////////////////
// GLOBAL VARS //
/////////////////

const kickPusherWsUrl = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false';
let kickSubBadges = [];

/////////////
// OPTIONS //
/////////////

// Appearance
const showAvatar = GetBooleanParam("showAvatar", true);
const font = urlParams.get("font") || "";
const fontSize = GetIntParam("fontSize", 30);
const fontColor = urlParams.get("fontColor") || "#FFFFFF";
const useCustomBackground = GetBooleanParam("useCustomBackground", true);
const background = urlParams.get("background") || "#000000";
const opacity = urlParams.get("opacity") || "0.85";
const textAlignment = urlParams.get("textAlignment") || "left";
const alignment = urlParams.get("alignment") || "";

// General
const hideAfter = GetIntParam("hideAfter", 8);
const showAnimation = urlParams.get("showAnimation") || "";
const hideAnimation = urlParams.get("hideAnimation") || "";
const playSounds = GetBooleanParam("playSounds", true);
const globalShowAction = urlParams.get("globalShowAction") || "";
const globalHideAction = urlParams.get("globalHideAction") || "";
const showMesesages = GetBooleanParam("showMesesages", true);

// Which Twitch alerts do you want to see?
const showTwitchFollows = GetBooleanParam("showTwitchFollows", true);
const twitchFollowAction = urlParams.get("twitchFollowAction") || "";
const showTwitchSubs = GetBooleanParam("showTwitchSubs", true);
const twitchSubAction = urlParams.get("twitchSubAction") || "";
const showTwitchChannelPointRedemptions = GetBooleanParam("showTwitchChannelPointRedemptions", true);
const twitchChannelPointRedemptionAction = urlParams.get("twitchChannelPointRedemptionAction") || "";
const showTwitchCheers = GetBooleanParam("showTwitchCheers", true);
const twitchCheerAction = urlParams.get("twitchCheerAction") || "";
const showTwitchRaids = GetBooleanParam("showTwitchRaids", true);
const twitchRaidAction = urlParams.get("twitchRaidAction") || "";

// Which Kick alerts do you want to see?
const kickUsername = urlParams.get("kickUsername") || "InfernoMate";
const showKickFollows = GetBooleanParam("showKickFollows", true);
const showKickSubs = GetBooleanParam("showKickSubs", true);
const kickSubAction = urlParams.get("kickSubAction") || "";
const showKickChannelPointRedemptions = GetBooleanParam("showKickChannelPointRedemptions", true);
const kickChannelPointRedemptionAction = urlParams.get("kickChannelPointRedemptionAction") || "";
const showKickHosts = GetBooleanParam("showKickHosts", true);
const kickHostAction = urlParams.get("kickHostAction") || "";

// Which YouTube alerts do you want to see?
const showYouTubeSuperChats = GetBooleanParam("showYouTubeSuperChats", true);
const youtubeSuperChatAction = urlParams.get("youtubeSuperChatAction") || "";
const showYouTubeSuperStickers = GetBooleanParam("showYouTubeSuperStickers", true);
const youtubeSuperStickerAction = urlParams.get("youtubeSuperStickerAction") || "";
const showYouTubeMemberships = GetBooleanParam("showYouTubeMemberships", true);
const youtubeMembershipAction = urlParams.get("youtubeMembershipAction") || "";
// NEU: Option für YouTube-Abos
const showYouTubeSubscribers = GetBooleanParam("showYouTubeSubscribers", true);
const youtubeSubscriberAction = urlParams.get("youtubeSubscriberAction") || "";

// Which TikTok alerts do you want to see?
const enableTikTokSupport = GetBooleanParam("enableTikTokSupport", false);
const showTikTokGifts = GetBooleanParam("showTikTokGifts", true);
const tiktokGiftAction = urlParams.get("tiktokGiftAction") || "";
const showTikTokSubs = GetBooleanParam("showTikTokSubs", true);
const tiktokSubAction = urlParams.get("tiktokSubAction") || "";

// Which donation alerts do you want to see?
const showStreamlabsDonations = GetBooleanParam("showStreamlabsDonations", false);
const streamlabsDonationAction = urlParams.get("streamlabsDonationAction") || "";
const showStreamElementsTips = GetBooleanParam("showStreamElementsTips", false);
const streamelementsTipAction = urlParams.get("streamelementsTipAction") || "";
const showPatreonMemberships = GetBooleanParam("showPatreonMemberships", false);
const patreonMembershipActions = urlParams.get("patreonMembershipActions") || "";
const showKofiDonations = GetBooleanParam("showKofiDonations", false);
const kofiDonationAction = urlParams.get("kofiDonationAction") || "";
const showTipeeeStreamDonations = GetBooleanParam("showTipeeeStreamDonations", false);
const tipeeestreamDonationAction = urlParams.get("tipeeestreamDonationAction") || "";
const showFourthwallAlerts = GetBooleanParam("showFourthwallAlerts", false);
const fourthwallAlertAction = urlParams.get("fourthwallAlertAction") || "";

// Set avatar visibility
if (!showAvatar) {
    avatarElement.style.display = 'none';
    avatarSmallElement.style.display = 'none';
    alertBox.style.padding = '0.5em 1em';
}

// Set fonts for the widget
document.body.style.fontFamily = font;
document.body.style.fontSize = `${fontSize}px`;
document.body.style.color = fontColor;

// Set custom background
if (useCustomBackground) {
    const opacity255 = Math.round(parseFloat(opacity) * 255);
    let hexOpacity = opacity255.toString(16);
    if (hexOpacity.length < 2) {
        hexOpacity = "0" + hexOpacity;
    }
    document.documentElement.style.setProperty('--custom-background', `${background}${hexOpacity}`);
}

// Set text alignment
document.documentElement.style.setProperty('--text-align', textAlignment);

// Set the alignment of the alert box
switch (alignment)
{
    case "align-to-top":
        mainContainer.style.justifyContent = 'flex-start';
        break;
    case "align-to-center":
        mainContainer.style.justifyContent = 'center';
        break;
    case "align-to-bottom":
        mainContainer.style.justifyContent = 'flex-end';
        break;
}

/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

const client = new StreamerbotClient({
    host: sbServerAddress,
    port: sbServerPort,

    onConnect: (data) => {
        console.log(`Streamer.bot successfully connected to ${sbServerAddress}:${sbServerPort}`)
        console.debug(data);
        SetConnectionStatus(true);
    },

    onDisconnect: () => {
        console.error(`Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`)
        SetConnectionStatus(false);
    }
});

client.on('Twitch.Follow', (response) => {
    console.debug(response.data);
    TwitchFollow(response.data);
})

client.on('Twitch.Cheer', (response) => {
    console.debug(response.data);
    TwitchCheer(response.data);
})

client.on('Twitch.Sub', (response) => {
    console.debug(response.data);
    TwitchSub(response.data);
})

client.on('Twitch.ReSub', (response) => {
    console.debug(response.data);
    TwitchResub(response.data);
})

client.on('Twitch.GiftSub', (response) => {
    console.debug(response.data);
    TwitchGiftSub(response.data);
})

client.on('Twitch.GiftBomb', (response) => {
    console.debug(response.data);
    TwitchGiftBomb(response.data);
})

client.on('Twitch.RewardRedemption', (response) => {
    console.debug(response.data);
    TwitchRewardRedemption(response.data);
})

client.on('Twitch.Raid', (response) => {
    console.debug(response.data);
    TwitchRaid(response.data);
})

client.on('YouTube.SuperChat', (response) => {
    console.debug(response.data);
    YouTubeSuperChat(response.data);
})

client.on('YouTube.SuperSticker', (response) => {
    console.debug(response.data);
    YouTubeSuperSticker(response.data);
})

client.on('YouTube.NewSponsor', (response) => {
    console.debug(response.data);
    YouTubeNewSponsor(response.data);
})

client.on('YouTube.GiftMembershipReceived', (response) => {
    console.debug(response.data);
    YouTubeGiftMembershipReceived(response.data);
})

// NEU: Event-Listener für YouTube-Abos
client.on('YouTube.Subscribe', (response) => {
    console.debug(response.data);
    YouTubeSubscribe(response.data);
});

client.on('Streamlabs.Donation', (response) => {
    console.debug(response.data);
    StreamlabsDonation(response.data);
})

// ... (Restliche client.on Events bleiben unverändert) ...

///////////////////////////
// KICK PUSHER WEBSOCKET //
///////////////////////////
// ... (Dieser Block bleibt unverändert) ...

//////////////////////
// TIKFINITY CLIENT //
//////////////////////
// ... (Dieser Block bleibt unverändert) ...


///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

async function TwitchFollow(data) {
    if (!showTwitchFollows)
        return;
    const username = data.user_name;
    const avatarURL = await GetAvatar(username, 'twitch');
    UpdateAlertBox('twitch', avatarURL, `${username}`, `followed`, ``, username, ``, twitchFollowAction, data);
}
// ... (Alle anderen Twitch... Kick... TikTok... Funktionen bleiben unverändert) ...

function YouTubeSuperChat(data) {
    if (!showYouTubeSuperChats)
        return;
    const avatarURL = data.user.profileImageUrl;
    UpdateAlertBox('youtube', avatarURL, `${data.user.name}`, `sent a Super Chat (${data.amount})`, '', data.user.name, data.message, youtubeSuperChatAction, data);
}

function YouTubeSuperSticker(data) {
    if (!showYouTubeSuperStickers)
        return;
    const avatarURL = FindFirstImageUrl(data);
    UpdateAlertBox('youtube', avatarURL, `${data.user.name}`, `sent a Super Sticker (${data.amount})`, '', data.user.name, '', youtubeSuperStickerAction, data);
}

function YouTubeNewSponsor(data) {
    if (!showYouTubeMemberships)
        return;
    const avatarURL = data.user.profileImageUrl;
    UpdateAlertBox('youtube', avatarURL, `⭐ New ${data.levelName}`, `Welcome ${data.user.name}!`, '', data.user.name, '', youtubeMembershipAction, data);
}

function YouTubeGiftMembershipReceived(data) {
    if (!showYouTubeMemberships)
        return;
    const avatarURL = data.user.profileImageUrl;
    UpdateAlertBox('youtube', avatarURL, `${data.gifter.name}`, `gifted a membership`, `to ${data.user.name} (${data.tier})!`, data.gifter.name, '', youtubeMembershipAction, data);
}

// NEU: Funktion zur Anzeige von YouTube-Abos
async function YouTubeSubscribe(data) {
    if (!showYouTubeSubscribers)
        return;
    
    // Avatar abrufen (YouTube-Events liefern die URL normalerweise nicht mit)
    const avatarURL = await GetAvatar(data.displayName, 'youtube');

    UpdateAlertBox(
        'youtube',
        avatarURL,
        `${data.displayName}`,
        `has subscribed!`,
        '',
        data.displayName,
        '',
        youtubeSubscriberAction,
        data
    );
}

// ... (Alle weiteren Funktionen bleiben unverändert) ...

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

// HINWEIS: Die GetAvatar-Funktion muss für YouTube erweitert werden
async function GetAvatar(username, platform) {
    if (avatarMap.has(`${username}-${platform}`)) {
        console.debug(`Avatar found for ${username} (${platform}). Retrieving from hash map.`);
        return avatarMap.get(`${username}-${platform}`);
    }

    switch (platform) {
        case 'twitch': {
            console.debug(`No avatar found for ${username} (${platform}). Retrieving from Decapi.`);
            let response = await fetch('https://decapi.me/twitch/avatar/' + username);
            let data = await response.text();
            avatarMap.set(`${username}-${platform}`, data);
            return data;
        }
        case 'kick': {
            console.debug(`No avatar found for ${username} (${platform}). Retrieving from Kick.`);
            let response = await fetch('https://kick.com/api/v2/channels/' + username);
            let data = await response.json();
            let avatarURL = data.user.profile_pic;
            if (!avatarURL) avatarURL = 'https://kick.com/img/default-profile-pictures/default2.jpeg';
            avatarMap.set(`${username}-${platform}`, avatarURL);
            return avatarURL;
        }
        // NEU: Fallback für YouTube-Avatare, da das Abo-Event keine URL enthält
        case 'youtube': {
            console.debug(`No avatar found for ${username} (${platform}). Retrieving from SB proxy.`);
            // Annahme: Streamer.bot kann über eine Aktion den Avatar holen. Wir rufen eine Aktion auf.
            // In Streamer.bot musst du eine Aktion "GetYouTubeAvatar" erstellen, die "YouTube -> Get User Info" nutzt
            // und die `profileImageUrl` zurückgibt.
            // Vorerst verwenden wir ein Standard-Icon.
            return 'icons/platforms/youtube.png';
        }
    }
}

function DecodeHTMLString(html) {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}

// I used Gemini for this shit so if it doesn't work, blame Google
function FindFirstImageUrl(jsonObject) {
	if (typeof jsonObject !== 'object' || jsonObject === null) {
		return null; // Handle invalid input
	}

	function iterate(obj) {
		if (Array.isArray(obj)) {
			for (const item of obj) {
				const result = iterate(item);
				if (result) {
					return result;
				}
			}
			return null;
		}

		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (key === 'imageUrl') {
					return obj[key]; // Found it! Return the value.
				}

				if (typeof obj[key] === 'object' && obj[key] !== null) {
					const result = iterate(obj[key]); // Recursive call for nested objects
					if (result) {
						return result; // Propagate the found value
					}
				}
			}
		}
		return null; // Key not found in this level
	}

	return iterate(jsonObject);
}

function GetWinnersList(gifts) {
	const winners = gifts.map(gift => gift.winner);
	const numWinners = winners.length;

	if (numWinners === 0) {
		return "";
	} else if (numWinners === 1) {
		return winners[0];
	} else if (numWinners === 2) {
		return `${winners[0]} and ${winners[1]}`;
	} else {
		const lastWinner = winners.pop();
		const secondLastWinner = winners.pop();
		return `${winners.join(", ")}, ${secondLastWinner} and ${lastWinner}`;
	}
}

function UpdateAlertBox(platform, avatarURL, headerText, descriptionText, attributeText, username, message, sbAction, sbData) {
	// If the page is inactive (e.g. the alert browser source is on an inactive OBS scene)
	// don't run the alert
	if (document.visibilityState != 'visible')
	{
		console.debug('Tab is inactive. Skipping alert...');
		return;
	}

	// Check if the widget is in the middle of an animation
	// If any alerts are requested while the animation is playing, it should be added to the alert queue
	if (widgetLocked) {
		console.debug("Animation is progress, added alert to queue");
		let data = { platform: platform, avatarURL: avatarURL, headerText: headerText, descriptionText: descriptionText, attributeText: attributeText, username: username, message: message, sbAction: sbAction, sbData: sbData};
		alertQueue.push(data);
		return;
	}

	// Start the animation
	widgetLocked = true;

	// Set the card background colors
	alertBox.classList = '';
	if (useCustomBackground)
		alertBox.classList.add('customBackground');
	else
		alertBox.classList.add(platform);

	// Render avatars
	if (showAvatar) {
		avatarElement.src = avatarURL;
		avatarSmallElement.src = avatarURL;
	}

	// Set labels
	usernameLabel.innerHTML = headerText != null ? headerText : '';
	usernameTheSecondLabel.innerHTML = username != null ? username : '';
	descriptionLabel.innerHTML = descriptionText != null ? descriptionText : '';
	attributeLabel.innerHTML = attributeText != null ? attributeText : '';
	messageLabel.innerHTML = message != null ? `${message}` : '';
	theContentThatShowsLastInsteadOfFirst.style.opacity = 0;

	// Start animation
	theContentThatShowsFirstInsteadOfSecond.style.display = 'flex';
	alertBox.style.transition = 'all 0s ease-in-out';
	alertBox.style.height = theContentThatShowsFirstInsteadOfSecond.offsetHeight + "px";
	alertBox.style.animation = `${showAnimation} 0.5s ease-out forwards`;

	// Play sound effect
	if (playSounds) {
		const audio = new Audio('sfx/notification.mp3');
		audio.play();
	}

	// Add extra useful info to sbData
	if (!sbData)
		sbData = {};
	
	sbData.boxHeight1 = theContentThatShowsFirstInsteadOfSecond.offsetHeight;
	sbData.boxHeight2 = (message && showMesesages) ? theContentThatShowsLastInsteadOfFirst.offsetHeight : 0;
	sbData.alertDuration = hideAfter * 1000;

	console.log(sbData);

	// Run the Streamer.bot action if there is one
	if (globalShowAction) {
		console.debug('Running Streamer.bot action: ' + globalShowAction);
		client.doAction({name: globalShowAction}, sbData);
	}

	// Run the Streamer.bot action if there is one
	if (sbAction) {
		console.debug('Running Streamer.bot action: ' + sbAction);
		client.doAction({name: sbAction}, sbData);
	}

	// (1) Set timeout (8 seconds by default)
	// (2) Set the message label
	// (3) Calculate the height of message label
	// (4) Set the height of alertBox
	//		(a) Add in the CSS animation when this is working
	setTimeout(() => {
		alertBox.style.transition = 'all 0.5s ease-in-out';
		theContentThatShowsFirstInsteadOfSecond.style.opacity = 0;
		
		// For safety, if message doesn't exist, set it to empty string anyway
		if (!message)
			message = '';

		// If there is a message, show it in the second part of the animation
		// Else, just close the alert box and run the next alert
		if (message.trim().length > 0 && showMesesages) {
		
			//theContentThatShowsLastInsteadOfFirst.style.display = 'inline-block';
			theContentThatShowsLastInsteadOfFirst.style.visibility = 'visible';
			alertBox.style.height = theContentThatShowsLastInsteadOfFirst.offsetHeight + "px";
			theContentThatShowsLastInsteadOfFirst.style.opacity = 1;
			
			setTimeout(() => {
				// Run the Streamer.bot action if there is one
				if (globalHideAction) {
					console.debug('Running Streamer.bot action: ' + globalHideAction);
					client.doAction({name: globalHideAction}, sbData);
				}

				alertBox.style.animation = `${hideAnimation} 0.5s ease-out forwards`;
	
				setTimeout(() => {
					alertBox.style.height = '0px';
					theContentThatShowsFirstInsteadOfSecond.style.opacity = 1;
					theContentThatShowsLastInsteadOfFirst.style.opacity = 0;
					//theContentThatShowsLastInsteadOfFirst.style.display = 'none';
					theContentThatShowsLastInsteadOfFirst.style.visibility = 'hidden';
					widgetLocked = false;
					if (alertQueue.length > 0) {
						console.debug("Pulling next alert from the queue");
						let data = alertQueue.shift();
						UpdateAlertBox(data.platform, data.avatarURL, data.headerText, data.descriptionText, data.attributeText, data.username, data.message, data.sbAction, data.sbData);
					}
				}, 1000);
			}, hideAfter * 1000);	
		} else {
			// Run the Streamer.bot action if there is one
			if (globalHideAction) {
				console.debug('Running Streamer.bot action: ' + globalHideAction);
				client.doAction({name: globalHideAction}, sbData);
			}

			alertBox.style.animation = `${hideAnimation} 0.5s ease-out forwards`;

			setTimeout(() => {
				alertBox.style.height = '0px';
				
				theContentThatShowsFirstInsteadOfSecond.style.opacity = 1;
				theContentThatShowsLastInsteadOfFirst.style.opacity = 0;
				//theContentThatShowsLastInsteadOfFirst.style.display = 'none';
				theContentThatShowsLastInsteadOfFirst.style.visibility = 'hidden';
				widgetLocked = false;
				if (alertQueue.length > 0) {
					console.debug("Pulling next alert from the queue");
					let data = alertQueue.shift();
					UpdateAlertBox(data.platform, data.avatarURL, data.headerText, data.descriptionText, data.attributeText, data.username, data.message, data.sbAction, data.sbData);
				}
			}, 1000);
		}

	}, hideAfter * 1000);

}

async function GetKickChatroomId(username) {
	const url = `https://kick.com/api/v2/channels/${username}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}

		const data = await response.json();
		if (data.chatroom && data.chatroom.id) {
			return data.chatroom.id;
		} else {
			throw new Error("Chatroom ID not found in response.");
		}
	} catch (error) {
		console.error("Failed to fetch chatroom ID:", error.message);
		return null;
	}
}

async function GetKickSubBadges(username) {
	const response = await fetch(`https://kick.com/api/v2/channels/${username}`);
	const data = await response.json();

	return data.subscriber_badges || [];
}

function GetKickBadgeURL(data) {
	switch (data.type) {
		case 'subscriber':
			return CalculateKickSubBadge(data.count);
		default:
			return `icons/badges/kick-${data.type}.svg`;
	}
}

function CalculateKickSubBadge(months) {
  if (!Array.isArray(kickSubBadges)) return null;

  // Filter for eligible badges, then get the one with the highest 'months'
  const badge = kickSubBadges
    .filter(b => b.months <= months)
    .sort((a, b) => b.months - a.months)[0];

  return badge?.badge_image?.src || `icons/badges/kick-subscriber.svg`;
}

////////////////////
// TEST FUNCTIONS //
////////////////////

async function testWidget()
{
	UpdateAlertBox(
		'twitch',
		await GetAvatar('nutty', 'twitch'),
		`nutty`,
		`subscribed with Tier 3`,
		'',
		`nutty`,
		`O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A-JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA`
		//``
	);
}


///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

// This function sets the visibility of the Streamer.bot status label on the overlay
function SetConnectionStatus(connected) {
	let statusContainer = document.getElementById("statusContainer");
	if (connected) {
		statusContainer.style.background = "#2FB774";
		statusContainer.innerText = "Connected!";
		statusContainer.style.opacity = 1;
		setTimeout(() => {
			statusContainer.style.transition = "all 2s ease";
			statusContainer.style.opacity = 0;
		}, 10);
	}
	else {
		statusContainer.style.background = "#D12025";
		statusContainer.innerText = "Connecting...";
		statusContainer.style.transition = "";
		statusContainer.style.opacity = 1;
	}
}
