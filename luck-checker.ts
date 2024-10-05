import { Bot } from "grammy";
import { TOKEN } from "./constans/Constants.js";
import 'dotenv/config'
import { connect } from "./database.js";
import { randomInt } from "crypto";

const bot = new Bot(TOKEN);
const {collection} = await connect();

function getLuckValue(): number {
    return randomInt(-2, 2)
}

const luckMessages: { [key: string]: string[] } = {
    "-2": [
      "Hmph! Your luck has plummeted twice, just like my old broom falling apart. Couldn't ask for worse.",
      "Oh, splendid. Twice the bad luck. Just what I needed to deal with today.",
      "Twice the misfortune? How utterly delightful. Not that I care."
    ],
    "-1": [
      "Ugh, your luck took a tiny dive, as flat as my ancient hat. Wonderful.",
      "A slight stumble in luck, just like my creaky old chair. Perfect.",
      "Your luck slipped a bit, much like my patience. Fantastic."
    ],
    "0": [
      "Nothing changes. Your luck is as flat as my old broom. How exciting.",
      "No luck today. Just like my weary bones. Thrilling, isn't it?",
      "Luck remains dull, as dull as my morning grump. Lovely."
    ],
    "+1": [
      "A small boost in luck, don’t get too excited. It’s as rare as a quiet day.",
      "Your luck improved a little, like a slight breeze on my old staff. Happy now?",
      "A minor lucky break, not that I care. Don’t thank me."
    ],
    "+2": [
      "Twice the luck? Enjoy it while it lasts, you lucky fool. Not that I care.",
      "Your luck has doubled, shining brighter than my ancient lantern. Don't expect it to stay.",
      "Double fortune, eh? Like finding an extra stone in my old pouch. Don't get too happy."
    ]
  }
  

bot.command("hello", (ctx) => ctx.reply("Welcome skinny human! I'm Chapus The Fortune-Teller. You may ask me kindly to foresee your fortune for the day"));
bot.chatType(["supergroup", "private"]).command("foresee_please", async (ctx) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    const todayLuck = await collection.findOne({
        id: ctx.from.id,
        createdAt: today,
    })
    if (todayLuck) {
        ctx.reply(`You already asked me today, human!`);
    } else {
        const luck = getLuckValue();
        await ctx.reply(`Tssss human, let my magic orb analyze your day...`)
        const luckValue = process.env[luck];
        if (!luckValue) {
          throw new Error(`No video found for luck value ${luck}`);
        }
        const message = luckMessages[luck][randomInt(0, (luckMessages[luck].length - 1))]
        await ctx.replyWithVideo(luckValue, {
            caption: `<a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>, my magic orb spoke! ${message}`,
            parse_mode: "HTML"
          });
        await collection.insertOne({
            id: ctx.from.id,
            luck: luck,
            createdAt: today,
        });
    }
  });
  bot.chatType(["supergroup", "private"]).command("foresee", async (ctx) => {
    ctx.reply(`I said kindy <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>! If you will not respect me I will curse you stupid thing...`, {parse_mode: "HTML"})
  });

bot.start();