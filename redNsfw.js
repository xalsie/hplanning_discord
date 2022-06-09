// #############################
// ### start import require ###
// ### import write/read file
    const fs = require('fs');
// ### import discord.js
	const { Client, Permissions, MessageEmbed} = require('discord.js');
	const client = new Client({
		partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
		intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']
	});

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

client.on('messageCreate', async message => {
	let args = message.content.split(" ");

	if (args[0].toLowerCase() == `${prefix}nsfw`) {
		// deleteMsg(message);

		console.log("@"+ message.author.username +" a fait la commande "+message.content);

		getRedditPicture('nsfw', message, message.author);

		addReactToJson(message.author, 'new', getChannelPause(message));
		addCategoriesToJson(message.author, 'nsfw', getChannelPause(message))
	}

	if (args[0].toLowerCase() == `${prefix2}`) {
		// deleteMsg(message);

		console.log("@"+ message.author.username +" a fait la commande "+message.content);

		addCategoriesToJson(message.author, args[1].toLowerCase(), getChannelPause(message))

		getRedditPicture(args[1].toLowerCase(), message, message.author);
	}

	if (args[0].toLowerCase() == `${prefix}rank`) {
		// deleteMsg(message);
		getStat(message);
	}

	if (args[0].toLowerCase() == `${prefix}top`) {
		// deleteMsg(message);
		getCat(message);
	}
});

client.on('messageReactionAdd', async (_reaction, user) => {

	if (['888354278043947038', '884429785802092574', '923238213768863835', '945622322247770113'].includes(user.id)) {
		return 1;
	}

	switch (_reaction._emoji.name) {
		case '🆕':
			uuidChannel = getChannelPause(_reaction.message);

			if (uuidChannel != _reaction.message.channel.id) return;

			_reaction.users.remove(user.id);

			console.log("@"+ user.username +" a réagie a NEW /nsfw");

			getRedditPicture('nsfw', _reaction.message, user);

			addReactToJson(user, 'new', uuidChannel);
			addCategoriesToJson(user, 'nsfw', uuidChannel)

			break;
		case '👍🏻':
			uuidChannel = getChannelPause(_reaction.message);

			if (uuidChannel != _reaction.message.channel.id) return;

			addReactToJson(user, 'like', uuidChannel);
			break;
		case '👎🏻':
			uuidChannel = getChannelPause(_reaction.message);

			if (uuidChannel != _reaction.message.channel.id) return;

			addReactToJson(user, 'dislike', uuidChannel);
			break;
		case '❤':
			uuidChannel = getChannelPause(_reaction.message);

			if (uuidChannel != _reaction.message.channel.id) return;

			addReactToJson(user, 'love', uuidChannel);
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

function addReactToJson(user, react, uuidChannel) {
	var { userUuid, userStat, userName} = "";
	var myObjNsfw = undefined;
	var dataNsfw = fs.readFile('./nsfwStat.db', 'utf8', function (err, data) {
		if (err) throw err;

		try {
			console.log("Try parse json ...");

			myObjNsfw = JSON.parse(data);

			if (myObjNsfw[uuidChannel]["topUsers"][user.id] == undefined) {
				console.log("create array ...");
				console.log("######");
				myObjNsfw[uuidChannel]["topUsers"][user.id] = {};
				myObjNsfw[uuidChannel]["topUsers"][user.id]["name"] = user.username;
				myObjNsfw[uuidChannel]["topUsers"][user.id]["new"] = 0;
				myObjNsfw[uuidChannel]["topUsers"][user.id]["like"] = 0;
				myObjNsfw[uuidChannel]["topUsers"][user.id]["dislike"] = 0;
				myObjNsfw[uuidChannel]["topUsers"][user.id]["love"] = 0;
				myObjNsfw[uuidChannel]["topUsers"][user.id]["autre"] = 0;
			}

			btNew = myObjNsfw[uuidChannel]["topUsers"][user.id]["new"];
			btLike = myObjNsfw[uuidChannel]["topUsers"][user.id]["like"];
			btDislike = myObjNsfw[uuidChannel]["topUsers"][user.id]["dislike"];
			btLove = myObjNsfw[uuidChannel]["topUsers"][user.id]["love"];
			btAutre = myObjNsfw[uuidChannel]["topUsers"][user.id]["autre"];

		} catch (err) {
			console.log('There has been an error parsing your JSON.');

			console.log("VIDE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			myObjNsfw = {};
			myObjNsfw[uuidChannel] = {};
			myObjNsfw[uuidChannel]["topUsers"] = {};
			myObjNsfw[uuidChannel]["topUsers"][user.id] = {};
			myObjNsfw[uuidChannel]["topUsers"][user.id]["name"] = user.username;
			myObjNsfw[uuidChannel]["topUsers"][user.id]["new"] = 0;
			myObjNsfw[uuidChannel]["topUsers"][user.id]["like"] = 0;
			myObjNsfw[uuidChannel]["topUsers"][user.id]["dislike"] = 0;
			myObjNsfw[uuidChannel]["topUsers"][user.id]["love"] = 0;
			myObjNsfw[uuidChannel]["topUsers"][user.id]["autre"] = 0;

			btNew = myObjNsfw[uuidChannel]["topUsers"][user.id]["new"];
			btLike = myObjNsfw[uuidChannel]["topUsers"][user.id]["like"];
			btDislike = myObjNsfw[uuidChannel]["topUsers"][user.id]["dislike"];
			btLove = myObjNsfw[uuidChannel]["topUsers"][user.id]["love"];
			btAutre = myObjNsfw[uuidChannel]["topUsers"][user.id]["autre"];
			// console.log(err);
		}

		switch (react) {
			case 'new':
				myObjNsfw[uuidChannel]["topUsers"][user.id]["new"] = btNew + 1;
				break;
			case 'like':
				myObjNsfw[uuidChannel]["topUsers"][user.id]["like"] = btLike + 1;
				break;
			case 'dislike':
				myObjNsfw[uuidChannel]["topUsers"][user.id]["dislike"] = btDislike + 1;
				break;
			case 'love':
				myObjNsfw[uuidChannel]["topUsers"][user.id]["love"] = btLove + 1;
				break;
			default:
				myObjNsfw[uuidChannel]["topUsers"][user.id]["autre"] = btAutre + 1;
				break;
		}
	
		fs.writeFile('./nsfwStat.db', JSON.stringify(myObjNsfw), function (err) {
			if (err) {
				console.log('There has been an error saving your configuration data.');
				console.log(err.message);
				return;
			}
			console.log('Stat saved successfully.');
		});
	});
	return;
}

function addCategoriesToJson(user, categories, uuidChannel) {
	var myObjNsfw = undefined;
	var dataNsfw = fs.readFile('./nsfwStat.db', 'utf8', function (err, data) {
		if (err) throw err;

		try {
			console.log("Try parse json ...");

			myObjNsfw = JSON.parse(data);

			if (myObjNsfw[uuidChannel]["categories"][categories] == undefined) {
				console.log("create array ...");
				console.log("######");
				myObjNsfw[uuidChannel]["categories"][categories] = 0;
			}

			cate = myObjNsfw[uuidChannel]["categories"][categories];

		} catch (err) {
			console.log('There has been an error parsing your JSON.');

			console.log("VIDE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			// myObjNsfw = {};
			// myObjNsfw[uuidChannel] = {};
			// myObjNsfw[uuidChannel]["categories"] = {};
			myObjNsfw[uuidChannel]["categories"][categories] = 0;

			cate = myObjNsfw[uuidChannel]["categories"][categories];
			console.log(err);
		}

		myObjNsfw[uuidChannel]["categories"][categories] = cate + 1;
	
		fs.writeFile('./nsfwStat.db', JSON.stringify(myObjNsfw), function (err) {
			if (err) {
				console.log('There has been an error saving your configuration data.');
				console.log(err.message);
				return;
			}
			console.log('Stat saved successfully.');
		});
	});
	return;
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
		let link = response[1][0].data.children[0].data;

		// console.log(response[1][0].data.children[0].data);
		// return;

		if (link.domain == 'redgifs.com') {
			// getRedditPicture(subreddit, message, user);

			let video = link.preview.reddit_video_preview.fallback_url
			// is_gif: true

			// let thumbnail = link.thumbnail
			// console.log("POST GIF -> "+video);

			postMessage(link, video, true, message, user);
			return;
		} 
		// else if (link.domain == 'i.imgur.com') {
		// 	postMessage(link, link.url, true, message, user);
		// }
		else {
			// let fileSplit = link.url.split('?')[0];
			// let fileIndex = fileSplit.substr(fileSplit.lastIndexOf(".")+1);
				// console.log("fileIndex -> "+ fileIndex);

			postMessage(link, link.url, false, message, user);
		}

		// if (link.url) postMessage(link, link.url, false, message, user);
	})
	.catch(function(err) {
		console.log("Error getting picture: ", err);
	})
}

function getChannelPause(message) {
	// let uuidDev = '912793714638848110';
	// let uuidProd = '912375379963035698';
	let uuidDev = message.channel.id;
	let uuidProd = message.channel.id;
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

function postMessage(link, url, is_gif, message, user) {
	var exampleEmbed = new MessageEmbed()
		.setColor('#ff00d7')
		.setTitle(link.subreddit_name_prefixed)
		.setURL("https://www.reddit.com"+link.permalink)
		.setDescription("Publié par [u/"+link.author+"](https://www.reddit.com/u/"+link.author+") `"+link.author_flair_text+"`\n\n ⬇️｜ "+url+" ｜⬇️")

		// .setImage(url)
		.setTimestamp(new Date())
		.setFooter({ text: "@"+user.username })
		// .setColor('#0099ff')

	if (is_gif) {
		mess = { embeds: [exampleEmbed], files: [url] }
	} else {
		exampleEmbed
			.setImage(url)
		
		mess = { embeds: [exampleEmbed] }
	}

	client.channels.cache.get(getChannelPause(message)).send(mess)
		.then(function (message) {
			message.react('🆕')
			message.react('👍🏻')
			message.react('👎🏻')
			message.react('❤')
		});
}

function getStat(message = false) {
	var dataNsfw = fs.readFileSync('./nsfwStat.db'), myObjNsfw;
	var { userUuid, userStat, userName} = "";

	myObjNsfw = JSON.parse(dataNsfw);

	// ❔

	myObjNsfw = myObjNsfw[getChannelPause(message)]["topUsers"];

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

	data = `${'🚀｜N°'.padEnd(7)}` + `${'@｜Name'.padEnd(16)}` + `${'🆕｜NEW'.padEnd(9)}` + `${'👍🏻｜LIKE'.padEnd(12)}` + `${'👎🏻｜DISLIKE'.padEnd(14)}` + `${'❤｜LOVE'.padEnd(8)}\n`;

	array.forEach(elem => {
		data = data + `${count.toString().padEnd(8)}` + elem.data;
		count++;
	});

	var exampleEmbed = new MessageEmbed()
		.setColor('#b90c0c')
		.setTitle('📊｜Statistique')
		.setDescription("```\n"+data+"```")
		.setTimestamp(new Date())
		.setFooter({text: displayVersion().version})

	client.channels.cache.get(getChannelPause(message)).send({ embeds: [exampleEmbed] })
}

function getCat(message = false) {
	var dataNsfw = fs.readFileSync('./nsfwStat.db'), myObjNsfw;
	var { userUuid, userStat, userName} = "";

	myObjNsfw = JSON.parse(dataNsfw);

	// ❔

	myObjNsfw = myObjNsfw[getChannelPause(message)]["categories"];

	var array = new Array();
	var data = "";
	var count = 1;

	Object.keys(myObjNsfw).forEach(function(elem, idx) {
		let cate = elem;
		let cateNum = ""+myObjNsfw[elem];
		let countTotal = parseInt(cate);

		array.push({count: countTotal, data: `${cate.padEnd(20)}` + `${cateNum.padEnd(5)}\n`});
	})

	array.sort((a,b) => a.count-b.count).reverse();

	data = `${'🚀｜N°'.padEnd(7)}` + `${'@｜Name'.padEnd(16)}` + `${'@｜Count'.padEnd(16)}\n`;

	array.forEach(elem => {
		data = data + `${count.toString().padEnd(9)}` + elem.data;
		count++;
	});

	var exampleEmbed = new MessageEmbed()
		.setColor('#b90c0c')
		.setTitle('📊｜Statistique')
		.setDescription("```\n"+data+"```")
		.setTimestamp(new Date())
		.setFooter({text: displayVersion().version})

	client.channels.cache.get(getChannelPause(message)).send({ embeds: [exampleEmbed] })
}

// ### end fonction ###
// ####################