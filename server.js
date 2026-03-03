
const express = require("express");
const cron = require("node-cron");
const twilio = require("twilio");

const app = express();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const YOUR_WHATSAPP = "whatsapp:+917990671943";
const TWILIO_NUMBER = "whatsapp:+14155238886"; // Twilio Sandbox

// ===== YOUR DOCTOR SCHEDULE =====

// ===== UPDATED COMPLETE SCHEDULE (HAIR + FACE CARE) =====

// ===== COMPLETE UPDATED SCHEDULE (HAIR + FACE CARE) =====

// ===== COMPLETE UPDATED SCHEDULE (HAIR + FACE CARE) =====

// ===== COMPLETE UPDATED SCHEDULE WITH HOW TO USE =====

const schedule = [
  
  // ===== HAIR CARE =====
  { 
    name: "Dess-DT Tablet (After Lunch)", 
    cron: "20 14 * * *",
    instructions: "Take 1 tablet after lunch with water."
  },
  { 
    name: "Granflu-400 (Empty Stomach)", 
    cron: "30 7 * * 3,0",
    instructions: "Take 1 tablet with water on empty stomach. No food 30 mins before or after."
  },
  { 
    name: "Dess-DT Tablet (After Lunch)", 
    cron: "0 13 * * *",
    instructions: "Take 1 tablet after lunch with water."
  },

  { 
    name: "Tugain Pre-Scalp Scrub",
    cron: "15 8 * * 1,3,5",
    instructions: "Apply on dry scalp. Massage gently. Leave 10–15 mins. Then wash with shampoo."
  },
  
  { 
    name: "Luliday Shampoo",
    cron: "30 8 * * 1,3,5",
    instructions: "Apply on scalp. Leave for 5 minutes. Then rinse thoroughly."
  },

  { 
    name: "Fungigran Lotion",
    cron: "0 22 * * 1,3,5",
    instructions: "Apply gently on scalp at night. Do not rub hard. Leave overnight."
  },
  { 
    name: "Sculpro Lotion",
    cron: "0 22 * * 2,4,6",
    instructions: "Apply gently on scalp at night. Do not rub. Leave overnight."
  },

  // ===== FACE CARE =====
  { 
    name: "Clearzit Facewash (Morning)",
    cron: "0 8 * * *",
    instructions: "Wash face gently. Do not rub harshly."
  },
  { 
    name: "Cerasoft OC Moisturizer",
    cron: "10 8 * * *",
    instructions: "Apply small amount gently on face after washing."
  },
  { 
    name: "Raywin Sunscreen",
    cron: "45 9 * * *",
    instructions: "Apply 15 mins before sun exposure. Use sufficient quantity."
  },
  { 
    name: "Clearzit Facewash (Night)",
    cron: "0 21 * * *",
    instructions: "Wash face gently before night creams."
  },
  { 
    name: "Nadifret Cream",
    cron: "0 22 * * 0,2,4,6",
    instructions: "Apply thin layer at night. Avoid eye area."
  },
  { 
    name: "Sebonia Serum",
    cron: "0 22 * * 1,3,5",
    instructions: "Apply small amount at night. Do not mix with other cream immediately."
  }
];

schedule.forEach((item) => {
  cron.schedule(item.cron, async () => {
    try {
      await client.messages.create({
        from: TWILIO_NUMBER,
        to: YOUR_WHATSAPP,
        body: `⏰ Reminder: ${item.name}\n\nHow to use:\n${item.instructions}`,
      });
      console.log("Reminder sent:", item.name);
    } catch (err) {
      console.log(err);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Medicine Reminder Running ✅");
});

app.listen(3000, () => console.log("Server started"));

