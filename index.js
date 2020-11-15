const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
var Datastore = require("nedb");
let db;

client.once("ready", () => {
  db = new Datastore({ filename: "database/roles", autoload: true }); //NeDB

  //   db.insert(doc, function (err, newDoc) {
  //     // Callback is optional
  //     // newDoc is the newly inserted document, including its _id
  //     // newDoc has no key called notToBeSaved since its value was undefined
  //   });

  console.log("Ready!");
});

client.on("message", async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  console.log(args);
  if (command === "changeclass") {
    let guildId = message.guild.id;

    db.findOne({ guildId: guildId }, async (err, doc) => {
      console.log(doc);

      rolelist = "";
      doc.roles.forEach((role) => {
        rolelist += role.roleName + " " + role.roleEmote + "\n";
      });
      let membername =
        message.member.nickname || message.member.user.username;
      myMessage = await message.channel.send(
        "Wähle deine Klasse " + membername + ": \n" + rolelist
      );
      let emojis = [];
      doc.roles.forEach((role) => {
        myMessage.react(role.roleEmote);
        emojis.push(role.roleEmote);
      });
      const filter = (reaction, user) => {
        return (
          emojis.includes(reaction.emoji.name) && user.id === message.author.id
        );
      };

      myMessage
        .awaitReactions(filter, { max: 1, time: 60000, erros: ["time"] })
        .then((collected) => {
          const reaction = collected.first();
          doc.roles.forEach((role) => {
            message.guild.roles.fetch(role.roleId).then((roleObject) => {
              message.member.roles.remove(roleObject);
              if (reaction.emoji.name === role.roleEmote) {
                message.member.roles.add(roleObject);
                myMessage.edit(
                  "Deine Klass hat sich zu " +
                    roleObject.name +
                    " " +
                    role.roleEmote +
                    " geändert, Glückwunsch."
                );
              }
            });
          });
        });
    });
  } else if (command === "registerclass") {
    let roleId = args[0];
    let roleEmote = args[1];
    console.log(roleId, roleEmote);
    let guildId = message.guild.id;

    db.findOne({ guildId: guildId }, (err, doc) => {
      console.log(doc);
      if (doc == null) {
        let newDocument = {
          guildId: guildId,
          roles: [{ roleId: roleId, roleEmote: roleEmote }],
        };
        db.insert(newDocument);
      } else {
        // doc.roles.push({ roleId: roleId, roleEmote: roleEmote });
        // console.log(doc);

        message.guild.roles
          .fetch(roleId)
          .then((roleObject) => {
            db.update(
              { guildId: guildId },
              {
                $push: {
                  roles: {
                    roleId: roleId,
                    roleEmote: roleEmote,
                    roleName: roleObject.name,
                  },
                },
              },
              {},
              function (err, numReplaced) {
                message.channel.send(
                  "Klasse " + roleObject.name + " wurde hinzugefügt"
                );
              }
            );
          })
          .catch(() => {
            message.channel.send("Klasse wurde nicht gefunden.");
          });
      }
    });
  } else if (command === "removeclass") {
    let roleId = args[0];
    console.log(roleId);
    let guildId = message.guild.id;

    db.findOne({ guildId: guildId }, (err, doc) => {
      console.log(doc);
      if (doc == null) {
      } else {
        // doc.roles.push({ roleId: roleId, roleEmote: roleEmote });
        // console.log(doc);
        db.update(
          { guildId: guildId },
          { $pull: { roles: { roleId: roleId } } },
          {},
          function (err, numReplaced) {
            message.guild.roles
              .fetch(roleId)
              .then((roleObject) => {
                message.channel.send(
                  "Klasse " + roleObject.name + " wurde entfernt!"
                );
              })
              .catch(() => {
                "Klasse wurde entfernt!";
              });
          }
        );
      }
    });
  } else if (command === "listclass") {
    let guildId = message.guild.id;

    db.findOne({ guildId: guildId }, (err, doc) => {
      console.log(doc);
      if (doc == null) {
      } else {
        // doc.roles.push({ roleId: roleId, roleEmote: roleEmote });
        // console.log(doc);
        rolelist = "";
        doc.roles.forEach((role) => {
          rolelist += role.roleName + " " + role.roleEmote + "\n";
        });

        message.channel.send("Alle Klassen: \n" + rolelist);
      }
    });
  }
  // other commands...
});

client.login(config.token);
