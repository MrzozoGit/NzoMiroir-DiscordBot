//---------------------
//------Prérequis------
//---------------------

//----Import des modules----
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const { url } = require('inspector');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');
const { executionAsyncResource } = require('async_hooks');
const cheerio = require('cheerio');
const request = require('request');

//Création d'une instance client Discord
const bot = new Discord.Client();

//Définition du prefixe des commandes
const prefix = 'z!';


//------------------------------------------
//-----Variables + constantes commandes-----
//------------------------------------------

var bot_name = 'Nzo miroir'; //Utile pour la commande : info nom
var version = '1.2'; //Utile pour la commande : info version
const usedCommandRecently = new Set(); //Utile pour les cooldown
var servers = {} //Utile pour la commande : play
const queue = new Map(); //Utile pour la commande : play2
const { Client, Attachement, MessageEmbed } = require('discord.js'); //Utile pour envoyer des messages privés
const bddQuote = require('./bddQuote.json'); //Utile pour la commande quote


//-----------------------
//------Actions bot------
//-----------------------

//Message de mise en ligne du bot
bot.on('ready', () => {
  console.log(bot_name + ' est online !');
  bot.user.setActivity("préparer l'apocalypse", { type: 'PLAYING' }).catch(console.error);
});

bot.on('reconnecting', () => {
  console.log("Reconnexion en cours !");
});

bot.on('disconnect', () => {
  console.log(bot_name + ' est offline !');
})

//Message de bienvenue
bot.on('guildMemberAdd', member => {
  member.send("Bienvenue !");

  const channel = member.guild.channels.cache.find(channel => channel.name === 'bot');
  if (!channel) return;

  channel.send(`Bienvenue sur notre serveur, ${member}, amuse toi bien !`);
});

//Event listener des commandes + définition des commandes
bot.on('message', message => {

  let args = message.content.slice(prefix.length).split(" ");

  switch (args[0]) {
    //---------------------------
    //---Commandes utilitaires---
    //---------------------------

    //Commande help ||A METTRE A JOUR||
    case 'help':
      embedHelp = new Discord.MessageEmbed()
        .setTitle("Liste des commandes disponibles")
        .addField("__Utilitaires__", "**z!help :** *Affiche la liste des commande.*\n**z!info [version, auteur, nom, maj-logs] :** *Permet d'obtenir des informations sur le bot.*\n**z!ping :** *Permet de jouer une trépidante partie de ping pong avec Nzo miroir.*\n**z!avatar :** *Affiche ton avatar.*\n**z!google [] :** *Permet de faire une recherche Google via Discord.*\n**z!profile :** *Affiche ton profil d'utilisateur.*\n**z!poll [] :** *Premet de proposer un sondage.*")
        .addField("__Vocal__", "**z!play [] :** *Permet de jouer une vidéo YouTube dans un salon vocal.*\n**z!skip :** *Permet de passer une musique.*\n**z!stop :** *Permet de retirer le bot du salon vocal.*\n**z!queue :** *Permet d'afficher la file d'attente.*")
        .addField("__Fun__", "**z!internet :** *Affiche l'hymne des internets.*\n**z!image [] :** *Affiche une image aléatoire de la recherche voulue.*\n**z!roll :** *Permet de réaliser un jet de dés 100.*\n**z!coinflip :** *Permet de tirer à pile ou face.*\n**z!love [] :** Permet de calculer la compatibilité entre deux personnes.\n**z!quote [mention de l'auteur]/[phrase à quote] :** *Permet de quote un message.*\n**z!randomquote :** *Affiche une quote aléatoire.*\n**z!quotesee [id de la quote] :** *Permet d'afficher une quote en particulier.*")
        .addField("__Modération__", "**z!quotedelete [id de la quote] :** *Permet de supprimer une quote.*\n**z!clear [] :** *Efface un certain nombre de messages.*\n**z!kick [] :** *Kick un utilisateur.*\n**z!ban [] :** *Ban un utilisateur.*")
        .setFooter("Version 1.1.3");
      message.reply(embedHelp);
      break;

    //Commande info
    case 'info':
      if (args[1] === 'version') {
        message.channel.send('version ' + version);
      } else if (args[1] === 'auteur') {
        message.channel.send('Enzo B.\nMrzozo / Platy');
      } else if (args[1] === 'nom') {
        message.channel.send(bot_name);
      } else if (args[1] === 'maj-logs') {
        const attachment = new Discord.MessageAttachment('E:/NzoMiroir/Bot/maj-logs.txt');
        message.channel.send(attachment);
      } else {
        message.reply('Erreur. Argument indisponible. Arguments disponibles pour la commande info :\nversion, auteur, nom, maj-logs.');
      }
      break;

    //Commande ping
    case 'ping':
      message.channel.send('pong');
      break;

    //Commande avatar
    case 'avatar':
      var avatar;
      var userAvatar;
      userAvatar = message.mentions.users.first();
      if (!userAvatar) {
        if (!args[1]) {
          userAvatar = message.author;
        } else {
          message.channel.send("Veuillez indiquer un utilisateur valide.");
          break;
        }
      }
      avatar = userAvatar.avatarURL();
      if (!avatar) {
        message.channel.send("Cet utilisateur n'a pas d'avatar.");
        break;
      }

      var embedAvatar = new Discord.MessageEmbed()
        .setColor(0xF0F8FF)
        .setImage(avatar);
      message.channel.send(embedAvatar);
      break;

    //Commande google
    case 'google':
      let google_args = message.content.split(' ');
      google_args.shift();
      message.channel.send('https://www.google.fr/#q=' + google_args.join('%20'));
      break;

    //Commande profile
    case 'profile':
      var userProfile;
      userProfile = message.mentions.users.first();
      if (!userProfile) {
        if (!args[1]) {
          userProfile = message.author;
        } else {
          message.channel.send("Veuillez indiquer un utilisateur valide.");
          break;
        }
      }

      const memberProfile = message.guild.member(userProfile);

      const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      const embed = new Discord.MessageEmbed()
        .setColor("0x" + memberProfile.displayHexColor)
        .setTitle('Profil de ' + memberProfile.nickname)
        .addField('Tag', userProfile.tag, true)
        .addField("ID d'utilisateur", userProfile.id, true)
        .addField('Rôles', memberProfile.roles.cache.array())
        .addField("Date d'arrivée", memberProfile.joinedAt.toLocaleDateString('en-US', dateOptions)) //Date en format US (trouver comment la mettre en fr)
        .setFooter('Sur le serveur ' + message.guild.name)
        .setTimestamp()
        .setThumbnail(userProfile.avatarURL());
      message.channel.send(embed);
      break;

    //Commande poll
    case 'poll':
      if (!args[1]) {
        message.channel.send('Vous devez indiquer le sondage à effectuer !');
        break;
      }

      let msgArgs = args.slice(1).join(" ");

      const embedPoll = new Discord.MessageEmbed()
        .setColor(0xF1C40F)
        .setTitle("**" + msgArgs + "**")
        .setDescription(`sondage proposé par ${message.author.username}`)
        .setThumbnail("https://images.emojiterra.com/google/android-10/512px/1f4cb.png");

      message.channel.send(embedPoll).then(messageReaction => {
        messageReaction.react("👍");
        messageReaction.react("👎");
        messageReaction.react("🤷");
        message.delete().catch(console.error);
      })
      break;

    case 'stats':
      let totalbots = message.guild.members.cache.filter(member => member.user.bot).size;
      let onlines = message.guild.members.cache.filter(({ presence }) => presence.status !== "offline").size - totalbots;
      let totalmembers = message.guild.members.cache.size - totalbots;
      let totalservers = bot.guilds.cache.size;
      let totalmousk = message.guild.roles.cache.get('694837698543878224').members.map(member => member.user.tag).length; //Commande très spécifique puisque ne fonctionne qu'avec un seul rôle et donc sur un seul serveur

      let embedStats = new Discord.MessageEmbed()
        .setTitle('Statistiques')
        .setDescription(`Statistiques du serveur ${message.guild.name}`)
        .addFields(
          { name: 'Total de membres sur le serveur', value: totalmembers, inline: true },
          { name: 'Total de membres onlines sur le serveur', value: onlines, inline: true },
          { name: 'Total de mousquetaires sur le serveur', value: totalmousk, inline: true },
          { name: 'Total de bots sur le serveur', value: totalbots, inline: true },
          { name: 'Total de serveurs sur lequel est le bot', value: totalservers, inline: true })
        .setFooter('🕑')
        .setTimestamp();
      message.channel.send(embedStats);
      break;


    //---------------------
    //---Commandes audio---
    //---------------------

    //Mettre un queue.get(message.guild.id) a chaque fois est pas du tout opti mais c'est la seule méthode que j'ai trouvé qui ne fait pas crash le bot.

    //Commande play V2
    case 'play':
      execute(message, queue.get(message.guild.id));
      break;

    //Commande skip
    case 'skip':
      skip(message, queue.get(message.guild.id));
      break;

    //Commande stop
    case 'stop':
      stop(message, queue.get(message.guild.id));
      break;

    //Commande queue
    case 'queue':
      if (!message.member.voice.channel)
        return message.channel.send("Vous devez être dans un salon vocal pour afficher la file d'attente !");
      if (!queue.get(message.guild.id))
        return message.channel.send("Il n'y a pas de musique dans la file d'attente !");
        
      embedQueue = new Discord.MessageEmbed().setTitle("File d'attente");
      for (let i = 0; i < Object.keys(queue.get(message.guild.id).songs).length; i++) {
        embedQueue.addField(`**${(i + 1)} -** *${queue.get(message.guild.id).songs[i].title}*`, `Proposée par ${queue.get(message.guild.id).songs[i].requester}`);
      }
      message.channel.send(embedQueue);
      break;

    //-------------------
    //---Commandes fun---
    //-------------------

    //Commande internet
    case 'internet':
      message.channel.send('https://www.youtube.com/watch?v=wXElM4u8tyg&');
      break;

    //Commande reda
    case 'reda':
      message.delete();
      const attachment = new Discord.MessageAttachment('https://media.discordapp.net/attachments/496381890371125248/700101791198478446/redouillefripouille.png');
      message.channel.send(attachment);
      break;

    //Commande image
    case 'image':
      image(message);
      break;

    //Commande roll
    case 'roll':
      let rollResult = Math.floor(Math.random() * 99 + 1);
      let rollCap;
      if (5 < rollResult && rollResult < 10) {
        rollCap = "Échec critique. Pas de chance...";
      } else if (2 < rollResult && rollResult <= 5) {
        rollCap = "Super échec critique ! Ça va faire mal.";
      } else if (rollResult === 2) {
        rollCap = "Mega échec critique ! Priez pour votre vie !";
      } else if (rollResult === 1) {
        rollCap = "Échec critique ultime ! J'ai jamais vu un score aussi bas !";
      } else if (90 < rollResult && rollResult < 95) {
        rollCap = "Réussite critique. Bien joué.";
      } else if (95 <= rollResult && rollResult < 98) {
        rollCap = "Super réussite critique ! Vous avez de la chance, profitez-en !";
      } else if (98 === rollResult) {
        rollCap = "Mega réussite critique ! J'ai jamais vu une chance pareille !";
      } else if (rollResult === 99) {
        rollCap = "Réussite critique ultime ! Le destin se plie à votre volonté...";
      } else {
        rollCap = "";
      }

      message.reply(`🎲 ${rollResult}\n${rollCap}`);
      break;

    //Commande coinflip
    case 'coinflip':
      let pfResult = Math.floor(Math.random() * 2 + 1);
      let pfCap;
      if (pfResult === 1) {
        pfCap = "Pile !";
      } else if (pfResult === 2) {
        pfCap = "Face !"
      }
      message.reply(pfCap);
      break;

    //Commande lovecalc
    case 'love':
      if (!args[2]) return message.reply('Erreur. Veuillez indiquer deux noms.');

      let lovecalcResult = Math.floor(Math.random() * 100 + 1);
      message.channel.send(`La compatibilité de ${args[1]} et ${args[2]} est de ${lovecalcResult}%.`)
      break;

    //Commande quote
    case 'quote':
      const argsQuote = message.content.split("/");
      argsQuote.shift();
      const userQuote = message.mentions.users.first();

      if (!args[0] || !userQuote) return message.reply("Erreur. Veuillez respecter la synthaxe suivante :\nz!quote [mention de l'auteur]/[phrase à quote]");

      bddQuote["total"] += 1;
      bddSave();
      bddQuote["quote"]["quoteContent"][bddQuote["total"]] = argsQuote[0];
      bddQuote["quote"]["quoteAuthor"][bddQuote["total"]] = userQuote;
      bddQuote["quote"]["quoteID"][bddQuote["total"]] = bddQuote["total"];
      bddSave();

      message.reply(`La quote a été ajoutée à la base de données ! Elle porte le numéro ${bddQuote["total"]}.`);
      break;

    //Commande quotesee
    case 'quotesee':
      if (!args[1]) return message.reply('Erreur. Veuillez entrer l\'ID de la quote à afficher.');

      quoteID = args[1];
      if (!bddQuote["quote"]["quoteID"].hasOwnProperty(quoteID)) return message.reply('Erreur. Il n\'existe pas de quote avec cet ID.')

      let embedSeeQuote = new Discord.MessageEmbed()
        .setTitle(`"${bddQuote["quote"]["quoteContent"][quoteID]}"`)
        .setDescription(`*~ ${bddQuote["quote"]["quoteAuthor"][quoteID]["username"]} ~*`)
        .setFooter(`quote n°${bddQuote["quote"]["quoteID"][quoteID]}`)
        .setColor(0xF1C40F);
      message.channel.send(embedSeeQuote);
      break;

    //Commande randomquote

    //Obsolète pour le moment car pas de moyen de trouver l'ID de la quote
    case 'randomquote':
      if (isEmpty(bddQuote["quote"]["quoteID"]) == true) return message.channel.send("Aucune quote n'a été créée pour le moment.");

      quoteArray = Object.values(bddQuote["quote"]["quoteID"]);
      quoteArrayLength = quoteArray.length;
      quoteArrayPos = Math.floor(Math.random() * (quoteArrayLength));
      quoteArrayID = quoteArray[quoteArrayPos];

      let randomEmbedQuote = new Discord.MessageEmbed()
        .setTitle(`"${bddQuote["quote"]["quoteContent"][quoteArrayID]}"`)
        .setDescription(`*~ ${bddQuote["quote"]["quoteAuthor"][quoteArrayID]["username"]} ~*`)
        .setFooter(`quote n°${bddQuote["quote"]["quoteID"][quoteArrayID]}`);
      message.channel.send(randomEmbedQuote);
      break;
    
    case 'quotebook':
      if (isEmpty(bddQuote["quote"]["quoteID"]) == true) return message.channel.send("Aucune quote n'a été créée pour le moment.");

      quoteArray = Object.values(bddQuote["quote"]["quoteID"]);
      quoteArrayLength = quoteArray.length;
      let embedQuoteBook = new Discord.MessageEmbed().setTitle("Quote Book");

      for(i=0; i<quoteArrayLength; i++){
        quoteArrayID = quoteArray[i];
        embedQuoteBook.addField(`n°${bddQuote["quote"]["quoteID"][quoteArrayID]} : "${bddQuote["quote"]["quoteContent"][quoteArrayID]}"`, `*~ ${bddQuote["quote"]["quoteAuthor"][quoteArrayID]["username"]} ~*`)}

      message.channel.send(embedQuoteBook);
      break;

    //----------------------------
    //----Commandes moderation----
    //----------------------------

    //Commande deletequote
    case 'quotedelete':
      if (!message.member.roles.cache.find(r => r.name === "Mousquetaire")) return message.channel.send("Vous ne pouvez pas utiliser cette commande.");

      if (!args[1]) return message.reply('Erreur. Veuillez entrer l\'ID de la quote à effacer.');

      deletequoteID = args[1];
      if (!bddQuote["quote"]["quoteID"].hasOwnProperty(deletequoteID)) return message.reply('Erreur. Il n\'existe pas de quote avec cet ID.')

      delete bddQuote["quote"]["quoteContent"][deletequoteID];
      delete bddQuote["quote"]["quoteAuthor"][deletequoteID];
      delete bddQuote["quote"]["quoteID"][deletequoteID];
      bddSave();
      message.reply(`La quote n°${deletequoteID} a été supprimée avec succés.`)
      break;

    //Commande clear
    case 'clear':
      if (!message.member.roles.cache.find(r => r.name === "Mousquetaire")) return message.channel.send("Vous ne pouvez pas utiliser cette commande.");

      if (!args[1]) return message.reply('Erreur. Veuillez entrer le nombre de messages à effacer.');
      //message.reply('Supprimer '+args[1]+'messages ? (o/n)')
      let nbr = parseInt(args[1]) + 1;
      message.channel.bulkDelete(nbr);
      break;

    //Commmande kick
    case 'kick':
      if (!message.member.roles.cache.find(r => r.name === "Mousquetaire")) return message.channel.send("Vous ne pouvez pas utiliser cette commande.");

      const user = message.mentions.users.first();

      if (user) {
        const member = message.guild.member(user);

        if (member) {
          let kickGif;
          if (message.author.id === "232151262026661892") { //Pour Mrzozo
            kickGif = 'https://i1.wp.com/geekandgear.com/wp-content/uploads/2019/01/pikuniku-review-tasty-morsel.gif?fit=1280%2C720&ssl=1';
          } else if (message.author.id === "224431746236678144") { //Pour Sukai
            kickGif = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/8d8aa80d-a00f-4ca5-817d-30fbc6bf33be/da1h17g-897f85b2-9b7e-4187-a443-7b852d58d3cb.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvOGQ4YWE4MGQtYTAwZi00Y2E1LTgxN2QtMzBmYmM2YmYzM2JlXC9kYTFoMTdnLTg5N2Y4NWIyLTliN2UtNDE4Ny1hNDQzLTdiODUyZDU4ZDNjYi5naWYifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.J0e5zJsmrf7t2-4_yWlN3R0RAFBDwj0QeiAB_F393wM';
          } else {
            kickGif = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/fad1bd75-b8bf-41a5-890b-64ace9a519d3/d4t7jfc-d97391ec-6067-4b40-86c5-aebd3d53e1ed.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvZmFkMWJkNzUtYjhiZi00MWE1LTg5MGItNjRhY2U5YTUxOWQzXC9kNHQ3amZjLWQ5NzM5MWVjLTYwNjctNGI0MC04NmM1LWFlYmQzZDUzZTFlZC5naWYifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.tKq8y_cF61lYVr20h_8HzHCAp5-uCa0_AjkJcIzNQX0';
          }

          let kick_reason = message.content.split('/');
          kick_reason.shift();
          if (!kick_reason[0]) {
            kick_reason = 'raison non spécifiée'
          }

          const embed = new Discord.MessageEmbed()
            .setTitle(`${user.username} a été kick !`)
            .setImage(kickGif)
            .setDescription(`**${user.username}** a été kick du serveur **${message.guild.name}** par **${message.author}** pour la raison suivante : **${kick_reason}**`)
            .setColor(0xF1C40F)
            .setThumbnail(user.avatarURL())
            .setTimestamp();

          member.kick({ reason: kick_reason }).then(() => {
            message.channel.send(embed);
            //[BUG] Ne fonctionne pas sur l'utilisateur test mais fonctionne sur moi (?)
            //member.send(`Vous avez été kick du serveur **${message.guild.name}** pour la raison suivante : **${kick_reason}**`);

          }).catch(err => {
            message.reply("Erreur. La commande n'a pas pu être effectuée.");
            console.log(err);
          });
        } else {
          message.channel.send("Cet utilisateur n'est pas présent sur ce serveur.")
        }
      } else {
        message.channel.send("Vous devez indiquer un utilisateur valide.");
      }
      break;

    //Commande ban
    case 'ban':
      if (!message.member.roles.cache.find(r => r.name === "Bot manager")) return message.channel.send("Vous ne pouvez pas utiliser cette commande.");

      const user2 = message.mentions.users.first();

      if (user2) {
        const member = message.guild.member(user2);

        if (member) {
          let banGif;
          if (message.author.id === "232151262026661892") { //Pour Mrzozo
            banGif = 'https://media1.tenor.com/images/d38e8207554c6e93d644173b6f2f56ba/tenor.gif?itemid=16290869';
          } else if (message.author.id === "224431746236678144") { //Pour Sukai
            banGif = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/8d8aa80d-a00f-4ca5-817d-30fbc6bf33be/da1h17g-897f85b2-9b7e-4187-a443-7b852d58d3cb.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvOGQ4YWE4MGQtYTAwZi00Y2E1LTgxN2QtMzBmYmM2YmYzM2JlXC9kYTFoMTdnLTg5N2Y4NWIyLTliN2UtNDE4Ny1hNDQzLTdiODUyZDU4ZDNjYi5naWYifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.J0e5zJsmrf7t2-4_yWlN3R0RAFBDwj0QeiAB_F393wM';
          } else {
            banGif = 'https://media.giphy.com/media/jxqOV4sZ8eM5o4W16H/giphy.gif';
          }

          let ban_reason = message.content.split('/');
          ban_reason.shift();
          if (!ban_reason[0]) {
            ban_reason = 'raison non spécifiée'
          }

          const embed = new Discord.MessageEmbed()
            .setTitle(`${user2.username} a été ban !`)
            .setDescription(`**${user2.username}** a été ban du serveur **${message.guild.name}** par **${message.author}** pour la raison suivante : **${ban_reason}**`)
            .setImage(banGif)
            .setColor(0xF1C40F)
            .setThumbnail(user2.avatarURL())
            .setTimestamp();

          member.ban({ reason: ban_reason }).then(() => {
            message.channel.send(embed)
          }).catch(err => {
            message.reply("Erreur. La commande n'a pas pu être effectuée.");
            console.log(err);
          });
        } else {
          message.channel.send("Cet utilisateur n'est pas présent sur ce serveur.")
        }
      } else {
        message.channel.send("Vous devez indiquer un utilisateur valide.");
      }
      break;


    //------------------------
    //-----Commandes test-----
    //------------------------

    //Commande de test pour les permissions
    case 'test':
      if (!message.member.roles.cache.find(r => r.name === "Bot manager")) return message.channel.send("Vous ne pouvez pas utiliser cette commande.");
      //.then(message => message.delete({ timeout: 6000 }));
      message.reply("T'es le boss ^^");
      break;

    case 'cooldown':
      if (usedCommandRecently.has(message.author.id)) {
        message.reply("Vous ne pouvez pas utiliser cette commande pour le moment.");
      } else {
        message.reply('La commande !');

        usedCommandRecently.add(message.author.id);
        setTimeout(() => {
          usedCommandRecently.delete(message.author.id);
        }, 10000)
      }
      break;

    case 'react':
      message.react('😔');
      break;
  }
})


//-------------------------------
//------Fonctions commandes------
//-------------------------------

//Fonction execute utile pour la commande : play
async function execute(message, serverQueue) {
  const args = message.content.split(" ");
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send("Vous devez être dans un salon audio pour jouer de la musique !");
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT" || !permissions.has("SPEAK")))
    return message.channel.send("Je n'ai pas les permissions pour rejoindre ce salon vocal !");

  //Permet de detecter si l'url est valide
  try {
    const songInfo = await ytdl.getInfo(args[1]);
  } catch (err) {
    return message.channel.send("Veuillez fournir un url valide. Erreur : \"" + err + "\"")
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    requester: message.author
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} a été ajouté à la file d'attente !`);
  }
}

//Fonction play utile pour la commande : play
function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("erreur", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  embedCurrentMusic = new Discord.MessageEmbed().setTitle(song.title).setDescription(`Proposée par **${song.requester}**`).setURL(song.url);
  serverQueue.textChannel.send(embedCurrentMusic);
}

//Fonction skip utile pour la commande : skip
function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("Vous devez être dans un salon vocal pour passer une musique !");
  if (!serverQueue)
    return message.channel.send("Il n'y a pas de musique à passer !");
  serverQueue.connection.dispatcher.end();
}

//Fonction stop utile pour la commande : stop
function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("Vous devez être dans un salon vocal pour stopper la musique !");
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

//Fonction image utile pour la commande : image
function image(message) {
  const args = message.content.split(" ");
  args.shift();

  var options = {
    url: "http://results.dogpile.com/serp?qc=images&q=" + args.join(' '),
    methos: "GET",
    headers: {
      "Accept": "text/html",
      "User-Agent": "Chrome"
    }
  };

  request(options, function (error, response, responseBody) {
    if (error) {
      return;
    }
    $ = cheerio.load(responseBody);
    var links = $(".image a.link");
    var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
    console.log(urls);
    if (!urls.length) {
      return;
    }
    message.channel.send(urls[Math.floor(Math.random() * urls.length)]);
  })
}

//Fonction bddSave utile pour la commande : quote
function bddSave() {
  fs.writeFile("./bddQuote.json", JSON.stringify(bddQuote, null, 4), (err) => {
    if (err) message.channel.send("Une erreur est survenue lors de la sauvegarde dans la base de données.");
  });
}

//Fonction isEmpty utile pour les commandes quote
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}


//Mise en ligne du client bot
bot.login(process.env.token);
