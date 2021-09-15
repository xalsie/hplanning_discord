const { 
	Client,
	Permissions
} = require('discord.js');
const permissions = new Permissions(8);

const axios = require('axios');
const bot = new Client();
const { prefix, token } = require('./config.json');

bot.login(token);

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('guildMemberAdd', async (member) => {
	member.guild.roles.fetch('836955249637589042').then(roleToGive => {
		member.roles.add(roleToGive);
	}).catch(err => console.log("Role could not be found; Error: " + err.stack));
})

bot.on('message', async message => {

	let args = message.content.split(" ");
	console.log(args);

	console.log(message.author.id);

	if (message.author.id !== "837867619495051274") {
		message.delete({ timeout: 500 })
			.then(msg => console.log(`Deleted message from ${msg.author.username} after 500 miliseconde`))
			.catch(console.error);
	}

	if (args[0] === `${prefix}code`) {

		msg = await message.channel.send("Connection DataBase [0%]");

		const jsonData = JSON.stringify({
			action: "getAccess",
			group_name: args[1],
			code_secret: args[2]
		})

		setTimeout(() => {
			msg.edit("Connection DataBase [10%]");
		}, 1000);
		setTimeout(() => {
			msg.edit("Connection DataBase [35%]");
		}, 1000);
		setTimeout(() => {
			msg.edit("Connection DataBase [50%]");
		}, 1000);
		setTimeout(() => {
			msg.edit("Connection DataBase [65%]");
		}, 1000);
		setTimeout(() => {
			msg.edit("Connection DataBase [75%]");
		}, 1000);
		setTimeout(() => {
			msg.edit("Connection DataBase [90%]");
		}, 1000);
		setTimeout(() => {
			msg.edit("Connection DataBase [100%]");
		}, 1000);

		msg.delete({ timeout: 2000 })
			.then(msg => console.log(`Deleted message from ${msg.author.username} after 500 miliseconde`))
			.catch(console.error);
		
		setTimeout(() => {
			axios
				.post('http://localhost/moneyWashAPI/API.php', jsonData)
				.then((res) => {

					console.log(res);
					console.log("####################");
					console.log(res.data);

					message.guild.roles.fetch('836954466502443048').then(roleToGive => {
						message.member.roles.add(roleToGive);
					}).catch(err => console.log("Role could not be found; Error: " + err.stack));
			
					message.guild.roles.fetch('836955249637589042').then(roleToGive => {
						message.member.roles.remove(roleToGive);
					}).catch(err => console.log("Role could not be found; Error: " + err.stack));
				})
				.catch(error => {
					console.error(error)
				})
		}, 5000);
	}
});


// function ajax(jsonData) {
// 	axios
// 		.post('http://localhost/moneyWashAPI/API.php', jsonData)
// 		.then(res => {
// 			// console.log(res);

// 			console.log(`statusCode: ${res.status}`);
// 			console.log(res.data);

// 			return res.data;
// 		})
// 		.catch(error => {
// 			console.error(error)
// 		})
// }

