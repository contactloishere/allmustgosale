// FALLBACK DATA — used only if the real Supabase products table is empty
// or unreachable, so the storefront never shows completely blank.
// Once you add real products in Supabase's Table Editor, those take over
// automatically — see js/app.js for the fetch logic.
//
// NOTE on `description`: separate each bullet point with a line break.
// The storefront splits on line breaks to render them as a bulleted list,
// showing the first 2 by default with a "See more" toggle for the rest.
//
// Fields: id, name, description, price (PHP), weight (kg, hidden from customer),
// images (array of up to 5 Cloudinary URLs — fewer than 5 is fine)
// Optional: stockQuantity (leave undefined/null if not tracking stock),
// unitsSold (defaults to 0), category ('preloved' | 'clearance' | 'soaps' | your own)

let PRODUCTS = [
  {
    id: 1,
    name: "Ceramic Pour-Over Set",
    description: "Matte stoneware dripper + carafe\nSlight glaze variation on each piece — normal, not a defect\nHolds up to 4 cups\nHand wash recommended",
    price: 890,
    originalPrice: 1200,
    weight: 1.2,
    stockQuantity: 2,
    unitsSold: 3,
    category: "preloved",
    images: [
      "https://picsum.photos/seed/mc1a/800/800",
      "https://picsum.photos/seed/mc1b/800/800",
      "https://picsum.photos/seed/mc1c/800/800"
    ]
  },
  {
    id: 2,
    name: "Woven Market Tote",
    description: "Natural fiber, reinforced base. Last of this run — the supplier discontinued the weave pattern.",
    price: 450,
    weight: 0.4,
    images: [
      "https://picsum.photos/seed/mc2a/800/800",
      "https://picsum.photos/seed/mc2b/800/800"
    ]
  },
  {
    id: 3,
    name: "Brass Desk Organizer",
    description: "Solid brass, raw unlacquered finish\nWill patina naturally with handling\n3 compartments for pens, cards, and small items\nWeighted base — won't tip over easily",
    price: 1250,
    weight: 0.9,
    images: [
      "https://picsum.photos/seed/mc3a/800/800",
      "https://picsum.photos/seed/mc3b/800/800",
      "https://picsum.photos/seed/mc3c/800/800",
      "https://picsum.photos/seed/mc3d/800/800"
    ]
  },
  {
    id: 4,
    name: "Linen Table Runner",
    description: "Stonewashed linen, 180cm. Overstock from a past collection.",
    price: 620,
    weight: 0.3,
    images: [
      "https://picsum.photos/seed/mc4a/800/800"
    ]
  },
  {
    id: 5,
    name: "Recycled Glass Tumbler Set (Set of 4)",
    description: "Hand-blown from recycled glass, each one slightly unique in bubble pattern.",
    price: 980,
    weight: 1.6,
    images: [
      "https://picsum.photos/seed/mc5a/800/800",
      "https://picsum.photos/seed/mc5b/800/800",
      "https://picsum.photos/seed/mc5c/800/800",
      "https://picsum.photos/seed/mc5d/800/800",
      "https://picsum.photos/seed/mc5e/800/800"
    ]
  }
];
