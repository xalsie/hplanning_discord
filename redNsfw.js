// #############################
// ### start import require ###
// ### import write/read file
    const fs = require('fs');
// ### import discord.js
	const { Client, Permissions, MessageEmbed} = require('discord.js');
	const permissions = new Permissions(8);
	const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
// ### import axios
	const axios = require('axios');
// ### import moment.js
	const moment = require('moment');
	moment.locale('fr');
// ### import sortby - sort table order
    require("./sortBy.js");
// ## import reddit-wrapper-v2 class
	var RedditAPI = require('reddit-wrapper-v2');
// ### end import ###
// ##################

// ______________________
// ___ Definition Date
	var toDate = dateToString(Date.now());
	var dateOneDay = new Date();
		dateOneDay =  dateToString(dateOneDay.setDate(dateOneDay.getDate() + 1));
// ______________________

const {bot_2, reddit} = require('./config.json');
	const {prefix, prefix2, releasePub, token} = bot_2;

client.on('ready', () => {
	console.log("BOT startup : "+moment().format('LTS'));
	console.log("	Version publier : "+releasePub);

	console.log(`\nBot 2 -> Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	let args = message.content.split(" ");

	if (args[0].toLowerCase() == `${prefix}nsfw`) {
		// deleteMsg(message);

		console.log("@"+ message.author.username +" a fait la commande "+message.content);

		getRedditPicture('nsfw', message, message.author);
	}

	if (args[0].toLowerCase() == `${prefix2}`) {
		// deleteMsg(message);

		console.log("@"+ message.author.username +" a fait la commande "+message.content);

		getRedditPicture(args[1].toLowerCase(), message, message.author);
	}

	if (args[0].toLowerCase() == `${prefix}rank`) {
		// deleteMsg(message);
		getStat();
	}
});

client.on('messageReactionAdd', async (_reaction, user) => {
	if (user.id === "888354278043947038" || user.id === "884429785802092574" || user.id === "923238213768863835") {
		return 1;
	}

	switch (_reaction._emoji.name) {
		case '🆕':
			uuidChannel = getChannelPause();

			if (uuidChannel != _reaction.message.channel.id) return;

			_reaction.users.remove(user.id);

			console.log("@"+ user.username +" a réagie a NEW /nsfw");

			getRedditPicture('nsfw', false, user);

			addReactToJson(user, 'new');

			break;
		case '👍🏻':
			uuidChannel = getChannelPause();

			if (uuidChannel != _reaction.message.channel.id) return;

			addReactToJson(user, 'like');
			break;
		case '👎🏻':
			uuidChannel = getChannelPause();

			if (uuidChannel != _reaction.message.channel.id) return;

			addReactToJson(user, 'dislike');
			break;
		case '❤':
			uuidChannel = getChannelPause();

			if (uuidChannel != _reaction.message.channel.id) return;

			addReactToJson(user, 'love');
			break;

		default:
			break;
	}
});

client.login(token);

// ######################
// ### start fonction ###
async function countParam(message, param, length) {
	if (param.length < length) {
		console.log(param);
		console.log("Error: Nombre de parametre invalide.");

		replyData = await message.reply("Error: Nombre de parametre invalide.");

		replyData.delete({ timeout: 3000 })
			.then(msg => console.log(`Deleted message from ${msg.author.username} after 3000 miliseconde`))
			.catch(console.error);

		return 0;
	}
	return 1;
}

function deleteMsg(message) {
	message.delete({ timeout: 1 }).catch(console.error);
	return 1;
}

function displayVersion() {
	var data = fs.readFileSync('./versions.json'), myObj;
	var { version, dateversion } = "";

	try {
		myObj = JSON.parse(data);

		version = myObj.version;
		dateversion = myObj.date;

	} catch (err) {
		console.log('Error parsing your JSON. => "./versions.json"');
		console.log(err);
	}

	return {version, dateversion};
}

function addReactToJson(user, react) {
	var dataNsfw = fs.readFileSync('./nsfwStat.json'), myObjNsfw;
	var { userUuid, userStat, userName} = "";

	if (dataNsfw == undefined) {
		myObjNsfw = {};
		myObjNsfw[user.id] = {};
		myObjNsfw[user.id]["name"] = user.username;
		myObjNsfw[user.id]["new"] = 0;
		myObjNsfw[user.id]["like"] = 0;
		myObjNsfw[user.id]["dislike"] = 0;
		myObjNsfw[user.id]["love"] = 0;
		myObjNsfw[user.id]["autre"] = 0;
	} else {
		try {
			myObjNsfw = JSON.parse(dataNsfw);
		
			if (myObjNsfw[user.id] == undefined) {
				console.log("######");
				myObjNsfw[user.id] = {};
				myObjNsfw[user.id]["name"] = user.username;
				myObjNsfw[user.id]["new"] = 0;
				myObjNsfw[user.id]["like"] = 0;
				myObjNsfw[user.id]["dislike"] = 0;
				myObjNsfw[user.id]["love"] = 0;
				myObjNsfw[user.id]["autre"] = 0;
			}

			btNew = myObjNsfw[user.id]["new"];
			btLike = myObjNsfw[user.id]["like"];
			btDislike = myObjNsfw[user.id]["dislike"];
			btLove = myObjNsfw[user.id]["love"];
			btAutre = myObjNsfw[user.id]["autre"];

			console.log("create array ...");
			console.log(myObjNsfw);
		} catch (err) {
			console.log('There has been an error parsing your JSON.');
			console.log(err);
		}
	}

	switch (react) {
		case 'new':
			myObjNsfw[user.id]["new"] = btNew + 1;
			break;
		case 'like':
			myObjNsfw[user.id]["like"] = btLike + 1;
			break;
		case 'dislike':
			myObjNsfw[user.id]["dislike"] = btDislike + 1;
			break;
		case 'love':
			myObjNsfw[user.id]["love"] = btLove + 1;
			break;
		default:
			myObjNsfw[user.id]["autre"] = btAutre + 1;
			break;
	}

	fs.writeFile('./nsfwStat.json', JSON.stringify(myObjNsfw), function (err) {
		if (err) {
			console.log('There has been an error saving your configuration data.');
			console.log(err.message);
			return;
		}
		console.log('Stat saved successfully.');
	});
}

function dateToString(date) {
	var date_ob = new Date(date);
	let day = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();

	return year +"-"+ month +"-"+ day;
}

function getRedditPicture(subreddit = false, message = false, user = false) {
	var redditConn	= new RedditAPI({
	    // Options for Reddit Wrapper
		username: reddit.username,
		password: reddit.password,
	    app_id: reddit.app_id,
	    api_secret: reddit.api_secret,
	    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
			retry_on_wait: true,
			retry_on_server_error: 5,
			retry_delay: 1,
			logs: true
	});

	// gets an api token
	redditConn.api.get_token()
		.then(function(results) {
			let token = results[0];
			token.should.be.ok();
			done();
		})
		.catch(function(err) {});

	redditConn.api.get('/r/'+subreddit+'/random', {
			limit: 1,
		})
		.then(function(response) {

			response[1].forEach(function(elem, idx) {
				let link = elem.data.children[0].data;

				if (link.domain == 'redgifs.com') {
					getRedditPicture(subreddit, message, user);
					return;
				}

				if (link.url) postMessage(link, link.url, subreddit, message, user);
			
			});
		})
		.catch(function(err) {
			console.log("Error getting picture: ", err);
		})
}

function getChannelPause() {
	let uuidDev = '912793714638848110';
	let uuidProd = '912375379963035698';
	let uuid = 0;

	switch(releasePub) {
		case 0:
			uuid = uuidDev;
		break;
		case 1:
			uuid = uuidProd;
		break;
	}
	
	return uuid;
}

function postMessage(link, url, subreddit, message, user) {
	const exampleEmbed = {
		"color": "#b90c0c",
		"title": link.subreddit_name_prefixed,
		"url": "https://www.reddit.com"+link.permalink,
		"description": "Publié par [u/"+link.author+"](https://www.reddit.com/u/"+link.author+") `"+link.author_flair_text+"`\n\n ⬇️｜ "+url+" ｜⬇️",
		"image": {
			"url": url
		},
		"timestamp": new Date(),
		"footer": {
			"text": "@"+user.username
		}
	};

	client.channels.cache.get(getChannelPause()).send({ embed: exampleEmbed })
		.then(function (message) {
			message.react('🆕')
			message.react('👍🏻')
			message.react('👎🏻')
			message.react('❤')
		});
}

function getStat() {
	var dataNsfw = fs.readFileSync('./nsfwStat.json'), myObjNsfw;
	var { userUuid, userStat, userName} = "";

	myObjNsfw = JSON.parse(dataNsfw);

	// ❔

	var array = new Array();
	var data = "";
	var count = 1;

	Object.keys(myObjNsfw).forEach(function(elem, idx) {
		let name = "@"+myObjNsfw[elem].name;
		let btNew = ""+myObjNsfw[elem].new
		let btLike = ""+myObjNsfw[elem].like
		let btDislike = ""+myObjNsfw[elem].dislike
		let btLove = ""+myObjNsfw[elem].love
		let countTotal = parseInt(btNew)+parseInt(btLike)+parseInt(btDislike)+parseInt(btLove);

		array.push({count: countTotal, data: `${name.padEnd(20)}` + `${btNew.padEnd(10)}` + `${btLike.padEnd(11)}` + `${btDislike.padEnd(11)}` + `${btLove.padEnd(5)}\n`});
	})
	
	array.sort((a,b) => a.count-b.count).reverse();

	data = `\`\`\`\n${'🚀｜N°'.padEnd(6)}` + `${'@｜Name'.padEnd(16)}` + `${'🆕｜NEW'.padEnd(9)}` + `${'👍🏻｜LIKE'.padEnd(12)}` + `${'👎🏻｜DISLIKE'.padEnd(14)}` + `${'❤｜LOVE'.padEnd(8)}\n`;

	array.forEach(elem => {
		data = data + `${count.toString().padEnd(6)}` + elem.data;
		count++;
	});

	const exampleEmbed = new MessageEmbed()
		.setColor('#ff00d7')
		.setTitle('📊｜Statistique')
		.setURL('https://discord.js.org/')
		.setDescription(data+"```")
		.setTimestamp()
		.setFooter(displayVersion().version);

	client.channels.cache.get(getChannelPause()).send(exampleEmbed);
}
// ### end fonction ###
// ####################