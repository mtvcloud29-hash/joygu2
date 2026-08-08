import { catalog, categories, type CatalogProduct } from "@/lib/catalog";
import { site } from "@/lib/constants";
export type { CatalogProduct } from "@/lib/catalog";

export const demoProducts: CatalogProduct[] = catalog.map((product) => ({ ...product, gallery: [...product.gallery], benefits: [...product.benefits] }));
export const demoCategories = categories.map((category) => ({ ...category }));

export const demoBanners = [
  { id: "banner-01", eyebrow: "Handmade in Bengal", title: "Objects with an old soul.", description: "Clayware for slow mornings, generous tables and spaces that feel like home.", href: "/products", image: "/images/photography/pottery-earth.jpg" },
  { id: "banner-02", eyebrow: "For thoughtful spaces", title: "Bring a little Bengal to your shelves.", description: "Trade collections for retailers, hospitality and design-led spaces.", href: "/wholesale", image: "/images/photography/pottery-white.jpg" }
] as const;

export const demoFlashSales = demoProducts.filter((product) => product.compareAt !== null).slice(0, 6);

export const demoTestimonials = [
  { id: "testimonial-01", quote: "Our guests notice the tableware before they notice anything else. It gives the room a sense of place.", name: "Aditi Menon", role: "Founder, The Courtyard House" },
  { id: "testimonial-02", quote: "The quality is exceptional and the team understands how a considered collection should feel on a shelf.", name: "Rohan Mehta", role: "Creative Director, House of Objects" }
] as const;

export const demoGallery = [
  "/images/photography/pottery-earth.jpg",
  "/images/photography/pottery-wheel.jpg",
  "/images/photography/pottery-white.jpg",
  "/images/photography/pottery-heritage.jpg",
  "/images/photography/ceramics-close.jpg",
  "/images/photography/pottery-market.jpg",
  "/images/photography/pottery-earth.jpg",
  "/images/photography/pottery-heritage.jpg"
] as const;

export const demoCompanyInfo = {
  name: site.name,
  owner: site.owner,
  email: site.email,
  phone: site.phone,
  whatsapp: site.whatsapp,
  address: [...site.address]
} as const;
