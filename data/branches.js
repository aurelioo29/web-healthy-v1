export const CATEGORIES = {
  LAB: "laboratorium-utama",
  CLINIC: "klinik",
  NETWORK: "mitra-dan-jaringan",
};

export const branches = [
  {
    name: "RSU BUNDA JAKARTA",
    category: CATEGORIES.LAB,
    address:
      "Jl. Teuku Cik Ditiro No.21 Gondangdia, Menteng, Jakarta Pusat 10350",
    heroImg: "/images/lokasi-pages/image-1.webp",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7933.039235296999!2d106.836462!3d-6.19496!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f43e055a7b51%3A0xfca15d66b8abee5b!2sMorula%20IVF%20Jakarta%20-%20Fertilisasi%20in%20Vitro%20-%20Klinik%20Bayi%20Tabung%20Indonesia!5e0!3m2!1sid!2sus!4v1758437251389!5m2!1sid!2sus",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["Senin – Jumat (24 Jam)", "Sabtu – Minggu (24 Jam)"],
    services: [
      "PCR Swab Test",
      "Tes Pasca Covid",
      "Medical Check Up",
      "Vitamin Booster",
      "Swab Antigen",
      "Serologi",
      "Skrining Kehamilan",
    ],
  },
  {
    name: "RSIA Bunda Jakarta",
    category: CATEGORIES.LAB,
    address:
      "Jl. Teuku Cik Ditiro No.28, RT.9/RW.2, Gondangdia, Menteng, Jakarta Pusat",
    heroImg: "/images/locations/rsia-bunda-jakarta.webp",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7933.039235296999!2d106.836462!3d-6.19496!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f43e055a7b51%3A0xfca15d66b8abee5b!2sMorula%20IVF%20Jakarta%20-%20Fertilisasi%20in%20Vitro%20-%20Klinik%20Bayi%20Tabung%20Indonesia!5e0!3m2!1sid!2sus!4v1758437251389!5m2!1sid!2sus",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["24 Jam"],
    services: ["MCU", "Laboratorium Klinik", "Kebidanan & Anak"],
  },

  {
    name: "Morula IVF Jakarta",
    category: CATEGORIES.NETWORK,
    address:
      "The BIC, Jl. Teuku Cik Ditiro No.12-14, RT.8/RW.2, Gondangdia, Menteng, Jakarta Pusat",
    heroImg: "/images/locations/morula.webp",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!...Morula",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["Senin–Sabtu (08.00–20.00)"],
    services: ["Program IVF", "Lab Embriologi"],
  },

  {
    name: "NMW CLINIC",
    category: CATEGORIES.NETWORK,
    address:
      "Jl. Menteng Raya Blok FA1 No.23, Jurang Mangu Barat, Pd. Aren, Tangerang Selatan",
    heroImg: "/images/locations/nmw.webp",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!...NMW",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["Setiap hari (09.00–21.00)"],
    services: ["Klinik Estetika", "Laboratorium Dasar"],
  },

  {
    name: "Klinik Utama Permata HSO",
    category: CATEGORIES.CLINIC,
    address:
      "Jl. Pulau Bira III No.5 Blok D1, Kembangan Utara, Kec. Kembangan, Jakarta Barat",
    heroImg: "/images/locations/permata-hso.webp",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!...HSO",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["Senin–Sabtu (08.00–17.00)"],
    services: ["Laboratorium Klinik", "Vaksinasi"],
  },

  {
    name: "Kizuna Clinic",
    category: CATEGORIES.CLINIC,
    address:
      "Jalan Jenderal Sudirman Lt.25–35R, Blok 10–11, Karet Tengsin, Tanah Abang",
    heroImg: "/images/locations/kizuna.webp",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!...Kizuna",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["Senin–Sabtu (08.00–17.00)"],
    services: ["Laboratorium", "MCU"],
  },

  {
    name: "RSIA Bunda Ciputat",
    category: CATEGORIES.LAB,
    address:
      "Jl. R. E. Martadinata No.30, Ciputat, Tangerang Selatan, Banten 15411",
    heroImg: "/images/locations/rsia-bunda-ciputat.webp",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!...Ciputat",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["24 Jam"],
    services: ["Laboratorium Klinik", "MCU"],
  },

  {
    name: "RSU Bunda Margonda",
    category: CATEGORIES.LAB,
    address:
      "Jl. Margonda No.28, Pondok Cina, Beji, Kota Depok, Jawa Barat 16424",
    heroImg: "/images/locations/rsu-bunda-margonda.webp",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!...Margonda",
    phone: "1500358",
    whatsapp: "0855-1500-358",
    hours: ["24 Jam"],
    services: ["Laboratorium Klinik", "Bank Darah"],
  },
];

export const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
