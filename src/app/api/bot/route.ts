// File: app/api/bot/route.ts
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { Bot, Context, session, SessionFlavor, webhookCallback } from "grammy";
import { Menu } from "@grammyjs/menu";

// Define session interface
interface SessionData {
  stage: 'welcome' | 'features' | 'demo' | 'complete';
  name?: string;
}
type MyContext = Context & SessionFlavor<SessionData>;

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.');

// Initialize bot with session support
const bot = new Bot<MyContext>(token);

// Configure session middleware
function initial(): SessionData {
  return { stage: 'welcome' };
}

bot.use(session({ initial }));

// Create welcome menu
const mainMenu = new Menu<MyContext>("main-menu")
  .text("🎯 Key Features", async (ctx) => {
    ctx.session.stage = 'features';
    await showFeatures(ctx);
  })
  .text("🎮 Try Demo", async (ctx) => {
    ctx.session.stage = 'demo';
    await launchMiniApp(ctx);
  })
  .text("💡 Get Started", async (ctx) => {
    await startOnboarding(ctx);
  });

bot.use(mainMenu);

// Welcome message handler
bot.command("start", async (ctx) => {
  const userName = ctx.from?.first_name || "there";
  await ctx.reply(
    `👋 Hello ${userName}!\n\nWelcome to Hokela 360 Pro - Manage field sales effortlessly with tools for surveys, merchandising, and engaging in-app games!\n\n` +
    `Our mini app helps you:\n` +
    `📍 Track your sales team in real-time\n` +
    `📊 Monitor performance metrics\n` +
    `📝 Manage sales reports,surveys and merchandise\n` +
    `🎯 Set and track targets\n\n` +
    `How would you like to proceed?`,
    { reply_markup: mainMenu }
  );
});
bot.command("features", async (ctx) => {
  await showFeatures(ctx);
});

// Feature showcase function
async function showFeatures(ctx: MyContext) {
  const miniAppUrl = process.env.MINI_APP_URL;

  // Check if the URL is present
  if (!miniAppUrl) {
    await ctx.reply("Error: Mini App URL is not set. Please configure the URL in the environment variables.");
    return;
  }

  // Log the URL for debugging
  console.log("Mini App URL:", miniAppUrl);

  await ctx.reply(
    "🚀 Key Features of Hokela 360 Pro:\n\n" +
    "1️⃣ Real-time Location Tracking\n" +
    "   - Monitor team movements\n" +
    "   - Optimize route planning\n\n" +
    "2️⃣ Performance Analytics\n" +
    "   - Sales metrics dashboard\n" +
    "   - Team performance reports\n\n" +
    "3️⃣ Task Management\n" +
    "   - Assign tasks and territories\n" +
    "   - Track completion status\n\n" +
    "4️⃣ Customer Management\n" +
    "   - Client database\n" +
    "   - Visit history tracking\n\n" +
    "Ready to explore the mini app?",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Launch Mini App", web_app: { url: miniAppUrl } }
          ]
        ]
      }
    }
  );
}


// Launch mini app function
async function launchMiniApp(ctx: MyContext) {
  await ctx.reply(
    "🎮 Experience Hokela 360 Pro firsthand!\n\n" +
    "Our demo environment is loaded with sample data to help you explore all features.",
    {
      reply_markup: {
        inline_keyboard: [[
          { text: "Open Mini App", web_app: { url: process.env.MINI_APP_URL || "YOUR_MINI_APP_URL" } }
        ]]
      }
    }
  );
}

// Onboarding function
async function startOnboarding(ctx: MyContext) {
  await ctx.reply(
    "🎯 Great choice! Let's get you started with Hokela 360 Pro.\n\n" +
    "1. Click the 'Open Mini App' button below\n" +
    "2. Create your team profile\n" +
    "3. Add team members\n" +
    "4. Start managing your field sales team!\n\n" +
    "Need help? Type /help anytime.",
    {
      reply_markup: {
        inline_keyboard: [[
          { text: "Open Mini App", web_app: { url: process.env.MINI_APP_URL || "YOUR_MINI_APP_URL" } }
        ]]
      }
    }
  );
}

// Help command
bot.command("help", async (ctx) => {
  await ctx.reply(
    "🆘 Need assistance? Here's how to get help:\n\n" +
    "📚 Documentation: https://hokela.co.ke/\n" +
    "📧 Support Email: support@hokela.co.ke\n" +
    "💬 Live Chat: Available in the mini app\n\n" +
    "Common commands:\n" +
    "/start - Restart the bot\n" +
    "/features - View all features\n" +
    "/help - Show this message"
  );
});

// Fallback handler for unhandled text messages
bot.on('message:text', async (ctx) => {
  await ctx.reply(
    "I didn't understand that command. Here are some things you can try:\n\n" +
    "/start - Start over\n" +
    "/features - View features\n" +
    "/help - Get assistance"
  );
});

// Export the POST handler for Next.js API route
export const POST = async (req: Request) => {
  try {
    console.log('Received POST request:', req);
    return webhookCallback(bot, 'std/http')(req);
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};