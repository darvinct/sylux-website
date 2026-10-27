// Role names and level ranges supplied by the SYLUX community owner.
// Informational guide only: no Discord permissions or role assignments are performed here.
export const sentinelDivisions = [
  {
    "id": "partner",
    "name": "Partner Staff",
    "category": {
      "id": "Relasi lintas komunitas",
      "en": "Cross-community relations"
    },
    "description": {
      "id": "Menjaga relasi partnership dan menjembatani kolaborasi lintas server.",
      "en": "Maintains partnership relations and connects cross-server collaborations."
    },
    "duties": {
      "id": [
        "Relasi partnership",
        "Kolaborasi lintas server"
      ],
      "en": [
        "Partnership relations",
        "Cross-server collaboration"
      ]
    }
  },
  {
    "id": "event-creative",
    "name": "Event Creative Staff",
    "category": {
      "id": "Kreativitas acara",
      "en": "Event creativity"
    },
    "description": {
      "id": "Menyiapkan konsep, perencanaan, dan arahan kreatif untuk event komunitas.",
      "en": "Shapes concepts, planning, and creative direction for community events."
    },
    "duties": {
      "id": [
        "Konsep acara",
        "Perencanaan event",
        "Arahan kreatif"
      ],
      "en": [
        "Event concepts",
        "Event planning",
        "Creative direction"
      ]
    }
  },
  {
    "id": "design-editor",
    "name": "Design & Editor Staff",
    "category": {
      "id": "Desain dan aset kreatif",
      "en": "Design and creative assets"
    },
    "description": {
      "id": "Menangani desain visual, editing, dan aset kreatif yang mendukung identitas komunitas.",
      "en": "Handles visual design, editing, and creative assets for the community."
    },
    "duties": {
      "id": [
        "Desain visual",
        "Editing",
        "Aset kreatif"
      ],
      "en": [
        "Visual design",
        "Editing",
        "Creative assets"
      ]
    }
  },
  {
    "id": "publication",
    "name": "Publication Staff",
    "category": {
      "id": "Informasi komunitas",
      "en": "Community information"
    },
    "description": {
      "id": "Menyiapkan pengumuman, menyusun wording, dan menyampaikan informasi komunitas.",
      "en": "Prepares announcements, wording, and community information."
    },
    "duties": {
      "id": [
        "Pengumuman",
        "Penyusunan wording",
        "Penyampaian informasi"
      ],
      "en": [
        "Announcements",
        "Wording",
        "Information delivery"
      ]
    }
  },
  {
    "id": "media",
    "name": "Media Staff",
    "category": {
      "id": "Konten dan media",
      "en": "Content and media"
    },
    "description": {
      "id": "Menangani konten, media, dan eksposur komunitas SYLUX.",
      "en": "Handles content, media, and community exposure for SYLUX."
    },
    "duties": {
      "id": [
        "Konten komunitas",
        "Media",
        "Eksposur komunitas"
      ],
      "en": [
        "Community content",
        "Media",
        "Community exposure"
      ]
    }
  },
  {
    "id": "game",
    "name": "Game Staff",
    "category": {
      "id": "Aktivitas gaming",
      "en": "Gaming activities"
    },
    "description": {
      "id": "Mengoordinasikan aktivitas, event, dan kebutuhan komunitas seputar gaming.",
      "en": "Coordinates gaming activities, events, and community needs."
    },
    "duties": {
      "id": [
        "Aktivitas gaming",
        "Event gaming",
        "Koordinasi gaming"
      ],
      "en": [
        "Gaming activities",
        "Gaming events",
        "Gaming coordination"
      ]
    }
  },
  {
    "id": "female",
    "name": "Female Staff",
    "category": {
      "id": "Female Community",
      "en": "Female Community"
    },
    "description": {
      "id": "Mendampingi program dan kebutuhan Female Community di SYLUX.",
      "en": "Supports Female Community programs and needs in SYLUX."
    },
    "duties": {
      "id": [
        "Program Female Community",
        "Kebutuhan Female Community"
      ],
      "en": [
        "Female Community programs",
        "Female Community needs"
      ]
    }
  },
  {
    "id": "streamer",
    "name": "Streamer Staff",
    "category": {
      "id": "Program live komunitas",
      "en": "Live community programs"
    },
    "description": {
      "id": "Menangani aktivitas streaming dan program komunitas yang disiarkan secara live.",
      "en": "Handles streaming activities and live community programs."
    },
    "duties": {
      "id": [
        "Aktivitas streaming",
        "Program live komunitas"
      ],
      "en": [
        "Streaming activities",
        "Live community programs"
      ]
    }
  },
  {
    "id": "medic",
    "name": "Medic Staff",
    "category": {
      "id": "Dukungan anggota",
      "en": "Member support"
    },
    "description": {
      "id": "Membantu kebutuhan komunitas dan mendampingi anggota yang memerlukan dukungan.",
      "en": "Provides community assistance and member support."
    },
    "duties": {
      "id": [
        "Bantuan komunitas",
        "Dukungan anggota"
      ],
      "en": [
        "Community assistance",
        "Member support"
      ]
    }
  },
  {
    "id": "payment",
    "name": "Payment Staff",
    "category": {
      "id": "Pembayaran dan reward",
      "en": "Payments and rewards"
    },
    "description": {
      "id": "Menangani pembayaran, reward, dan koordinasi transaksi komunitas.",
      "en": "Handles community payments, rewards, and transactions."
    },
    "duties": {
      "id": [
        "Pembayaran",
        "Reward",
        "Penanganan transaksi"
      ],
      "en": [
        "Payments",
        "Rewards",
        "Transaction handling"
      ]
    }
  }
] as const;

export const levellingRoles = [
  {
    "id": "outsider",
    "name": "Outsider",
    "minLevel": 0,
    "maxLevel": 5,
    "description": {
      "id": "Role awal untuk member baru. Langkah pertama dalam perjalananmu di SYLUX.",
      "en": "The starting role for new members. Your first step in the SYLUX journey."
    }
  },
  {
    "id": "resident",
    "name": "Resident+",
    "minLevel": 6,
    "maxLevel": 15,
    "description": {
      "id": "Tier resident aktif untuk anggota yang mulai membangun kehadiran di komunitas.",
      "en": "The active resident tier for members building their presence in the community."
    }
  },
  {
    "id": "data-knight",
    "name": "Data Knight",
    "minLevel": 16,
    "maxLevel": 25,
    "description": {
      "id": "Tier komunitas yang sedang bertumbuh, selangkah lebih jauh dalam progresimu.",
      "en": "A growing community tier and the next stage of your progression."
    }
  },
  {
    "id": "circuit-breaker",
    "name": "Circuit Breaker",
    "minLevel": 26,
    "maxLevel": 40,
    "description": {
      "id": "Tier progresi aktif dalam perjalanan levelling SYLUX.",
      "en": "An active progression tier in the SYLUX levelling journey."
    }
  },
  {
    "id": "code-whisperer",
    "name": "Code Whisperer",
    "minLevel": 41,
    "maxLevel": 60,
    "description": {
      "id": "Tier untuk anggota yang telah membangun tempatnya dalam komunitas.",
      "en": "The established community tier for members who have found their place."
    }
  },
  {
    "id": "neon-architect",
    "name": "Neon Architect",
    "minLevel": 61,
    "maxLevel": 85,
    "description": {
      "id": "Tier progresi tinggi, melanjutkan perjalananmu bersama komunitas.",
      "en": "A high progression tier as your community journey continues."
    }
  },
  {
    "id": "quantum-shaper",
    "name": "Quantum Shaper",
    "minLevel": 86,
    "maxLevel": 110,
    "description": {
      "id": "Tier progresi lanjutan dalam sistem levelling SYLUX.",
      "en": "An advanced progression tier in the SYLUX levelling system."
    }
  },
  {
    "id": "glitched-crown",
    "name": "The Glitched Crown",
    "minLevel": 111,
    "maxLevel": 135,
    "description": {
      "id": "Tier progresi tertinggi dalam daftar levelling SYLUX.",
      "en": "The highest progression tier in the SYLUX levelling guide."
    }
  }
] as const;

export const legacyRole = {
  "id": "cyber-veteran",
  "name": "Cyber Veteran",
  "description": {
    "id": "Legacy recognition untuk para veteran SYLUX. Penghargaan ini ditampilkan terpisah dari tier dengan rentang level.",
    "en": "Legacy recognition for SYLUX veterans, presented separately from the level-based progression tiers."
  }
} as const;
