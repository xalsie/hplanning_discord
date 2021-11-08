// #############################
// ### start import require ###
// ### import write/read file
const fs = require('fs');
// ### import discord.js
const { Client, Permissions} = require('discord.js');
const permissions = new Permissions(8);
const client = new Client();
// ### import ical
const ical = require('node-ical');
// ### import axios
const axios = require('axios');
// ###import moment.js
const moment = require('moment');
moment.locale('fr');
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
// ### date prochaine semaine
var startNextWeek = moment().week(Number.parseInt(moment().format('W'))+1).startOf('week').toDate();
var endNextWeek = moment().week(Number.parseInt(moment().format('W'))+1).startOf('week').add(1, 'days').toDate();
// ______________________

const { prefix, token } = require('./config.json');

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

	var x = false;
	if ((moment().format('LTS') >= moment("20210920T113000Z").format('LTS')) && (moment().format('LTS') <= moment("20210920T130000Z").format('LTS'))) {
		x = true;
	}

	console.log("#########################"+moment().format('LTS'));
	console.log("#########"+moment("20210920T113000Z").format('LTS'));
	console.log("#########"+moment("20210920T130000Z").format('LTS'));
	console.log(x);

	console.log(`Logged in as ${client.user.tag}!`);
});

(function loop(){
	setTimeout(function() {
		getIcal("", "DEV");
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
		deleteMsg(message);

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
		deleteMsg(message);

		console.log(args);

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

client.login(token);

// ######################
// ### start fonction ###

function getIcal(message, params) {
	var ical_slam = "http://intranet.ensup.eu/hp-cgy/Telechargements/ical/Edt_GIARD.ics?version=2020.0.6.2&idICal=17C2294687BBF9496C18EF062FDFC449&param=643d5b312e2e36325d2666683d3126663d31";
	var ical_sisr = "http://intranet.ensup.eu/hp-cgy/Telechargements/ical/Edt_AUBIER.ics?version=2020.0.6.2&idICal=8EC1F79FA3078CD54C9BDB637DEFFB07&param=643d5b312e2e36325d2666683d3126663d31";
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
		// console.log(data);
		Object.values(data).forEach(function(elems, idxs) {
			Object.keys(elems).forEach(function(elem, idx) {
				// console.log(idx +" : "+ elem);
                // 6 : start
                // 8 : end
                // 11 : description

				if (elem == "start") {
					if (moment().toDate() < moment(endWeek).add(1, 'days')) {
						if (dateToString(elems["start"]) == dateToString(startWeek)) {
							arrayLundi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
						};
						if (dateToString(elems["start"]) == dateToString(endWeek)) {
							arrayMardi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
						};
					} else {
						if (dateToString(elems["start"]) == dateToString(startNextWeek)) {
							arrayLundi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
						};
						if (dateToString(elems["start"]) == dateToString(endNextWeek)) {
							arrayMardi.push({start: elems["start"], end: elems["end"], description: elems["description"]['val']});
						};
					}
				}
			})
		})

		arrayLundi.sortBy(function(o){ return new Date( o.start )});
		arrayMardi.sortBy(function(o){ return new Date( o.start )});

		displayMsg(message, [arrayLundi, arrayMardi], param);

	});
}

async function displayMsg(message, arrayGenerate, param) {

	var rtnVersion = displayVersion();

	// console.log(arrayGenerate);
	var planning = "**```FIX\nCours du "+moment((moment().toDate() < moment(endWeek).add(1, 'days'))? startWeek:startNextWeek).format("dddd DD MMMM")+" :```**\n";

		arrayGenerate[0].forEach((value, key) => {
			planning += msgFormating(value);
		})

	planning += "\n**```FIX\nCours du "+moment((moment().toDate() < moment(endWeek).add(1, 'days'))? endWeek:endNextWeek).format("dddd DD MMMM")+" :```**\n";

		arrayGenerate[1].forEach((value, key) => {
			planning += msgFormating(value);
		})

	planning += "```DIFF\n+ 🔄Mise à jour : "+moment().format('llll')+"```";

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
		}).catch((err) => {
			console.log('Not message found in : '+channel.name);
			console.log(err);
		});
	});
}

function msgFormating(value) {
	var x = ((moment() >= moment(value.start)) && (moment() <= moment(value.end)))? " \> ":"";

	now = moment();
	var percentage_rounded = ((Math.round(((now - value.start) / (value.end - value.start) * 100)*100) / 100)/10)-1;
	var strBarTime = "          ";

	for (let index = 1; index < percentage_rounded; index++) {
		strBarTime = strBarTime.replace(" ", "=");
	}

	var timer = ((moment() >= moment(value.start)) && (moment() <= moment(value.end)))? "> ⏳Timer : ["+strBarTime.replace(" ", ">")+"] "+Math.round((percentage_rounded+1)*10)+"%\n":"";

	var description = (value.description.trim().toLowerCase().includes("report") || value.description.trim().toLowerCase().includes("annulé"))? "DIFF\n- "+value.description.replaceAll("\n", "\n- "):value.description;

	var str = "> 🕐｜"+x+"Debut : "+moment(value.start).format('LT')+"\n"+
				timer+
				"> ```"+description.trim().replaceAll(" : ", ": ").replaceAll("\n", "\n> ")+"```"+
				"\n> 🕐｜Fin : "+moment(value.end).format('LT')+
				// "\n▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️\n\n";
				"\n> ——————————————————————\n\n";

	return str;
}

/*
> 🕐Debut : Aujourd’hui à 08:30
> ⏳Timer : [===>     ] 40%
> ```Matière: LV1 - Anglais
> Enseignant: ALI
> Promotions: BTS SIO SISR 2, BTS SIO SLAM 2
> Salle: 1er étage - MADRID```
> 🕐Fin : Aujourd’hui à 10:30
➖➖➖➖➖➖➖➖➖➖➖➖➖
```DIFF
+ 🔄 Mise à jour : Aujourd’hui à 02:04
```

```CS
V2.7.2 (27 sept. 2021)```
*/

function deleteMsg(message) {
	message.delete({ timeout: 1 }).catch(console.error);
	return 1;
}

function refreshRate() {
	var rtn = 0;
	if (moment().toDate() <= moment().startOf('week').add(2, 'days').toDate()) {
		rtn = 15; // 15 minutes
	} else {
		rtn = 120; // 120 minutes = 2H
	}

	console.log(rtn);
	return rtn*60*1000;
}

function dateToString(date) {
	var date_ob = new Date(date);
	let day = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();

	return year +"-"+ month +"-"+ day;
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

(function(){
    if (typeof Object.defineProperty === 'function'){
      try{Object.defineProperty(Array.prototype,'sortBy',{value:sb}); }catch(e){}
    }
    if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;
  
    function sb(f){
      for (var i=this.length;i;){
        var o = this[--i];
        this[i] = [].concat(f.call(o,o,i),o);
      }
      this.sort(function(a,b){
        for (var i=0,len=a.length;i<len;++i){
          if (a[i]!=b[i]) return a[i]<b[i]?-1:1;
        }
        return 0;
      });
      for (var i=this.length;i;){
        this[--i]=this[i][this[i].length-1];
      }
      return this;
    }
})();
// ### end fonction ###
// ####################