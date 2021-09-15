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
const { channel } = require('diagnostics_channel');

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
	console.log(`Logged in as ${client.user.tag}!`);
    // getIcal();
});

setInterval(() => {
	getIcal("", "DEV");
	getIcal("", "SLAM");
	getIcal("", "SISR");
}, (30*60*1000));

client.on('message', async message => {

	// ##################
	// pour Ali
	var idAli = "811165642211983380";
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

	if (args[0] == `${prefix}first`) {
		deleteMsg(message);

		message.channel.send('Calendrier de Lundi & Mardi !');

		// switch(args[1]){
		// 	case "SLAM":
		// 		uuid_slam = args[2];
		// 		console.log("UUID SALM : "+uuid_slam);
		// 		break;
		// 	case "SISR":
		// 		uuid_sisr = args[2];
		// 		console.log("UUID SISR : "+uuid_sisr);
		// 		break;
		// 	case "DEV":
		// 		uuid_dev = args[2];
		// 		console.log("UUID DEV : "+uuid_dev);
		// 		break;
		// }
	}

	if (args[0] === `${prefix}uuid`) {
		deleteMsg(message);

		switch(args[1]){
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

	if (args[0] === `${prefix}planning` || args[0] === `${prefix}1`) {
		deleteMsg(message);

		console.log(args);

		switch(args[1]){
			case "SLAM":
				getIcal(message, args[1]);
				break;
			case "SISR":
				getIcal(message, args[1]);
				break;
			case "DEV":
				getIcal(message, args[1]);
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

	// console.log(arrayGenerate);
	var planning = "**```FIX\nCours du Lundi :```**\n";
		arrayGenerate[0].forEach((value, key) => {
			planning += msgFormating(value);
		})

	planning += "\n**```FIX\nCours du Mardi :```**\n";

		arrayGenerate[1].forEach((value, key) => {
			planning += msgFormating(value);
		})

	planning += "```diff\n+ Mise à jour : "+moment().calendar()+"```";

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
		console.log("Mise a jour du planning dans "+channel.name);

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
	return "> Debut :		"+moment(value.start).calendar()+"\n> Fin :			  "+moment(value.end).calendar()+"\n```"+value.description+"```\n";
}

function deleteMsg(message) {
	message.delete({ timeout: 1 }).catch(console.error);
	return 1
}

function dateToString(date) {
	var date_ob = new Date(date);
	let day = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();

	return year +"-"+ month +"-"+ day;
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