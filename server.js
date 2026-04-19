const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const DISCORD_TOKEN    = process.env.DISCORD_TOKEN;
const CHANNEL_ID       = process.env.CHANNEL_ID;
const PORT             = process.env.PORT || 3000;
const DISPLAY_DURATION = parseInt(process.env.DISPLAY_DURATION || '7000');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// ── Qui est connecté : { socketId → streamName } ──
const connected = {};

io.on('connection', (socket) => {
  let myName = null;

  socket.on('register', (name) => {
    myName = name.toLowerCase().trim();
    connected[socket.id] = myName;
    console.log(`✅ Overlay connecté : ${myName}`);
    broadcastPresence();
  });

  socket.on('disconnect', () => {
    if (myName) {
      delete connected[socket.id];
      console.log(`❌ Overlay déconnecté : ${myName}`);
      broadcastPresence();
    }
  });
});

function broadcastPresence() {
  const names = Object.values(connected);
  io.emit('presence', names);
  console.log(`👥 Connectés : ${names.join(', ') || 'personne'}`);
}

// ── Discord bot ──
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.once('ready', () => {
  console.log(`🤖 Bot connecté : ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.channelId !== CHANNEL_ID) return;
  if (message.author.bot) return;

  const author    = message.author.username;
  const avatarUrl = message.author.displayAvatarURL({ size: 64, extension: 'png' });
  const content   = message.content.trim();

  // ── Détection des cibles !nom ──
  const targets = [];
  const targetRegex = /!(\w+)/g;
  let match;
  while ((match = targetRegex.exec(content)) !== null) {
    targets.push(match[1].toLowerCase());
  }
  const caption = content.replace(/!\w+/g, '').trim() || null;

  // ── Médias ──
  let media = null;

  if (message.attachments.size > 0) {
    const att = [...message.attachments.values()][0];
    media = { url: att.url, type: getMediaType(att.contentType || '', att.url) };
  } else {
    const urlMatch = content.match(/https?:\/\/\S+/);
    if (urlMatch) {
      const url  = urlMatch[0];
      const type = getMediaType('', url);
      if (type !== 'text') media = { url, type };
    }
  }

  const payload = { author, avatarUrl, caption, media, duration: DISPLAY_DURATION, targets };

  console.log(`📨 ${author} → [${targets.join(',') || 'tous'}] | ${media?.type || 'texte'}`);

  if (targets.length === 0) {
    io.emit('livechat', payload);
  } else {
    for (const [socketId, streamName] of Object.entries(connected)) {
      if (targets.includes(streamName)) {
        io.to(socketId).emit('livechat', payload);
      }
    }
  }
});

function getMediaType(contentType, url) {
  const ct  = contentType.toLowerCase();
  const ext = url.split('?')[0].split('.').pop().toLowerCase();
  if (ct.startsWith('video/') || ['mp4','webm','mov','mkv'].includes(ext)) return 'video';
  if (ct.startsWith('image/gif') || ext === 'gif')                          return 'gif';
  if (ct.startsWith('image/')    || ['png','jpg','jpeg','webp'].includes(ext)) return 'image';
  if (ct.startsWith('audio/')    || ['mp3','wav','ogg','m4a'].includes(ext))   return 'audio';
  return 'text';
}

server.listen(PORT, () => console.log(`🚀 LiveChat : http://localhost:${PORT}`));
client.login(DISCORD_TOKEN);
