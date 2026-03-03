const express = require("express");
const cron = require("node-cron");
const twilio = require("twilio");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const YOUR_WHATSAPP = "whatsapp:+917990671943";
const TWILIO_NUMBER = "whatsapp:+14155238886";

let lastReminder = null;
let completionStats = {};

// ===== FULL 12 ITEM SCHEDULE =====

const schedule = [
  { name: "Granflu-400", cron: "30 7 * * 3,0", period: "🌅 Morning" },
  { name: "Dess-DT Tablet", cron: "0 13 * * *", period: "🌞 Afternoon" },
  { name: "Tugain Scrub", cron: "15 8 * * 1,3,5", period: "🌅 Morning" },
  { name: "Luliday Shampoo", cron: "30 8 * * 1,3,5", period: "🌅 Morning" },
  { name: "Fungigran Lotion", cron: "0 22 * * 1,3,5", period: "🌙 Night" },
  { name: "Sculpro Lotion", cron: "0 22 * * 2,4,6", period: "🌙 Night" },
  { name: "Clearzit Facewash (Morning)", cron: "0 8 * * *", period: "🌅 Morning" },
  { name: "Cerasoft Moisturizer", cron: "10 8 * * *", period: "🌅 Morning" },
  { name: "Raywin Sunscreen", cron: "45 9 * * *", period: "🌅 Morning" },
  { name: "Clearzit Facewash (Night)", cron: "0 21 * * *", period: "🌙 Night" },
  { name: "Nadifret Cream", cron: "0 22 * * 0,2,4,6", period: "🌙 Night" },
  { name: "Sebonia Serum", cron: "0 22 * * 1,3,5", period: "🌙 Night" },
];

// ===== AUTOMATIC REMINDERS =====

schedule.forEach((item) => {
  cron.schedule(item.cron, async () => {
    lastReminder = item.name;

    await client.messages.create({
      from: TWILIO_NUMBER,
      to: YOUR_WHATSAPP,
      body:
`━━━━━━━━━━━━━━━━━━
⏰ *MEDICINE REMINDER*

📌 ${item.name}

Reply:
✅ DONE  – after completing
❌ MISSED – if skipped
━━━━━━━━━━━━━━━━━━`
    });

    console.log("Reminder sent:", item.name);
  }, { timezone: "Asia/Kolkata" });
});

// ===== DAILY 7AM SUMMARY =====

cron.schedule("0 7 * * *", async () => {
  const today = new Date().getDay();
  let message = `━━━━━━━━━━━━━━━━━━
📅 *TODAY'S ROUTINE*
━━━━━━━━━━━━━━━━━━\n\n`;

  const grouped = {};

  schedule.forEach(item => {
    const dayPart = item.cron.split(" ")[4];
    if (dayPart === "*" || dayPart.includes(today)) {
      if (!grouped[item.period]) grouped[item.period] = [];
      grouped[item.period].push(item.name);
    }
  });

  Object.keys(grouped).forEach(period => {
    message += `${period}\n`;
    grouped[period].forEach((name, index) => {
      message += `  ${index + 1}. ${name}\n`;
    });
    message += "\n";
  });

  message += "Type *DONE* after each reminder.";

  await client.messages.create({
    from: TWILIO_NUMBER,
    to: YOUR_WHATSAPP,
    body: message
  });

}, { timezone: "Asia/Kolkata" });

// ===== WEEKLY REPORT =====

cron.schedule("0 20 * * 0", async () => {
  let report = `━━━━━━━━━━━━━━━━━━
📊 *WEEKLY REPORT*
━━━━━━━━━━━━━━━━━━\n\n`;

  if (Object.keys(completionStats).length === 0) {
    report += "No completions recorded this week.";
  } else {
    Object.keys(completionStats).forEach((key, index) => {
      report += `${index + 1}. ${key} → ${completionStats[key]} times\n`;
    });
  }

  completionStats = {};

  await client.messages.create({
    from: TWILIO_NUMBER,
    to: YOUR_WHATSAPP,
    body: report
  });

}, { timezone: "Asia/Kolkata" });

// ===== WHATSAPP BOT =====

app.post("/whatsapp", async (req, res) => {
  const incoming = req.body.Body?.toLowerCase().trim();

  if (incoming === "today routine") {
    const today = new Date().getDay();
    let routine = `━━━━━━━━━━━━━━━━━━
📅 *TODAY'S ROUTINE*
━━━━━━━━━━━━━━━━━━\n\n`;

    schedule.forEach((item, index) => {
      const dayPart = item.cron.split(" ")[4];
      if (dayPart === "*" || dayPart.includes(today)) {
        routine += `${index + 1}. ${item.name}\n`;
      }
    });

    await client.messages.create({
      from: TWILIO_NUMBER,
      to: YOUR_WHATSAPP,
      body: routine
    });
  }

  else if (incoming === "done") {
    if (lastReminder) {
      completionStats[lastReminder] =
        (completionStats[lastReminder] || 0) + 1;

      await client.messages.create({
        from: TWILIO_NUMBER,
        to: YOUR_WHATSAPP,
        body: `✅ Completed: *${lastReminder}*\nKeep going! 💪`
      });
    }
  }

  else if (incoming === "missed") {
    await client.messages.create({
      from: TWILIO_NUMBER,
      to: YOUR_WHATSAPP,
      body:
`❌ MISSED DOSE

Take it as soon as possible unless doctor advised otherwise.

Stay consistent 💊`
    });
  }

  else {
    await client.messages.create({
      from: TWILIO_NUMBER,
      to: YOUR_WHATSAPP,
      body:
`🤖 *Health Assistant Menu*

Please type:

1️⃣ today routine  
2️⃣ done  
3️⃣ missed`
    });
  }

  res.sendStatus(200);
});

// ===== KEEP ALIVE =====

app.get("/", (req, res) => {
  console.log("Ping received at", new Date().toLocaleString());
  res.send("Medicine Reminder Running ✅");
});

app.listen(3000, () => console.log("Server started"));