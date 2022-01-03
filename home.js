// #############################
// ### start import require ###
// ### import write/read file
	const fs = require('fs');
// ### import discord.js
	const { Client, Permissions, MessageEmbed} = require('discord.js');
	const permissions = new Permissions(8);
	const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
// ### import ical
	const ical = require('node-ical');
// ### import axios
	const axios = require('axios');
// ### import moment.js
	const moment = require('moment');
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
	var lastmodified = new Date();
	var startWeek = moment().startOf('week').toDate();
	var endWeek = moment().startOf('week').add(1, 'days').toDate();
// ### heure work
	var startHourDay = false;
	var endHourDay = false;
// ### date prochaine semaine
	var startNextWeek = moment().week(Number.parseInt(moment().format('W'))+1).startOf('week').toDate();
	var endNextWeek = moment().week(Number.parseInt(moment().format('W'))+1).startOf('week').add(1, 'days').toDate();
// ______________________

const {bot_1, reddit} = require('./config.json');
	const {prefix, releasePub, token} = bot_1;

var data = fs.readFileSync('./uuidMessages.json'), myObj;
	var { uuid_slam, uuid_sisr, uuid_dev, channel_slam, channel_sisr, channel_dev } = "";

	try {
		myObj = JSON.parse(data);

		uuid_slam = myObj.uuids.SLAM;
		uuid_sisr = myObj.uuids.SISR;
		uuid_dev = myObj.uuids.DEV;

		channel_slam = myObj.channels.SLAM;
		channel_sisr = myObj.channels.SISR;
		channel_dev = myObj.channels.DEV;

		console.log(myObj);

	} catch (err) {
		console.log('There has been an error parsing your JSON.');
		console.log(err);
	}

client.on('ready', () => {
	console.log("BOT startup : "+moment().format('LTS'));
	console.log("	Version publier : "+releasePub);

	var x = false;
	if ((moment().format('LTS') >= moment("20210920T113000Z").format('LTS')) && (moment().format('LTS') <= moment("20210920T130000Z").format('LTS'))) {
		x = true;
	}

	console.log(`\nBot 1 -> Logged in as ${client.user.tag}!`);
});

(function loop(){
	setTimeout(function() {
		// getIcal("", "DEV");
		getIcal("", "SLAM");
		getIcal("", "SISR");
	   loop();
   }, refreshRate());
})();

client.on('message', async message => {

	// ##################
	// pour Ali
	var idAli = "811165642211983380/";
	if (message.author.id == idAli) {
		Promise.all([
			message.react('🇮'),
			message.react('🇱'),
			message.react('🇴'),
			message.react('🇻'),
			message.react('🇪'),
			message.react('🇺'),
			message.react('❤️')
		]).catch(error => console.error('One of the emojis failed to react:', error));
	}
	// ##################

	let args = message.content.split(" ");

	if (args[0].toLowerCase() == `${prefix}first`) {
		deleteMsg(message);
		message.channel.send('Calendrier de Lundi & Mardi !');
	}

	if (args[0].toLowerCase() === `${prefix}uuid`) {
		if (countParam(message, args, 2)) return 1;
		deleteMsg(message);

		client.channels.fetch(message.channel.id).then((channel) => {
			channel.messages.fetch({around: args[2], limit: 1}).then(messages => {
				messages.forEach(async message => {
					await message.react('🔄');
				})
			}).catch((err) => {
				console.log('Not message found in : '+args[2]);
				console.log(err);
			});
		});

		switch(args[1].toUpperCase()){
			case "SLAM":
				uuid_slam = args[2];
				myObj.uuids.SLAM = args[2];
				console.log("UUID SALM : "+uuid_slam);
				break;
			case "SISR":
				uuid_sisr = args[2];
				myObj.uuids.SISR = args[2];
				console.log("UUID SISR : "+uuid_sisr);
				break;
			case "DEV":
				uuid_dev = args[2];
				myObj.uuids.DEV = args[2];
				console.log("UUID DEV : "+uuid_dev);
				break;
		}

		var myJson = JSON.stringify(myObj);

		fs.writeFile('./uuidMessages.json', myJson, function (err) {
			if (err) {
				console.log('There has been an error saving your configuration data.');
				console.log(err.message);
				return;
			}
			console.log('Configuration saved successfully.');
		});
	}

	if (args[0].toLowerCase() === `${prefix}planning` || args[0].toLowerCase() === `${prefix}1`) {
		if (!countParam(message, args, 1)) return 1;
		deleteMsg(message);

		switch(args[1].toUpperCase()){
			case "SLAM":
				getIcal(message, "SLAM");
				break;
			case "SISR":
				getIcal(message, "SISR");
				break;
			case "DEV":
				getIcal(message, "DEV");
				break;
			case "ALL":
				getIcal("", "SLAM");
				getIcal("", "SISR");
				break;
		}
	}
});

client.on('messageReactionAdd', async (_reaction, user) => {
	if (user.id === "888354278043947038" || user.id === "884429785802092574" || user.id === "923238213768863835") {
		return 1;
	}

	switch (_reaction._emoji.name) {
		case '🔄':
			_reaction.users.remove(user.id);

			if (releasePub == 1) {
				getIcal("", "SLAM");
				getIcal("", "SISR");
			} else {
				getIcal("", "DEV");
			}
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

function dateToString(date) {
	var date_ob = new Date(date);
	let day = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();

	return year +"-"+ month +"-"+ day;
}

function refreshRate() {
	var rtn = 0;
	if (moment().toDate() <= moment().startOf('week').add(2, 'days').toDate() && (moment().toDate() > startHourDay || moment().toDate() < endHourDay)) {
		rtn = 2; // 15 minutes
	} else {
		rtn = 120; // 120 minutes = 2H
	}

	console.log(rtn);
	return rtn*60*1000;
}

function getIcal(message, params) {
	var ical_slam = "http://intranet.ensup.eu/hp-cgy/Telechargements/ical/Edt_GIARD.ics?idICal=17C2294687BBF9496C18EF062FDFC449";
	var ical_sisr = "http://intranet.ensup.eu/hp-cgy/Telechargements/ical/Edt_AUBIER.ics?idICal=8EC1F79FA3078CD54C9BDB637DEFFB07";
	var channel_reply_ical_dev = '884434008950333550';
	var channel_reply_ical_slam = "886949854323032064";
	var channel_reply_ical_sisr = "886949885235068978";

	switch(params){
		case "SLAM":
			makeGetRequest(ical_slam, message, params, channel_reply_ical_slam);
			break;
		case "SISR":
			makeGetRequest(ical_sisr, message, params, channel_reply_ical_sisr);
			break;
		case "DEV":
			makeGetRequest(ical_slam, message, params, channel_reply_ical_dev);
			break;
	}

	async function makeGetRequest(url, message, param, idChannel) {
		let res = await axios.get(url)
		.then((res) => {
			parseIcsDirectly(res.data, message, param, idChannel);
		})
		.catch((error) => {
			console.log(error.response.data);
			console.log(error.response.status);
			console.log(error.response.headers);
		});
	}
}

function parseIcsDirectly(DataIcs, message, param, idChannel) {
	var arrayLundi = new Array();
	var arrayMardi = new Array();

	ical.async.parseICS(DataIcs, function(err, data) {
		Object.values(data).forEach(function(elems, idxs) {
			Object.keys(elems).forEach(function(elem, idx) {
				if (elem == "start") {
					if (moment().toDate() < moment(endWeek).add(1, 'days')) {
						if (dateToString(elems["start"]) == dateToString(startWeek))
							arrayLundi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
						if (dateToString(elems["start"]) == dateToString(endWeek))
							arrayMardi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
					} else {
						if (dateToString(elems["start"]) == dateToString(startNextWeek))
							arrayLundi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
						if (dateToString(elems["start"]) == dateToString(endNextWeek))
							arrayMardi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
					}
				}
			})
		})

		arrayLundi.sortBy(function(o){ return new Date( o.start )});
		arrayMardi.sortBy(function(o){ return new Date( o.start )});

		try {
			var startHourDay = new Date(arrayLundi[0].start);
			var endHourDay = new Date(arrayLundi[(arrayLundi.length - 1)].end);
		} catch (e) {
			console.log("arrayLundi : empty");
			var startHourDay = false;
			var endHourDay = false;
		}

		displayMsg(message, [arrayLundi, arrayMardi], param);
	});
}

async function displayMsg(message, arrayGenerate, param) {

	var rtnVersion = displayVersion();

	// console.log(arrayGenerate);
	var planning = "**```FIX\n📅｜Cours du "+moment((moment().toDate() < moment(endWeek).add(1, 'days'))? startWeek:startNextWeek).format("dddd DD MMMM")+" :```**\n";

		arrayGenerate[0].forEach((value, key) => {
			planning += msgFormating(value);
		})

	planning += "\n**```FIX\n📅｜Cours du "+moment((moment().toDate() < moment(endWeek).add(1, 'days'))? endWeek:endNextWeek).format("dddd DD MMMM")+" :```**\n";

		arrayGenerate[1].forEach((value, key) => {
			planning += msgFormating(value);
		})

	planning += "```DIFF\n+ 🔄｜Mise à jour : "+moment().format('llll')+"```";
	planning += "\n```CS\nV"+rtnVersion.version+" ("+rtnVersion.dateversion+")```";

	var uuidParam = "";
	switch(param){
		case "SLAM":
			uuidParam = uuid_slam;
			uuidChannel = channel_slam;
			break;
		case "SISR":
			uuidParam = uuid_sisr;
			uuidChannel = channel_sisr;
			break;
		case "DEV":
			uuidParam = uuid_dev;
			uuidChannel = channel_dev;
			break;
	}

	client.channels.fetch(uuidChannel).then((channel) => {
		console.log("Mise a jour du planning dans "+channel.name+" : "+moment().format('llll'));

		channel.messages.fetch({around: uuidParam, limit: 1})
		.then(msg => {
			const fetchedMsg = msg.first();
			fetchedMsg.edit(planning);

			msg.forEach(async message => {
				await message.react('🔄');
			})
		}).catch((err) => {
			console.log('Not message found in : '+channel.name);
			console.log(err);
		});
	});
}

function msgFormating(value) {
	var x = ((moment() >= moment(value.start)) && (moment() <= moment(value.end)))? "\> ":"";

	now = moment();
	var percentage_rounded = ((Math.round(((now - value.start) / (value.end - value.start) * 100)*100) / 100)/10)-1;
	var strBarTime = "          ";

	for (let index = 1; index < percentage_rounded; index++) {
		strBarTime = strBarTime.replace(" ", "=");
	}

	var timer = ((moment() >= moment(value.start)) && (moment() <= moment(value.end)))? "> ⏳｜Timer : ["+strBarTime.replace(" ", ">")+"] "+Math.round((percentage_rounded+1)*10)+"%\n":"";

	var description = (value.description.trim().toLowerCase().includes("report") || value.description.trim().toLowerCase().includes("annulé"))? "DIFF\n- "+value.description.trim().replaceAll("\n", "\n- "):value.description;

	var str = "> 🕐｜"+x+"Debut : "+moment(value.start).format('LT')+"\n"+
				timer+
				"> ```"+description.trim().replaceAll(" : ", ": ").replaceAll("\n", "\n> ")+"```"+
				"\n> 🕐｜Fin : "+moment(value.end).format('LT')+
				"\n> ———————————————————\n\n";

	return str;
}
// ### end fonction ###
// ####################