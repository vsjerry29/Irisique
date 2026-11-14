// Global Business & Experience Configuration for IRIS
export const SITE_CONFIG = {
  brandName: "IRIS",
  tagline: "Biometric Fine Art Photography",
  location: "Pondicherry, India",
  address: "Heritage Town / White Town, Pondicherry 605001, India",
  
  // WhatsApp Configuration (used for real inquiry routing)
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919840012345",
    cleanNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919840012345").replace(/[^0-9]/g, ""),
  },

  social: {
    instagram: "https://instagram.com/iris.pondicherry",
    email: "studio@iris-pondicherry.art",
  },

  // Pop-up events configuration
  popups: [
    {
      id: "popup-pondy-01",
      city: "Pondicherry",
      venue: "White Town Atelier",
      date: "Announcement Coming Soon",
      status: "Upcoming",
      isConfirmed: false,
    },
  ],

  // Biometric Privacy & Ethics Policy
  privacy: {
    collectionNotice:
      "Iris photography captures natural optical reflections of the stroma. No invasive light or corneal contact is used. Images are stored securely in private vaults and never shared with third-party biometric databases.",
    storageRetentionDays: 365,
    allowDataDeletion: true,
  },

  // Proposed introductory pricing
  pricing: {
    digital: { from: 299, to: 399, currency: "₹" },
    print: { from: 499, to: 699, currency: "₹" },
    framed: { from: 799, to: 1299, currency: "₹" },
    couple: { from: 999, to: 1499, currency: "₹" },
    family: { from: 1499, to: 2499, currency: "₹" },
  },
};
