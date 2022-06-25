// #############################
// ### start import require ###
// ### import write/read file
const fs = require('fs');
// ### import discord.js
	const { Client, Permissions, MessageEmbed} = require('discord.js');
	const client = new Client({
		partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
		intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS'],
		disableMentions: "all",
		shards: "auto",
		restTimeOffset: 0
	});
// ### import axios
	const axios = require('axios');
// ### import moment.js
	const moment = require('moment');
	const momentTZ = require('moment-timezone');
	moment.locale('fr');
// ### import sortby - sort table order
    require("./sortBy.js");
// ### end import ###
// ##################

// ______________________
// ___ Definition Date
	var toDate = dateToString(Date.now());
	var dateOneDay = new Date();
		dateOneDay =  dateToString(dateOneDay.setDate(dateOneDay.getDate() + 1));
// ______________________

const {bot_3} = require('./config.json');
	const {prefix, releasePub, token} = bot_3;

const {channelJson} = require('./configCompta.json');

var list = fs.readFileSync('./compta.json'), myObj;

	try {
		myObj = JSON.parse(list);
		console.log(myObj);
	} catch (err) {
		console.log('There has been an error parsing your JSON.');
		console.log(err);
	}

client.on('ready', () => {
	console.log("BOT startup : "+moment().format('LTS'));
	console.log("	Version publier : "+releasePub);

	console.log(`\nBot 3 -> Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {

	let args = message.content.split(" ");

	if (args[0].toLowerCase() == `${prefix}first`) {
		deleteMsg(message);
		message.channel.send('Bot Compta init!');
	}

	if (args[0].toLowerCase() == `${prefix}compta`) {
		deleteMsg(message)

		getMsgData()
	}

	if (args[0].toLowerCase() == `${prefix}2`) {
		if (args[1] == "add" && !countParam(message, args, 4) || args[1] == "del" && !countParam(message, args, 2)) return 0;
		deleteMsg(message)

		// !!2 add icone NameGroupe Dollars
		// !!2 del idLine

		switch (args[1]) {
			case 'add':
				let arr = {"Icone": args[2], "Name": args[3], "Cash": args[4]};

				let lastIndex = parseInt(Object.keys(myObj.list[2])[Object.keys(myObj.list[2]).length-1])+1;
				
				myObj.list[2][lastIndex] = arr;
				break;
			case 'del':
				// myObj.list[3].argent_sale = args[2];
				break;
			default:
				break;
		}

		saveConf(myObj, "./compta.json");
		getMsgData(myObj)
	}

	if (args[0].toLowerCase() == `${prefix}3`) {
		if (!countParam(message, args, 2)) return 0;
		deleteMsg(message)

		// !!3 1 15000

		switch (args[1]) {
			case '1':
				myObj.list[3].argent_propre = args[2];

				console.log(myObj.list[3].argent_propre);
				console.log(args[2]);

				break;
			case '2':
				myObj.list[3].argent_sale = args[2];
				break;
			default:
				break;
		}

		saveConf(myObj, "./compta.json");
		getMsgData()
	}


});

client.on('messageReactionAdd', async (_reaction, user) => {
	if (['888354278043947038', '884429785802092574', '923238213768863835', '945622322247770113', '927613733126172672'].includes(user.id)) {
		return 1;
	}

	switch (_reaction._emoji.name) {
		case '🔄':
			_reaction.users.remove(user.id);
				getMsgData();
			break;
		default:
			break;
	}
});

client.login(token);

// uuid channel compta -> 926369794863812729

module.exports = {
	refreshByWeb: function () {
		getMsgData();
	}
};


// ######################
// ### start fonction ###
async function countParam(message, param, length) {
	if ((param.length-1) < length) {
		console.log(param);
		console.log("Error: Nombre de parametre invalide.");

		replyData = await message.reply("Error: Nombre de parametre invalide.");

		replyData.delete({ timeout: 3000 })
			.then(msg => console.log(`Deleted message from ${msg.author.username} after 3 seconde`))
			.catch(console.error);

		return 0;
	}
	return 1;
}

function deleteMsg(message) {
	message.delete({ timeout: 1 }).catch(console.error);
	return 1;
}

function dateToString(date) {
	var date_ob = new Date(date);
	let day = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();

	return year +"-"+ month +"-"+ day;
}

function saveConf(myObj, file) {
	var myJson = JSON.stringify(myObj);

	fs.writeFile(file, myJson, function (err) {
		if (err) {
			console.log('There has been an error saving your configuration data.');
			console.log(err.message);
			return;
		}
		console.log('Configuration saved successfully.');
	});
}

function getMsgData() {
	try {
		myObj = JSON.parse(fs.readFileSync('./compta.json'));
		// console.log(myObj);
	} catch (err) {
		console.log('There has been an error parsing your JSON.');
		console.log(err);
	}

	toDisplayMsg();
}

function toDisplayMsg() {

	var section_1 = section1();
	var section_2 = section2();
	var section_3 = section3();
	var section_4 = section4();
	var section_5 = section5();
	var section_6 = section6();
	var section_7 = section7();
	var section_maj = sectionMaj();
	var section_separed = sectionSepared();

	client.channels.fetch(channelJson.comptaProd).then((channel) => {
		channel.messages.fetch({around: channelJson.uuidMessage, limit: 1})
			.then(msg => {
				const fetchedMsg = msg.first();
				fetchedMsg.edit(
					section_1+
					section_separed+
					section_2+
					section_separed+
					section_3+
					section_separed+
					section_4+
					section_separed+
					section_5+
					section_separed+
					section_6+
					section_separed+
					section_7+
					section_separed+
					section_maj
				);

				msg.forEach(async message => {
					await message.react('🔄');
				})
			}).catch((err) => {
				console.log('Not message found in : '+channel.name);
				console.log(err);
			});
	});
}

function section1() {
	// ##############
	// Help commande
	// !!1 add icone NameGroupe Dollars
	// !!1 del idLine

	let dataMsg = 	"> 📈｜**1**｜__**Blanchiment max semaine :**__\n"+
					"> ```DIFF\n";

	for (element in myObj.list[1]) {
		dataMsg += 	"> "+myObj.list[1][element].Icone+
					"｜"+String(element).padEnd(2)+
					"｜"+String(myObj.list[1][element].Name).padEnd(20)+
					":   "+convertNumber(myObj.list[1][element].Cash)+"\n";
	}

	dataMsg +=		"> ```\n"+
					"> **`🏦｜En cas de dépassement voir avec la banque sinon il y auras des répercutions`**";

	return dataMsg;
}

function section2() {
	// ##############
	// Help commande
	// !!2 add icone NameGroupe Dollars
	// !!2 del idLine

	let dataMsg = 	"> 🧼｜**2**｜__**Blanchiment en cours :**__\n"+
					"> ```DIFF\n";

	for (element in myObj.list[2]) {
		dataMsg += 	"> "+myObj.list[2][element].Icone+
					"｜"+String(element).padEnd(2)+
					"｜"+String(myObj.list[2][element].Name).padEnd(20)+
					":   "+convertNumber(myObj.list[2][element].Cash)+"\n";
	}

	dataMsg +=		"> ```";

	return dataMsg;
}

function section3() { 
	// ##############
	// Help commande
	// !!3 idLine Dollars
	
	// let dataMsg =	"> 📝｜**3**｜__**Livre des comptes**__\n"+
	// 				"> ```DIFF\n"+
	// 				"> + 📋｜1 ｜Compte The Saviors  :   "+convertNumber(myObj.list[3].argent_propre)+"\n"+
	// 				"> - 💰｜2 ｜Argent Sale         :   "+convertNumber(myObj.list[3].argent_sale)+"\n"+
	// 				"> ```";

	let dataMsg = 	"> 📝｜**3**｜__**Livre des comptes**__\n"+
					"> ```DIFF\n";

	for (element in myObj.list[3]) {
		dataMsg += 	"> "+myObj.list[3][element].Icone+
					"｜"+String(element).padEnd(2)+
					"｜"+String(myObj.list[3][element].Name).padEnd(20)+
					":   "+convertNumber(myObj.list[3][element].Cash)+"\n";
	}

	dataMsg +=		"> ```";

	return dataMsg;
}

function section4() {
	// ##############
	// Help commande
	// !!4 add countItems nameItems
	// !!4 del nameItems

	let dataMsg = 	"> 🔫｜**4**｜__**Armes en stock :**__\n"+
					"> ```JSON\n";

	for (element in myObj.list[4]) {
		dataMsg += 	"> "+String(myObj.list[4][element].countItems).padEnd(5)+
					"｜"+myObj.list[4][element].nameItems+"\n";
	}

	dataMsg += 		"> ```";

	return dataMsg;
}

function section5() {
	// ##############
	// Help commande
	// !!5 add countItems nameItems
	// !!5 del nameItems

	let dataMsg = 	"> 🌱｜**5**｜__**Items drogues :**__\n"+
					"> ```JSON\n";

	for (element in myObj.list[5]) {
		dataMsg += 	"> "+String(myObj.list[5][element].countItems).padEnd(5)+
					"｜"+myObj.list[5][element].nameItems+"\n";
	}

	dataMsg += 		"> ```";

	return dataMsg;
}

function section6() {
	// ##############
	// Help commande
	// !!6 add countItems nameItems
	// !!6 del nameItems

	let dataMsg = 	"> 📦｜**6**｜__**Items :**__\n"+
					"> ```JSON\n";

	for (element in myObj.list[6]) {
		dataMsg += 	"> "+String(myObj.list[6][element].countItems).padEnd(5)+
					"｜"+myObj.list[6][element].nameItems+"\n";
	}

	dataMsg += 		"> ```";

	return dataMsg;
}

function section7() {
	let dataMsg = 	"> 🏃‍♂️｜**7**｜__**Argent qui devrait arriver sous peu :**__\n"+
					"> ```DIFF\n";

	for (element in myObj.list[7]) {
		dataMsg += 	"> "+myObj.list[7][element].Icone+
					"｜"+String(element).padEnd(2)+
					"｜"+String(myObj.list[7][element].Name).padEnd(20)+
					":   "+convertNumber(myObj.list[7][element].Cash)+"\n";
	}

	dataMsg += 		"> ```";

	return dataMsg;
}

function sectionMaj() {
	let dataMsg = "```DIFF\n+ 🔄｜Mise à jour : "+moment().tz("Europe/Paris").format('llll')+"```";

	return dataMsg;
}

function sectionSepared() {
	let dataMsg = "\n———————————————————\n";
	return dataMsg;
}

function convertNumber(x) {
	return "$ "+parseInt(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
// ### end fonction ###
// ####################