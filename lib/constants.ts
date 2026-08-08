export const site = {
  name: "Joyguru Enterprise",
  tagline: "Objects with an old soul.",
  description: "Handmade clayware shaped in Bengal, made for thoughtful homes and discerning retailers.",
  owner: "Sujit Ghosh",
  phone: "9475878478",
  whatsapp: "9775733649",
  email: "sujit@joyguruenterprise.in",
  address: ["Parulla", "Sindurpur Road", "Near Shishu Bhatai School", "Purba Bardhaman", "West Bengal — 713513", "India"]
} as const;

export const navItems = [
  { label: "Shop", href: "/products" },
  { label: "Our story", href: "/about" },
  { label: "Collections", href: "/categories" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Journal", href: "/faq" }
] as const;
