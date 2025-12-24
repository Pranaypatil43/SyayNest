const sampleListings = [
  {
    title: "Cozy Beachfront Cottage",
    description:
      "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1500,
    location: "Malibu",
    country: "United States",
  },
  {
    title: "Modern Loft in Downtown",
    description:
      "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1200,
    location: "New York City",
    country: "United States",
  },
  {
    title: "Mountain Retreat",
    description:
      "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1000,
    location: "Aspen",
    country: "United States",
  },
  {
    title: "Historic Villa in Tuscany",
    description:
      "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2500,
    location: "Florence",
    country: "Italy",
  },
  {
    title: "Secluded Treehouse Getaway",
    description:
      "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 800,
    location: "Portland",
    country: "United States",
  },
  {
    title: "Beachfront Paradise",
    description:
      "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2000,
    location: "Cancun",
    country: "Mexico",
  },
  {
    title: "Rustic Cabin by the Lake",
    description:
      "A rustic cabin on the shores of a peaceful lake. Perfect for fishing and kayaking.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 900,
    location: "Lake Tahoe",
    country: "United States",
  },
  {
    title: "Desert Oasis Camp",
    description:
      "Spend the night under the stars in a luxury desert camp. An unforgettable experience awaits.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1100,
    location: "Sahara",
    country: "Morocco",
  },
  {
    title: "Charming Bungalow",
    description:
      "Relax in this charming bungalow surrounded by lush gardens and tranquility.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1300,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Countryside Farmhouse",
    description:
      "Enjoy fresh air and country living in this spacious farmhouse with modern amenities.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1472224371017-08207f84aaae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 950,
    location: "Tuscany",
    country: "Italy",
  },
  {
    title: "Lakeview Cabin",
    description:
      "A peaceful cabin overlooking the lake. Perfect for a quiet retreat or family vacation.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1100,
    location: "New Hampshire",
    country: "United States",
  },
  {
    title: "Luxury Villa in the Maldives",
    description:
      "Indulge in luxury in this overwater villa in the Maldives with stunning views of the Indian Ocean.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 6000,
    location: "Maldives",
    country: "Maldives",
  },
  {
    title: "Ski Chalet in Aspen",
    description:
      "Hit the slopes in style with this luxurious ski chalet in the world-famous Aspen ski resort.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 4000,
    location: "Aspen",
    country: "United States",
  },
  {
    title: "Secluded Beach House in Costa Rica",
    description:
      "Escape to a secluded beach house on the Pacific coast of Costa Rica. Surf, relax, and unwind.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1800,
    location: "Costa Rica",
    country: "Costa Rica",
  },
  {
    title: "City Apartment in Tokyo",
    description:
      "Stay in a modern apartment in the heart of Tokyo. Close to shopping, dining, and cultural attractions.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2200,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Greek Island Villa",
    description:
      "Enjoy breathtaking views of the Aegean Sea from this stunning villa on a Greek island.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1506086679524-493c64fdfaa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2700,
    location: "Santorini",
    country: "Greece",
  },
  {
    title: "Safari Lodge",
    description:
      "Experience the thrill of the wild with a stay at this luxury safari lodge. Guided tours included.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 3500,
    location: "Serengeti",
    country: "Tanzania",
  },
  {
    title: "Parisian Studio",
    description:
      "Cozy studio apartment with views of the Eiffel Tower. Perfect for a romantic getaway.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1549921296-3a53a1c7a63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1900,
    location: "Paris",
    country: "France",
  },
  {
    title: "Icelandic Cabin",
    description:
      "Stay warm in this cozy cabin while enjoying the northern lights and Iceland’s natural beauty.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1700,
    location: "Reykjavik",
    country: "Iceland",
  },
  {
    title: "Luxury Riad in Marrakech",
    description:
      "A beautifully decorated riad with traditional Moroccan architecture and modern amenities.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1597076537187-5b16f4c61dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2100,
    location: "Marrakech",
    country: "Morocco",
  },
  {
    title: "Countryside Castle",
    description:
      "Live like royalty in this countryside castle surrounded by lush gardens.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1549887534-5bdf06f33c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 5000,
    location: "Edinburgh",
    country: "Scotland",
  },
  {
    title: "Charming Houseboat",
    description:
      "Float along the canals in this charming houseboat equipped with all modern comforts.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1400,
    location: "Amsterdam",
    country: "Netherlands",
  },
  {
    title: "Rainforest Eco Lodge",
    description:
      "Immerse yourself in nature at this eco-friendly lodge in the heart of the rainforest.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1526322993997-52fd0a2b6ff1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 1600,
    location: "Amazon",
    country: "Brazil",
  },
  {
    title: "Alpine Chalet",
    description:
      "A traditional alpine chalet with skiing and hiking right at your doorstep.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1609941565378-3f40bc2fc0a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2400,
    location: "Zermatt",
    country: "Switzerland",
  },
  {
    title: "Beach Hut in Thailand",
    description:
      "Relax in a rustic beach hut with stunning views of the turquoise sea.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 900,
    location: "Phuket",
    country: "Thailand",
  },
  {
    title: "Luxury Desert Resort",
    description:
      "Stay in a 5-star desert resort with infinity pools and luxury suites.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1518684079-1b796f3a2d0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 3800,
    location: "Abu Dhabi",
    country: "United Arab Emirates",
  },
  {
    title: "Traditional Kyoto House",
    description:
      "Stay in a traditional machiya house and experience authentic Japanese culture.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1597628711106-85a0b97e3e2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2000,
    location: "Kyoto",
    country: "Japan",
  },
  {
    title: "Cliffside Villa",
    description:
      "Dramatic views await in this cliffside villa perched high above the sea.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 4200,
    location: "Amalfi Coast",
    country: "Italy",
  },
  {
    title: "Safari Tent Camp",
    description:
      "Sleep under canvas in a luxury safari tent with wildlife all around.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1562184647-bc35a7db6654?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    price: 2600,
    location: "Kruger",
    country: "South Africa",
  },
];

module.exports = { data: sampleListings };
