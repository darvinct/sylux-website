// Identitas SYLUX; kegiatan contoh bisa diganti dengan agenda komunitas.
// Jangan taruh bot token, webhook URL, atau secret di frontend.
export const site = {
  name: "SYLUX",
  tagline: "Find your people.",
  discordInvite: import.meta.env.VITE_DISCORD_INVITE || "https://discord.gg/sylux",
  instagram: "",
  contactEmail: "", // Opsional, untuk membuka draft pendaftaran di aplikasi email.
  isDemo: true,
};

export const events = [
  {
    id: "afterhours",
    category: "Music",
    title: "After Hours",
    subtitle: {
      id: "Satu ruang, banyak selera musik.",
      en: "One room. A thousand different sounds.",
    },
    description: {
      id: "Sesi mendengarkan musik bersama. Bawa lagu favoritmu, ceritakan kenangannya, dan temukan musik baru dari teman-teman komunitas.",
      en: "A shared listening session. Bring your favorite song, share the memory behind it, and discover something new together.",
    },
    image: "/images/music.jpg",
    alt: "Kerumunan penonton dan cahaya di panggung konser",
  },
  {
    id: "latenight",
    category: "Talk",
    title: "Late Night Stories",
    subtitle: {
      id: "Obrolan kecil yang terasa dekat.",
      en: "Small conversations. Real connections.",
    },
    description: {
      id: "Ruang ngobrol santai tentang keseharian, cerita lucu, dan hal-hal yang sedang kamu pikirkan. Boleh ikut cerita, boleh sekadar mendengarkan.",
      en: "A relaxed space for everyday stories and whatever is on your mind. Join the conversation, or just stay and listen.",
    },
    image: "/images/conversation.jpg",
    alt: "Mikrofon untuk sesi percakapan dan podcast",
  },
  {
    id: "game",
    category: "Games",
    title: "Play Together",
    subtitle: {
      id: "Menang boleh. Seru wajib.",
      en: "Good games. Better company.",
    },
    description: {
      id: "Sesi bermain bareng yang terbuka untuk pemain baru. Pilih permainan bersama dan nikmati waktunya tanpa harus menjadi yang paling jago.",
      en: "A friendly game session open to newcomers. Choose a game together and enjoy the company, whatever your skill level.",
    },
    image: "/images/games.jpg",
    alt: "Kontroler permainan untuk sesi bermain bersama",
  },
];

export const copy = {
  id: {
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
    team: "Orang-orang di balik ruang ini.",
    teamBody: "Kenali tim yang menjaga percakapan dan kegiatan tetap berjalan.",
    search: "Cari nama atau peran...",
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
    team: "The people behind this place.",
    teamBody:
      "Meet the people keeping conversations and community events going.",
    search: "Search names or roles...",
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
