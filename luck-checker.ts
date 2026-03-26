import { Bot, InputFile } from "grammy";
import "dotenv/config";
import { randomInt } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { connect } from "./database.js";

const token = process.env.TOKEN;
if (!token) {
	console.error("No token provided. Set the environment variable 'TOKEN'");
	process.exit(1);
}
const bot = new Bot(token);
const { collection } = await connect();

function getLuckValue(): number {
	return randomInt(-2, 3);
}

function getVideoEnvKey(luck: number): string {
	return luck < 0 ? `VIDEO_NEG${Math.abs(luck)}` : `VIDEO_${luck}`;
}

const luckMessages: { [key: string]: string[] } = {
	"-2": [
		"Hmph! Your luck has plummeted twice, just like my old broom falling apart. Couldn't ask for worse.",
		"Oh, splendid. Twice the bad luck. Just what I needed to deal with today.",
		"Twice the misfortune? How utterly delightful. Not that I care.",
	],
	"-1": [
		"Ugh, your luck took a tiny dive, as flat as my ancient hat. Wonderful.",
		"A slight stumble in luck, just like my creaky old chair. Perfect.",
		"Your luck slipped a bit, much like my patience. Fantastic.",
	],
	"0": [
		"Nothing changes. Your luck is as flat as my old broom. How exciting.",
		"No luck today. Just like my weary bones. Thrilling, isn't it?",
		"Luck remains dull, as dull as my morning grump. Lovely.",
	],
	"1": [
		"A small boost in luck, don’t get too excited. It’s as rare as a quiet day.",
		"Your luck improved a little, like a slight breeze on my old staff. Happy now?",
		"A minor lucky break, not that I care. Don’t thank me.",
	],
	"2": [
		"Twice the luck? Enjoy it while it lasts, you lucky fool. Not that I care.",
		"Your luck has doubled, shining brighter than my ancient lantern. Don't expect it to stay.",
		"Double fortune, eh? Like finding an extra stone in my old pouch. Don't get too happy.",
	],
};

bot.command("hello", (ctx) =>
	ctx.reply(
		"Welcome skinny human! I'm Chapus The Fortune-Teller. You may ask me kindly to foresee your fortune for the day",
	),
);
bot.command("videos", async (ctx) => {
	const uploaded: string[] = [];

	for (let i = 2; i >= -2; i -= 1) {
		const key = getVideoEnvKey(i);
		const envPath = process.env[key] as string;
		const sent = await ctx.replyWithVideo(new InputFile(envPath));
		uploaded.push(`${key}=<code>${sent.video?.file_id as string}</code>`);
	}

	await ctx.reply(uploaded.join("\n"), { parse_mode: "HTML" });
});

bot
	.chatType(["supergroup", "private"])
	.command("foresee_please", async (ctx) => {
		const today = new Date(new Date().setHours(0, 0, 0, 0));
		const todayLuck = await collection.findOne({
			id: ctx.from.id,
			createdAt: today,
		});
		if (todayLuck) {
			ctx.reply(`You already asked me today, human!`);
		} else {
			const luck = getLuckValue();
			await ctx.reply(`Tssss human, let my magic orb analyze your day...`);
			await setTimeout(1_500);
			const videoFileId = process.env[getVideoEnvKey(luck)];
			if (!videoFileId) {
				throw new Error(
					`No video found for luck value ${luck}. Set ${getVideoEnvKey(luck)}.`,
				);
			}
			const message =
				luckMessages[luck][randomInt(0, luckMessages[luck].length)];
			await ctx.replyWithVideo(videoFileId, {
				caption: `<a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>, my magic orb spoke! ${message}`,
				parse_mode: "HTML",
			});
			await collection.insertOne({
				id: ctx.from.id,
				luck: luck,
				createdAt: today,
			});
		}
	});
bot.chatType(["supergroup", "private"]).command("foresee", async (ctx) => {
	ctx.reply(
		`I said kindy <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>! If you will not respect me I will curse you stupid thing...`,
		{ parse_mode: "HTML" },
	);
});

bot.start();
