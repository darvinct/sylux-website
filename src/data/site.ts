// Identitas dan konsep acara SYLUX dari pengelola komunitas.
// Jangan taruh bot token, webhook URL, atau secret di frontend.
export const site = {
  name: "SYLUX",
  tagline: "Find your people.",
  discordInvite: import.meta.env.VITE_DISCORD_INVITE || "https://discord.gg/sylux",
  instagram: "",
  contactEmail: "", // Opsional, untuk membuka draft pendaftaran di aplikasi email.
  isDemo: false,
};

export const events = [
  {
    "id": "luxstars",
    "category": "Sharing",
    "title": "LUXSTARS",
    "subtitle": {
      "id": "Cerita, kenangan, dan momen bersama.",
      "en": "Stories, memories, and shared moments."
    },
    "description": {
      "id": "LUXSTARS menghadirkan malam penuh cerita, kenangan, dan momen bersama. Lewat sharing session yang santai, anggota berbagi pengalaman masa lalu, kejadian berkesan, dan cerita di antaranya. Keseruan berlanjut dengan spin wheel minigames berisi tantangan seru.",
      "en": "LUXSTARS brings a night of stories, memories, and shared moments. A relaxed sharing session invites everyone to talk about past experiences, memorable moments, and everything in between. Spin wheel minigames with fun challenges make the night even more exciting."
    },
    "program": [
      "Sharing session",
      "Spin wheel minigames"
    ],
    "image": "/images/luxstars-documentation.png",
    "imageKind": "documentation",
    "alt": "Dokumentasi LUXSTARS: SYLUX RISING STARS di Discord Stage SYLUX, menampilkan pembicara dan audiens"
  },
  {
    "id": "sylux-got-talent-s2",
    "category": "Talent",
    "title": "SYLUX GOT TALENT S2",
    "subtitle": {
      "id": "Kesempatan baru untuk menunjukkan bakatmu.",
      "en": "A new chance to let your talent speak."
    },
    "description": {
      "id": "SYLUX Got Talent kembali hadir dengan Season 2. Bagi anggota yang ketinggalan informasi atau belum sempat menunjukkan bakat pada musim pertama, inilah kesempatan untuk tampil dan membiarkan bakatmu berbicara.",
      "en": "SYLUX Got Talent returns for Season 2. If you missed the first season or did not get the chance to show your skills, now is the time to put your best foot forward and let your talent speak for itself."
    },
    "program": [
      "Talent showcase",
      "Season 2"
    ],
    "image": "/images/conversation.jpg",
    "imageKind": "illustration",
    "alt": "Ilustrasi mikrofon; bukan dokumentasi SYLUX GOT TALENT S2"
  },
  {
    "id": "boo-the-show",
    "category": "Horror",
    "title": "BOO! THE SHOW: A NIGHT OF FRIGHTS",
    "subtitle": {
      "id": "Satu malam horor, penuh interaksi dan kejutan.",
      "en": "A night of horror, interaction, and surprises."
    },
    "description": {
      "id": "BOO! THE SHOW merupakan event hiburan bertema horor yang menggabungkan sesi podcast, horror storytelling, interactive minigames, dan performances dalam satu rangkaian acara yang interaktif dan penuh kejutan.",
      "en": "BOO! THE SHOW is a horror-themed entertainment event bringing together podcast sessions, horror storytelling, interactive minigames, and performances in one interactive program full of surprises."
    },
    "program": [
      "Podcast",
      "Horror storytelling",
      "Interactive minigames",
      "Performances"
    ],
    "image": "/images/boo-the-show-documentation.png",
    "imageKind": "documentation",
    "alt": "Dokumentasi BOO! THE SHOW: A NIGHT OF FRIGHTS di Discord Stage SYLUX, menampilkan pembicara dan audiens"
  }
];

export const copy = {
  id: {
    information: "Informasi",
    nav: ["Beranda", "Server Stats", "Team", "Portfolio"],
    join: "Gabung Discord",
    waiting: "Undangan segera hadir",
    eyebrow: "KOMUNITAS DISCORD INDONESIA",
    heroTagline: "Ruangmu untuk bersinar.",
    intro:
      "Tempat singgah untuk ngobrol, berbagi musik, dan menemukan orang-orang yang satu frekuensi.",
    explore: "Jelajahi komunitas",
    about: "Datang sebagai orang baru.\nPulang sebagai teman.",
    aboutBody:
      "Tidak harus punya banyak cerita. Kadang, cukup hadir dan jadi diri sendiri.",
    activities: [
      "Obrolan tanpa canggung",
      "Teman di voice channel",
      "Event yang bikin dekat",
      "Ruang untuk berkarya",
    ],
    activityBodies: [
      "Dari kabar hari ini sampai topik yang tidak terduga.",
      "Temani malam dengan cerita, musik, atau sekadar nongkrong.",
      "Music night, games, dan kegiatan pilihan komunitas.",
      "Bagikan desain, ide, dan hal yang sedang kamu buat.",
    ],
    stats: "Dari balik layar,\nkita tetap terhubung.",
    statsBody: "Sekilas kehidupan komunitas, langsung dari Discord.",
    team: "Tim SYLUX",
    teamBody: "Kenali tim yang menjaga percakapan dan kegiatan tetap berjalan.",
    search: "Cari nama, peran, atau divisi...",
    all: "Semua peran",
    sort: "Urutan",
    defaultSort: "Default",
    az: "Nama A–Z",
    noMembers: "Belum ada anggota yang cocok.",
    reset: "Reset pencarian",
    portfolio: "Momen yang jadi cerita.",
    portfolioBody:
      "Musik, percakapan, dan permainan. Selalu ada alasan untuk berkumpul.",
    allEvents: "Semua",
    detail: "Lihat cerita",
    tools: "Bawa komunitasmu bersamamu.",
    toolsBody: "Tiga alat sederhana untuk ikut ambil bagian.",
    toolNames: ["Twibbon Studio", "Form Komunitas", "Webhook Studio"],
    toolBodies: [
      "Buat foto profil dengan bingkai komunitas.",
      "Siapkan pendaftaran dan simpan salinannya.",
      "Rancang pesan Discord dan ekspor JSON-nya.",
    ],
    closing: "Ada tempat\nuntuk ceritamu.",
    closingBody: "Sampai bertemu di percakapan berikutnya.",
    faq: "Sebelum bergabung",
    questions: [
      "Siapa saja yang boleh bergabung?",
      "Harus aktif setiap hari?",
      "Bagaimana cara ikut event?",
    ],
    answers: [
      "Siapa pun yang ingin berteman dan menghormati anggota lain. Baca peraturan server dan ketentuan usia Discord sebelum ikut.",
      "Tidak. Ikut ngobrol saat kamu ingin. Mendengarkan dan menikmati suasana juga boleh.",
      "Setelah bergabung, cek kanal pengumuman dan event. Tim akan membagikan jadwal serta cara ikut di sana.",
    ],
    demo: "Kegiatan di halaman ini adalah contoh. Profil tim diambil dari Discord. Statistik hanya ditampilkan jika server Discord terhubung.",
    rights: "Dibuat untuk percakapan yang berarti.",
    close: "Tutup",
    sample: "Contoh kegiatan",
    sampleTeam: "Contoh susunan tim",
  },
  en: {
    information: "Information",
    nav: ["Home", "Server Stats", "Team", "Portfolio"],
    join: "Join Discord",
    waiting: "Invite coming soon",
    eyebrow: "INDONESIAN DISCORD COMMUNITY",
    heroTagline: "Find your people. Shine together.",
    intro:
      "A place to hang out, share music, and find people on your wavelength.",
    explore: "Explore the community",
    about: "Arrive as a stranger.\nLeave as a friend.",
    aboutBody:
      "You do not need a big story to tell. Sometimes, showing up as yourself is enough.",
    activities: [
      "Easy conversations",
      "Company in voice chat",
      "Events that connect",
      "Room to create",
    ],
    activityBodies: [
      "From everyday updates to unexpected conversations.",
      "Share a late night, a playlist, or a quiet moment.",
      "Music nights, games, and community gatherings.",
      "Share your designs, ideas, and works in progress.",
    ],
    stats: "Behind our screens,\nwe stay connected.",
    statsBody: "A glimpse of community life, straight from Discord.",
    team: "SYLUX Team",
    teamBody:
      "Meet the people keeping conversations and community events going.",
    search: "Search member, role, or division...",
    all: "All roles",
    sort: "Sort",
    defaultSort: "Default",
    az: "Name A–Z",
    noMembers: "No matching members yet.",
    reset: "Reset search",
    portfolio: "Moments worth sharing.",
    portfolioBody:
      "Music, conversations, and games. There is always a reason to get together.",
    allEvents: "All",
    detail: "Read the story",
    tools: "Take your community with you.",
    toolsBody: "Three simple ways to take part.",
    toolNames: ["Twibbon Studio", "Community Form", "Webhook Studio"],
    toolBodies: [
      "Make a profile photo with a community frame.",
      "Prepare an application and keep your copy.",
      "Design a Discord message and export its JSON.",
    ],
    closing: "A place\nfor your story.",
    closingBody: "See you in the next conversation.",
    faq: "Before you join",
    questions: [
      "Who can join?",
      "Do I have to be active every day?",
      "How do I take part in events?",
    ],
    answers: [
      "Anyone looking to connect and respect others. Read the server rules and Discord age requirements before joining.",
      "No. Join a conversation when you feel like it. You can also listen and enjoy the company.",
      "After joining, check the announcements and events channels for schedules and details.",
    ],
    demo: "Activities on this page are examples. Team profiles come from Discord. Statistics are shown only when a Discord server is connected.",
    rights: "Made for meaningful conversations.",
    close: "Close",
    sample: "Example activity",
    sampleTeam: "Example team",
  },
};
export type Language = keyof typeof copy;
