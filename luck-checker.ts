import { Bot } from "grammy";
import { TOKEN } from "./constans/Constants";
import 'dotenv/config'

const bot = new Bot(TOKEN);

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

bot.command("start", (ctx) => ctx.reply("Welcome skinny human! I'm Chapus The Fortune-teller. You may ask me kindly to foresee your fortune for the day"));
bot.command("foreseePlease", async (ctx) => {
    const luck = getLuckValue();
    await ctx.reply(`Tssss human, let my magic orb analyze your day...`)
    const luckValue = process.env[luck];
    if (!luckValue) {
      throw new Error(`No video found for luck value ${luck}`);
    }
    const responce = await ctx.replyWithVideo(luckValue, {
        caption: `My magic orb spoke! ${ctx.from?.first_name}, ${luckMessages[luck]}`,
      });
  });
  bot.command("foresee", async (ctx) => {
    ctx.reply(`I said KINDLY human! If you will not respect me I will curse you stupid human...`)
  });

bot.start();