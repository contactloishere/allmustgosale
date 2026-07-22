// PLACEHOLDER DATA — shaped exactly like the Supabase "products" table will be.
// Once Supabase is wired up in a later stage, this file gets replaced by a
// live fetch — nothing else in the app needs to change.
//
// Fields: id, name, description, price (PHP), weight (kg, hidden from customer),
// images (array of up to 5 Cloudinary URLs — fewer than 5 is fine)

const PRODUCTS = [
  {
    id: 1,
    name: "Ceramic Pour-Over Set",
    description: "Matte stoneware dripper + carafe. Slight glaze variation on each piece — normal, not a defect.",
    price: 890,
    weight: 1.2,
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
    description: "Solid brass, raw unlacquered finish that will patina with handling.",
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
