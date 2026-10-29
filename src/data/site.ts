// Identitas dan konsep acara SYLUX dari pengelola komunitas.
// Jangan taruh bot token, webhook URL, atau secret di frontend.
export const site = {
  name: "SYLUX",
  tagline: "Find your people.",
  discordInvite: import.meta.env.VITE_DISCORD_INVITE || "https://discord.gg/sylux",
  instagram: "https://www.instagram.com/syluxcommunity_/",
  tiktok: "https://www.tiktok.com/@syluxcommunity_",
  isDemo: false,
};

export const events = [
  {
    "id": "luxstars",
    "category": "Sharing",
    "title": "LUXSTARS",
    "concept": {
      "id": "Sharing session untuk berbagi pengalaman, dilanjutkan spin wheel minigames bersama anggota.",
      "en": "A sharing session for personal stories and experiences, followed by spin wheel minigames."
    },
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
    "concept": {
      "id": "Panggung bagi anggota untuk menunjukkan bakat, termasuk yang belum sempat tampil pada musim pertama.",
      "en": "A stage for members to share their talents, including those who missed the first season."
    },
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
    "image": "/images/sylux-got-talent-s2-documentation.png",
    "imageKind": "documentation",
    "alt": "Dokumentasi SYLUX GOT TALENT S2 di Discord Stage pada sesi audisi, menampilkan pembicara dan audiens"
  },
  {
    "id": "boo-the-show",
    "category": "Horror",
    "title": "BOO! THE SHOW: A NIGHT OF FRIGHTS",
    "concept": {
      "id": "Podcast, cerita horor, minigames interaktif, dan penampilan dalam satu acara bertema horor.",
      "en": "Podcasts, horror stories, interactive minigames, and performances in one horror-themed event."
    },
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
  },
  {
    "id": "jealousy",
    "category": "Music",
    "title": "JEALOUSY: Jamming Area in Fabulous SYLUX",
    "concept": {
      "id": "Jamming bersama performer bersuara emas, dari lembut hingga cool, dengan hadiah menarik untuk penonton.",
      "en": "A jamming session with golden-voiced performers, from soft to cool, with exciting prizes for the audience."
    },
    "subtitle": {
      "id": "Musik untuk para jomblo dan bucin.",
      "en": "Music for singles and the lovestruck."
    },
    "description": {
      "id": "JEALOUSY (Jamming Area in Fabulous SYLUX) akan menghadirkan para performer dengan suara emas, lembut, cool, dan pastinya luar biasa baguss! Kalian para kaum jomblo dan bucin pasti suka bangett!! Ada hadiah menarik juga loh untuk kalian.",
      "en": "JEALOUSY (Jamming Area in Fabulous SYLUX) brings you performers with golden, soft, cool, and truly amazing voices! Whether you're single or lovestruck, you'll love it. There are exciting prizes for you too!"
    },
    "program": [
      "Jamming session",
      "Live performances",
      "Prizes"
    ],
    "image": "/images/jealousy-documentation.png",
    "imageKind": "documentation",
    "alt": "Dokumentasi JEALOUSY: Jamming Area in Fabulous SYLUX di Discord Stage, menampilkan performer dan audiens"
  }
];

export const copy = {
  id: {
    information: "Informasi",
    nav: ["Beranda", "Server Stats", "Team", "Portfolio"],
    join: "Gabung Discord",
    waiting: "Undangan segera hadir",
    eyebrow: "KOMUNITAS DISCORD INDONESIA",
    heroTagline: "The luxury of psychology",
    intro:
      "Elegance – Exclusivity – Credibility.",
    explore: "Jelajahi komunitas",
    communityHighlights: ["Berbagi pengalaman", "Mengembangkan bakat", "Mewujudkan ide"],
    aboutLabel: "Tentang SYLUX",
    about: "Tempat belajar.\nRuang untuk berkembang.",
    aboutBody:
      "SYLUX mempertemukan orang yang ingin bertukar pengalaman, mencoba ide, dan mengembangkan bakat bersama. Kenali komunitas kami lewat kegiatan yang telah kami jalankan.",
    portfolioLink: "Lihat portofolio kegiatan",
    joinBody: "Tidak harus punya banyak cerita. Kadang, cukup hadir dan jadi diri sendiri.",
    activities: [
      "Bertukar pengalaman",
      "Belajar bersama",
      "Berani tampil",
      "Mengembangkan ide",
    ],
    activityBodies: [
      "Bagikan cerita dan dengarkan sudut pandang anggota lain, seperti dalam LUXSTARS.",
      "Bawa rasa ingin tahu ke percakapan dan diskusi di voice channel.",
      "Coba tampil dan tunjukkan bakatmu lewat acara seperti SYLUX GOT TALENT.",
      "Bagikan desain, gagasan, atau karya yang sedang kamu buat untuk didiskusikan bersama.",
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
    portfolio: "Dari ide menjadi kegiatan.",
    portfolioBody:
      "Lihat dokumentasi sharing session, panggung bakat, dan acara hiburan yang telah kami jalankan bersama komunitas.",
    allEvents: "Semua",
    detail: "Lihat cerita",
    closing: "Ada tempat\nuntuk ceritamu.",
    closingBody: "Sampai bertemu di percakapan berikutnya.",
    faq: "Sebelum bergabung",
    questions: [
      "Untuk siapa komunitas SYLUX?",
      "Apakah harus punya keahlian sebelum bergabung?",
      "Kegiatan apa yang bisa saya temukan di SYLUX?",
    ],
    answers: [
      "Untuk kamu yang ingin bertukar pengalaman, mencoba ide, mengembangkan bakat, dan mengenal orang baru. Pastikan kamu memenuhi ketentuan usia Discord dan bersedia menghormati peraturan komunitas.",
      "Tidak perlu sudah ahli. Kamu bisa datang dengan rasa ingin tahu, belajar lewat percakapan, dan berbagi hal yang sedang kamu coba bersama anggota lain.",
      "Ada sesi berbagi pengalaman seperti LUXSTARS, panggung bakat SYLUX GOT TALENT, dan acara hiburan seperti BOO! THE SHOW. Lihat dokumentasi di portofolio untuk mengenal kegiatan kami sebelum bergabung.",
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
    heroTagline: "The luxury of psychology",
    intro:
      "Elegance – Exclusivity – Credibility.",
    explore: "Explore the community",
    communityHighlights: ["Share experiences", "Develop your talents", "Bring ideas to life"],
    aboutLabel: "About SYLUX",
    about: "A place to learn.\nRoom to grow.",
    aboutBody:
      "SYLUX brings together people who want to share experiences, try ideas, and develop their talents. Get to know our community through the activities we have put together.",
    portfolioLink: "Explore our event portfolio",
    joinBody: "You do not need a big story to tell. Sometimes, showing up as yourself is enough.",
    activities: [
      "Share experiences",
      "Learn together",
      "Take the stage",
      "Develop ideas",
    ],
    activityBodies: [
      "Share your stories and hear other perspectives in sessions like LUXSTARS.",
      "Bring your curiosity to conversations and discussions in voice channels.",
      "Try performing and share your talents at events like SYLUX GOT TALENT.",
      "Share designs, ideas, or works in progress to discuss with other members.",
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
    portfolio: "From ideas to community events.",
    portfolioBody:
      "Explore the sharing sessions, talent showcases, and entertainment events we have put together with our community.",
    allEvents: "All",
    detail: "Read the story",
    closing: "A place\nfor your story.",
    closingBody: "See you in the next conversation.",
    faq: "Before you join",
    questions: [
      "Who is SYLUX for?",
      "Do I need any skills before joining?",
      "What activities can I find at SYLUX?",
    ],
    answers: [
      "People who want to share experiences, try ideas, develop their talents, and meet others. You must meet Discord's age requirements and be willing to respect the community rules.",
      "You do not need to be an expert. Bring your curiosity, learn through conversations, and share what you are trying with other members.",
      "Our activities include sharing sessions like LUXSTARS, talent showcases like SYLUX GOT TALENT, and entertainment events like BOO! THE SHOW. Explore the documentation in our portfolio to get to know our activities before joining.",
    ],
    demo: "Activities on this page are examples. Team profiles come from Discord. Statistics are shown only when a Discord server is connected.",
    rights: "Made for meaningful conversations.",
    close: "Close",
    sample: "Example activity",
    sampleTeam: "Example team",
  },
};
export type Language = keyof typeof copy;
