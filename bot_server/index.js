require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);

// OTP larni xotirada saqlash uchun
// { "+998901234567": "123456" }
const otpStore = new Map();

bot.start((ctx) => {
    ctx.reply('Assalomu alaykum! IT Live platformasida ro\'yxatdan o\'tish uchun telefon raqamingizni yuboring.', {
        reply_markup: {
            keyboard: [
                [{ text: "📞 Kontaktni yuborish", request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

bot.on('contact', (ctx) => {
    const contact = ctx.message.contact;
    let phone = contact.phone_number;
    
    // Raqamni + bilan boshlanadigan qilish
    if (!phone.startsWith('+')) {
        phone = '+' + phone;
    }

    // 6 xonali tasodifiy kod
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Xotiraga saqlash
    otpStore.set(phone, otp);

    // 5 daqiqadan keyin xotiradan o'chirish
    setTimeout(() => {
        if (otpStore.get(phone) === otp) {
            otpStore.delete(phone);
        }
    }, 5 * 60 * 1000);

    ctx.reply(`Sizning tasdiqlash kodingiz: <b>${otp}</b>\n\nKodni veb-saytga kiritib ro'yxatdan o'tishni yakunlang.`, {
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true }
    });
});

bot.launch().then(() => {
    console.log('Telegram Bot ishga tushdi!');
});

// To'g'ri to'xtash uchun
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


// Frontenddan keladigan OTP ni tekshiruvchi API
app.post('/api/verify-otp', (req, res) => {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
        return res.status(400).json({ success: false, message: "Telefon raqam yoki kod kiritilmagan!" });
    }

    const storedCode = otpStore.get(phone);

    if (!storedCode) {
        return res.status(400).json({ success: false, message: "Tasdiqlash kodi topilmadi yoki vaqti tugagan. Bot orqali qayta so'rang." });
    }

    if (storedCode === code) {
        // Kod to'g'ri bo'lsa, xotiradan o'chiramiz (qayta ishlatilmasligi uchun)
        otpStore.delete(phone);
        return res.json({ success: true, message: "Muvaffaqiyatli tasdiqlandi!" });
    } else {
        return res.status(400).json({ success: false, message: "Noto'g'ri kod kiritdingiz!" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API Server port: ${PORT}`);
});
