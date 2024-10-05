import { Bot } from "grammy";
import { TOKEN } from "./constans/Constants.js";
import 'dotenv/config'
import { connect } from "./database.js";

const bot = new Bot(TOKEN);
const {collection} = await connect();

function getLuckValue(): number {
    const values = [-2, -1, 0, 1, 2];
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
}

const luckMessages: { [key: string]: string } = {
    "-2": "luck has abandoned you today, fool! Try again tomorrow.",
    "-1": "luck is not in your favor, weakling. But don't lose hope—tomorrow might show mercy.",
    "0": "a mundane day, neither cursed nor blessed. Tread carefully, simpleton.",
    "1": "ah, a bit of luck smiles upon you. Don’t waste it with your usual foolishness.",
    "2": "a rare stroke of fortune! Savor it, for it may never grace you again.",
}

bot.command("start", (ctx) => ctx.reply("Welcome skinny human! I'm Chapus The Fortune-Teller. You may ask me kindly to foresee your fortune for the day"));
bot.chatType(["supergroup", "private"]).command("foreseePlease", async (ctx) => {
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
        await ctx.replyWithVideo(luckValue, {
            caption: `My magic orb spoke! ${ctx.from.first_name}, ${luckMessages[luck]}`,
          });
        await collection.insertOne({
            id: ctx.from.id,
            luck: luck,
            createdAt: today,
        });
    }
  });
  bot.command("foresee", async (ctx) => {
    ctx.reply(`I said KINDLY human! If you will not respect me I will curse you stupid human...`)
  });

bot.start();