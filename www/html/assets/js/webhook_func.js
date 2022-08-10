// import library DiscordJs
import { MessageEmbed, WebhookClient } from 'discord.js';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname("./");

//url to your webhook
// const WebHookUrl = "https://discord.com/api/webhooks/990308691284746290/Ohv8ixa303mVaqdBejMVaCzpEuo_8pOcaebQ0_QfmeToGq2mdlCWsRfXcctUTTmtWq0R";
const WebHookUrl = "https://discord.com/api/webhooks/990291001144905738/tqtXN0y-lcCKiubBNlWTQuxHHb17owFimqPXeEnblscAZtNCR2ZZWZ0pzArm0mutDZas";
    const webhookClient = new WebhookClient({ url: WebHookUrl });

const sended = (embed) => {
    webhookClient.send({
        embeds: [embed]
    });
}
const auth = (value = false) => {
    if (!value) return;
    const embed = new MessageEmbed()
        .setTitle("L'utilisateur [__*"+value+"*__] s'est connecté !")
        .setColor('#0099ff')

    sended(embed);
};

const authOut = (value) => {
    if (!value) return;
    const embed = new MessageEmbed()
        .setTitle("L'utilisateur [__*"+value+"*__] s'est déconnecté.")
        .setColor('#D95454')

    sended(embed);
};

const toLogs = async (obj, section, user) => {
    if (!obj) return;

    var obj = JSON.parse(obj);

    const LogsAdd = obj.add; // obj
    const LogsModify = obj.modify; // obj
    const LogsDelete = obj.delete; // array
    var arrSelect = false;
    var item = false;
    var dataMsg = '';

    try {
        const data = fs.readFileSync(__dirname + "/compta.json", { encoding: 'utf8' })
        var myObj = JSON.parse(data).list[section];
    } catch (err) {
        console.error(err);
        return;
    }

    if (Object.keys(LogsAdd).length) {
        const embedAdd = new MessageEmbed() // Ajouté
            .setColor('#027000').setTitle('Element Ajouté').setTimestamp().setFooter({ text: user});

        dataMsg = "```DIFF\n"
         + ('  ｜Icone').padEnd(10)+"｜"+
         + ('Name').padEnd(20)+"｜"+
         + "Cash"+"｜\n";

        for (let i = 0; i < Object.keys(LogsAdd).length; i++) {
            arrSelect = LogsAdd[Object.keys(LogsAdd)[i]];

            dataMsg += "+ ｜"+String(arrSelect.Icone).substring(0, 3).padEnd(3)
             + "｜"+((String(arrSelect.Name).length<20)?String(arrSelect.Name).padEnd(20):String(arrSelect.Name).substring(0, 18).padEnd(18).padEnd(20, '.'))
             + "｜"+String(arrSelect.Cash)+"\n";
        }

        dataMsg += '```';

        console.log(dataMsg);

        embedAdd.setDescription(dataMsg)

        sended(embedAdd);
    }

    if (LogsDelete.length) {
        try {
            const embedDelete = new MessageEmbed() // Supprimé
                .setColor('#BA3C2A').setTitle('Element Supprimé').setTimestamp().setFooter({ text: user});

                dataMsg = "```DIFF\n"
                + ('   Icone').padEnd(10)+"｜"+
                + ('Name').padEnd(20)+"｜"+
                + "Cash"+"｜\n";

            for (let i = 0; i < LogsDelete.length; i++) {
                item = Object.values(myObj).filter((item) => {return (item.uuid == LogsDelete[i])})[0];

                dataMsg += "+ ｜"+String(item.Icone).substring(0, 3).padEnd(3)
                    + "｜"+((String(item.Name).length<20)?String(item.Name).padEnd(20):String(item.Name).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+String(item.Cash)+"\n";
            }

            dataMsg += '```';

            console.log(dataMsg);

            embedDelete.setDescription(dataMsg)

            sended(embedDelete);
        } catch (err) {
            console.log(err)
        }
    }

    if (Object.keys(LogsModify).length) {
        try {
            const embedModify = new MessageEmbed() // Modify
                .setColor('#ff9d00').setTitle('Element Modifié').setTimestamp().setFooter({ text: user});

            dataMsg = "```DIFF\n"
                + ('  ｜Icone').padEnd(10)+"｜"+
                + ('Name').padEnd(20)+"｜"+
                + "Cash"+"｜\n";

            for (let i = 0; i < Object.keys(LogsModify).length; i++) {
                arrSelect = LogsModify[Object.keys(LogsModify)[i]];
                item = Object.values(myObj).filter((item) => {return (item.uuid == arrSelect.uuid)})[0];

                dataMsg += "+ ｜"+String(arrSelect.Icone).substring(0, 3).padEnd(3)
                    + "｜"+((String(arrSelect.Name).length<20)?String(arrSelect.Name).padEnd(20):String(arrSelect.Name).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+String(arrSelect.Cash)+"\n";

                    dataMsg += "- ｜"+String(item.Icone).substring(0, 3).padEnd(3)
                    + "｜"+((String(item.Name).length<20)?String(item.Name).padEnd(20):String(item.Name).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+String(item.Cash)+"\n"
                    + "------------------------------------\n";
            }

            dataMsg += '```';

            console.log(dataMsg);

            embedModify.setDescription(dataMsg)

            sended(embedModify);
        } catch (err) {
            console.log(err)
        }
    }
}

const toLogsProfile = async (objModify, user) => {
    if (!objModify) return;

    var dataMsg = '';

    if (Object.keys(objModify).length) {
        try {
            const data = JSON.parse(fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' }));

            const embedModify = new MessageEmbed() // Modify
                .setColor('#ff9d00').setTitle('Utilisateur Modifié').setTimestamp().setFooter({ text: user});

            dataMsg = "```DIFF\n"
             +"  ｜"+ ('Fisrtname').padEnd(20)   +"｜"+ ("Pseudo").padEnd(20)
             +"｜"+ ('Lastname').padEnd(20)    +"｜"+ ("Groupe").padEnd(10)
             +"｜"+ ('Grade').padEnd(5)       +"｜"+ ("Permissions")   + ("｜\n");

            for (let i = 0; i < data.authList.length; i++) {
                if (data.authList[i].id == objModify.id) {

                    dataMsg +=
                    "+ ｜"+((String(objModify.firstname).length<20)?String(objModify.firstname).padEnd(20):String(objModify.firstname).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+((String(objModify.pseudo).length<20)?String(objModify.pseudo).padEnd(20):String(objModify.pseudo).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+((String(objModify.lastname).length<20)?String(objModify.lastname).padEnd(20):String(objModify.lastname).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+((String(objModify.group).length<10)?String(objModify.group).padEnd(10):String(objModify.group).substring(0, 8).padEnd(8).padEnd(10, '.'))
                    + "｜"+String(objModify.grade).padEnd(5)
                    + "｜"+String(objModify.permission).padEnd(11) + "｜\n"

                    + "- ｜"+((String(data.authList[i].firstname).length<20)?String(data.authList[i].firstname).padEnd(20):String(data.authList[i].firstname).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+((String(data.authList[i].pseudo).length<20)?String(data.authList[i].pseudo).padEnd(20):String(data.authList[i].pseudo).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+((String(data.authList[i].lastname).length<20)?String(data.authList[i].lastname).padEnd(20):String(data.authList[i].lastname).substring(0, 18).padEnd(18).padEnd(20, '.'))
                    + "｜"+((String(data.authList[i].group).length<10)?String(data.authList[i].group).padEnd(10):String(data.authList[i].group).substring(0, 8).padEnd(8).padEnd(10, '.'))
                    + "｜"+String(data.authList[i].grade).padEnd(5)
                    + "｜"+String(data.authList[i].permission).padEnd(11) + "｜\n"

                }
            }

            dataMsg += '```';

            // console.log(dataMsg);

            embedModify.setDescription(dataMsg);

            sended(embedModify);
        } catch (err) {
            console.log(err)
        }
    }
}

const toLogsDeleteProfile = async (idDelete, user) => {
    if (!idDelete) return;

    var dataMsg = "";

    try {
        const data = JSON.parse(fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' }));

        const embedModify = new MessageEmbed() // Modify
            .setColor('#ff9d00').setTitle('Utilisateur Supprimé').setTimestamp().setFooter({ text: user});

        dataMsg = "```DIFF\n"
            +"  ｜"+ ('Fisrtname').padEnd(20)   +"｜"+ ("Pseudo").padEnd(20)
            +"｜"+ ('Lastname').padEnd(20)    +"｜"+ ("Groupe").padEnd(10)
            +"｜"+ ('Grade').padEnd(5)       +"｜"+ ("Permissions")   + ("｜\n");
                
        dataMsg +=
            "- ｜"+((String(data.authList[idDelete].firstname).length<20)?String(data.authList[idDelete].firstname).padEnd(20):String(data.authList[idDelete].firstname).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(data.authList[idDelete].pseudo).length<20)?String(data.authList[idDelete].pseudo).padEnd(20):String(data.authList[idDelete].pseudo).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(data.authList[idDelete].lastname).length<20)?String(data.authList[idDelete].lastname).padEnd(20):String(data.authList[idDelete].lastname).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(data.authList[idDelete].group).length<10)?String(data.authList[idDelete].group).padEnd(10):String(data.authList[idDelete].group).substring(0, 8).padEnd(8).padEnd(10, '.'))
            + "｜"+String(data.authList[idDelete].grade).padEnd(5)
            + "｜"+String(data.authList[idDelete].permission).padEnd(11) + "｜\n"

        dataMsg += '```';

        console.log(dataMsg);

        embedModify.setDescription(dataMsg);

        sended(embedModify);
    } catch (err) {
        console.log(err)
    }
}

const toLogsAddProfile = async (objAdd, user) => {
    if (!objAdd) return;

    var dataMsg = "";

    const embedModify = new MessageEmbed() // Modify
        .setColor('#ff9d00').setTitle('Utilisateur Ajouté').setTimestamp().setFooter({ text: user});

    dataMsg = "```DIFF\n"
        +"  ｜"+ ('Fisrtname').padEnd(20) +"｜"+ ("Pseudo").padEnd(20)
        +"｜"+ ('Lastname').padEnd(20) +"｜"+ ("Groupe").padEnd(10) 
        +"｜"+ ('Grade').padEnd(5) +"｜"+ ("Permissions") + ("｜\n");
            
    dataMsg +=
        "+ ｜"+((String(objAdd.firstname).length<20)?String(objAdd.firstname).padEnd(20):String(objAdd.firstname).substring(0, 18).padEnd(18).padEnd(20, '.'))
        + "｜"+((String(objAdd.pseudo).length<20)?String(objAdd.pseudo).padEnd(20):String(objAdd.pseudo).substring(0, 18).padEnd(18).padEnd(20, '.'))
        + "｜"+((String(objAdd.lastname).length<20)?String(objAdd.lastname).padEnd(20):String(objAdd.lastname).substring(0, 18).padEnd(18).padEnd(20, '.'))
        + "｜"+((String(objAdd.group).length<10)?String(objAdd.group).padEnd(10):String(objAdd.group).substring(0, 8).padEnd(8).padEnd(10, '.'))
        + "｜"+String(objAdd.grade).padEnd(5)
        + "｜"+String(objAdd.permission).padEnd(11) + "｜\n"

    dataMsg += '```';

    console.log(dataMsg);

    embedModify.setDescription(dataMsg);

    sended(embedModify);
}

const toLogsEditProfile = async (objModify, user) => {
    if (!objModify) return;

    var dataMsg = "";

    try {
        const data = JSON.parse(fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' }));

        const embedModify = new MessageEmbed() // Modify
            .setColor('#ff9d00').setTitle('Utilisateur Modifié').setTimestamp().setFooter({ text: user});

        dataMsg = "```DIFF\n"
            +"  ｜"+ ('Fisrtname').padEnd(20) +"｜"+ ("Pseudo").padEnd(20)
            +"｜"+ ('Lastname').padEnd(20) +"｜"+ ("Groupe").padEnd(10)
            +"｜"+ ('Grade').padEnd(5) +"｜"+ ("Permissions") + ("｜\n");

        var id = objModify.id;

        dataMsg +=
            "+ ｜"+((String(objModify.firstname).length<20)?String(objModify.firstname).padEnd(20):String(objModify.firstname).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(objModify.pseudo).length<20)?String(objModify.pseudo).padEnd(20):String(objModify.pseudo).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(objModify.lastname).length<20)?String(objModify.lastname).padEnd(20):String(objModify.lastname).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(objModify.group).length<10)?String(objModify.group).padEnd(10):String(objModify.group).substring(0, 8).padEnd(8).padEnd(10, '.'))
            + "｜"+String(objModify.grade).padEnd(5)
            + "｜"+String(objModify.permission).padEnd(11) + "｜\n"

            + "- ｜"+((String(data.authList[id].firstname).length<20)?String(data.authList[id].firstname).padEnd(20):String(data.authList[id].firstname).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(data.authList[id].pseudo).length<20)?String(data.authList[id].pseudo).padEnd(20):String(data.authList[id].pseudo).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(data.authList[id].lastname).length<20)?String(data.authList[id].lastname).padEnd(20):String(data.authList[id].lastname).substring(0, 18).padEnd(18).padEnd(20, '.'))
            + "｜"+((String(data.authList[id].group).length<10)?String(data.authList[id].group).padEnd(10):String(data.authList[id].group).substring(0, 8).padEnd(8).padEnd(10, '.'))
            + "｜"+String(data.authList[id].grade).padEnd(5)
            + "｜"+String(data.authList[id].permission).padEnd(11) + "｜\n"

        dataMsg += '```';

        console.log(dataMsg);

        embedModify.setDescription(dataMsg);

        sended(embedModify);
    } catch (err) {
        console.log(err)
    }
}

const action = (name = false, arr = false) => {
    if (!name & !arr) return;


}

export {
    auth,
    authOut,
    toLogs,
    toLogsProfile,
    toLogsDeleteProfile,
    toLogsAddProfile,
    toLogsEditProfile
};