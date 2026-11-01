import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const catalog = [
  { parent: "Men's Clothing", emoji: "👔", items: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Jackets", "Suits", "Ethnic Wear", "Innerwear"] },
  { parent: "Women's Clothing", emoji: "👗", items: ["Sarees", "Kurtis", "Dresses", "Tops", "Jeans", "Leggings", "Lehengas", "Ethnic Wear"] },
  { parent: "Kids' Clothing", emoji: "🧒", items: ["Boys' Wear", "Girls' Wear", "Baby Clothing", "School Uniforms"] },
  { parent: "Footwear", emoji: "👟", items: ["Sneakers", "Formal Shoes", "Sandals", "Heels", "Boots", "Slippers"] },
  { parent: "Fashion Accessories", emoji: "👜", items: ["Belts", "Wallets", "Sunglasses", "Caps", "Scarves", "Ties"] },
  { parent: "Watches", emoji: "⌚", items: ["Smartwatches", "Analog Watches", "Digital Watches", "Luxury Watches"] },
  { parent: "Mobiles", emoji: "📱", items: ["Smartphones", "Feature Phones", "Refurbished Phones"] },
  { parent: "Computers", emoji: "💻", items: ["Laptops", "Desktops", "Monitors", "All-in-One PCs"] },
  { parent: "Computer Accessories", emoji: "🖱️", items: ["Keyboards", "Mice", "Webcams", "USB Hubs"] },
  { parent: "Audio Devices", emoji: "🎧", items: ["Headphones", "Earphones", "Speakers", "Soundbars"] },
  { parent: "Cameras", emoji: "📷", items: ["DSLR", "Mirrorless", "Action Cameras", "Lenses"] },
  { parent: "Smart Devices", emoji: "⌚", items: ["Smartwatches", "Smart Home Devices", "Fitness Bands"] },
  { parent: "Electronic Accessories", emoji: "🔌", items: ["Chargers", "Cables", "Power Banks", "Adapters"] },
  { parent: "Networking", emoji: "🌐", items: ["Routers", "Modems", "Network Switches"] },
  { parent: "Storage", emoji: "💾", items: ["SSDs", "HDDs", "Pen Drives", "Memory Cards"] },
  { parent: "Gaming", emoji: "🎮", items: ["Gaming Consoles", "Controllers", "Gaming Accessories"] },
  { parent: "Furniture", emoji: "🛋️", items: ["Sofas", "Beds", "Tables", "Chairs", "Wardrobes", "Shelves"] },
  { parent: "Home Decor", emoji: "🖼️", items: ["Wall Art", "Clocks", "Vases", "Decorative Items"] },
  { parent: "Kitchen & Dining", emoji: "🍳", items: ["Cookware", "Dinnerware", "Cutlery", "Kitchen Tools"] },
  { parent: "Home Appliances", emoji: "🏠", items: ["Refrigerators", "Washing Machines", "Microwaves", "Vacuum Cleaners"] },
  { parent: "Bedding", emoji: "🛏️", items: ["Bedsheets", "Pillows", "Blankets", "Mattresses"] },
  { parent: "Lighting", emoji: "💡", items: ["Ceiling Lights", "Table Lamps", "LED Bulbs", "Decorative Lights"] },
  { parent: "Bathroom", emoji: "🛁", items: ["Bath Mats", "Towels", "Storage", "Bathroom Accessories"] },
  { parent: "Storage & Organization", emoji: "📦", items: ["Organizers", "Containers", "Storage Boxes"] },
  { parent: "Home Improvement", emoji: "🔨", items: ["Paint", "Hardware", "Adhesives", "Fittings"] },
  { parent: "Skincare", emoji: "✨", items: ["Face Wash", "Moisturizers", "Sunscreen", "Serums"] },
  { parent: "Makeup", emoji: "💄", items: ["Foundation", "Lipstick", "Mascara", "Concealer"] },
  { parent: "Haircare", emoji: "💇", items: ["Shampoo", "Conditioner", "Hair Oil", "Hair Styling"] },
  { parent: "Fragrances", emoji: "🌸", items: ["Perfumes", "Deodorants", "Body Mists"] },
  { parent: "Personal Hygiene", emoji: "🧼", items: ["Soaps", "Body Wash", "Sanitary Products"] },
  { parent: "Men's Grooming", emoji: "🪒", items: ["Trimmers", "Shaving Kits", "Beard Care"] },
  { parent: "Beauty Tools", emoji: "💅", items: ["Makeup Brushes", "Hair Dryers", "Straighteners"] },
  { parent: "Fruits & Vegetables", emoji: "🥦", items: ["Fresh Fruits", "Fresh Vegetables", "Herbs"] },
  { parent: "Staples", emoji: "🌾", items: ["Rice", "Wheat", "Flour", "Pulses", "Grains"] },
  { parent: "Dairy", emoji: "🥛", items: ["Milk", "Cheese", "Butter", "Yogurt"] },
  { parent: "Snacks", emoji: "🍿", items: ["Chips", "Biscuits", "Namkeen", "Popcorn"] },
  { parent: "Beverages", emoji: "🥤", items: ["Tea", "Coffee", "Juices", "Soft Drinks"] },
  { parent: "Packaged Food", emoji: "🥫", items: ["Instant Noodles", "Ready-to-Eat Meals", "Canned Food"] },
  { parent: "Bakery", emoji: "🍞", items: ["Bread", "Cakes", "Cookies", "Pastries"] },
  { parent: "Spices & Condiments", emoji: "🌶️", items: ["Spices", "Sauces", "Pickles", "Cooking Oils"] },
  { parent: "Organic Food", emoji: "🌱", items: ["Organic Grains", "Organic Produce", "Natural Foods"] },
  { parent: "Fitness Equipment", emoji: "🏋️", items: ["Dumbbells", "Treadmills", "Resistance Bands"] },
  { parent: "Sports", emoji: "⚽", items: ["Cricket", "Football", "Basketball", "Badminton", "Tennis"] },
  { parent: "Yoga", emoji: "🧘", items: ["Yoga Mats", "Blocks", "Straps", "Meditation Accessories"] },
  { parent: "Outdoor Activities", emoji: "🏕️", items: ["Camping", "Hiking", "Trekking", "Fishing"] },
  { parent: "Cycling", emoji: "🚲", items: ["Bicycles", "Helmets", "Pumps", "Accessories"] },
  { parent: "Sportswear", emoji: "🏃", items: ["Jerseys", "Tracksuits", "Sports Shoes"] },
  { parent: "Nutrition", emoji: "🥤", items: ["Sports Nutrition Products"] },
  { parent: "Toys", emoji: "🧸", items: ["Action Figures", "Dolls", "Toy Cars", "Building Blocks"] },
  { parent: "Educational Toys", emoji: "🧩", items: ["STEM Kits", "Learning Toys", "Puzzles"] },
  { parent: "Board Games", emoji: "🎲", items: ["Chess", "Card Games", "Family Games"] },
  { parent: "Baby Care", emoji: "🍼", items: ["Diapers", "Wipes", "Baby Toiletries"] },
  { parent: "Baby Feeding", emoji: "🍼", items: ["Bottles", "Feeding Sets", "Sterilizers"] },
  { parent: "Baby Gear", emoji: "👶", items: ["Strollers", "Car Seats", "Baby Carriers"] },
  { parent: "School Supplies", emoji: "🎒", items: ["School Bags", "Lunch Boxes", "Water Bottles"] },
  { parent: "Books", emoji: "📚", items: ["Fiction", "Non-Fiction", "Biographies", "Novels"] },
  { parent: "Academic Books", emoji: "📖", items: ["School Books", "College Books", "Textbooks"] },
  { parent: "Competitive Exams", emoji: "📝", items: ["MPSC", "UPSC", "SSC", "Banking", "Railway"] },
  { parent: "Office Supplies", emoji: "📎", items: ["Paper", "Files", "Folders", "Staplers"] },
  { parent: "Writing Supplies", emoji: "✏️", items: ["Pens", "Pencils", "Markers", "Highlighters"] },
  { parent: "Art Supplies", emoji: "🎨", items: ["Paints", "Brushes", "Sketchbooks", "Drawing Tools"] },
  { parent: "Educational Products", emoji: "🎓", items: ["Online Courses", "Learning Kits"] },
  { parent: "Car Accessories", emoji: "🚗", items: ["Seat Covers", "Floor Mats", "Car Organizers"] },
  { parent: "Bike Accessories", emoji: "🏍️", items: ["Helmets", "Riding Gloves", "Bike Covers"] },
  { parent: "Vehicle Electronics", emoji: "📹", items: ["Dash Cameras", "GPS Devices", "Car Audio"] },
  { parent: "Spare Parts", emoji: "⚙️", items: ["Filters", "Brake Parts", "Belts", "Components"] },
  { parent: "Vehicle Care", emoji: "🧽", items: ["Car Shampoo", "Polish", "Cleaning Kits"] },
  { parent: "Tyres & Batteries", emoji: "🔋", items: ["Car Tyres", "Bike Tyres", "Batteries"] },
  { parent: "Tools", emoji: "🛠️", items: ["Repair Kits", "Air Compressors", "Tool Sets"] },
  { parent: "Hand Tools", emoji: "🔧", items: ["Hammers", "Screwdrivers", "Pliers", "Wrenches"] },
  { parent: "Power Tools", emoji: "⚡", items: ["Drills", "Grinders", "Saws", "Sanders"] },
  { parent: "Electrical Supplies", emoji: "🔌", items: ["Switches", "Wires", "Sockets", "Circuit Breakers"] },
  { parent: "Plumbing", emoji: "🚰", items: ["Pipes", "Valves", "Faucets", "Fittings"] },
  { parent: "Safety Equipment", emoji: "🦺", items: ["Gloves", "Safety Shoes", "Helmets", "Goggles"] },
  { parent: "Construction", emoji: "🏗️", items: ["Cement", "Fasteners", "Building Materials"] },
  { parent: "Industrial Equipment", emoji: "🏭", items: ["Motors", "Pumps", "Machinery Parts"] },
  { parent: "Fine Jewellery", emoji: "💎", items: ["Gold", "Silver", "Diamond", "Platinum"] },
  { parent: "Fashion Jewellery", emoji: "💍", items: ["Earrings", "Necklaces", "Bracelets", "Rings"] },
  { parent: "Men's Accessories", emoji: "🤵", items: ["Cufflinks", "Tie Pins", "Chains"] },
  { parent: "Jewellery Storage", emoji: "📿", items: ["Jewellery Boxes", "Organizers"] },
  { parent: "Precious Stones", emoji: "💎", items: ["Gemstones", "Loose Diamonds"] },
  { parent: "Handbags", emoji: "👜", items: ["Tote Bags", "Shoulder Bags", "Clutches"] },
  { parent: "Backpacks", emoji: "🎒", items: ["School Bags", "Laptop Bags", "Travel Backpacks"] },
  { parent: "Travel Luggage", emoji: "🧳", items: ["Suitcases", "Trolley Bags", "Duffel Bags"] },
  { parent: "Wallets", emoji: "👛", items: ["Men's Wallets", "Women's Wallets", "Card Holders"] },
  { parent: "Travel Accessories", emoji: "🧳", items: ["Passport Holders", "Packing Cubes", "Travel Pouches"] },
  { parent: "Health Devices", emoji: "🩺", items: ["Thermometers", "Blood Pressure Monitors", "Oximeters"] },
  { parent: "First Aid", emoji: "🩹", items: ["Bandages", "Dressings", "First-Aid Kits"] },
  { parent: "Mobility Aids", emoji: "♿", items: ["Wheelchairs", "Walkers", "Walking Sticks"] },
  { parent: "Personal Wellness", emoji: "💆", items: ["Hot Water Bottles", "Massage Devices"] },
  { parent: "Medical Supplies", emoji: "😷", items: ["Examination Gloves", "Masks", "Medical Instruments"] },
  { parent: "Dog Supplies", emoji: "🐕", items: ["Dog Food", "Collars", "Leashes", "Toys"] },
  { parent: "Cat Supplies", emoji: "🐈", items: ["Cat Food", "Litter", "Scratchers", "Toys"] },
  { parent: "Bird Supplies", emoji: "🐦", items: ["Bird Food", "Cages", "Feeders"] },
  { parent: "Fish Supplies", emoji: "🐟", items: ["Aquariums", "Filters", "Fish Food"] },
  { parent: "Pet Grooming", emoji: "🧴", items: ["Brushes", "Shampoos", "Nail Clippers"] },
  { parent: "Pet Healthcare", emoji: "🐾", items: ["Grooming and General Care Products"] },
  { parent: "Gardening", emoji: "🪴", items: ["Pots", "Planters", "Gardening Tools"] },
  { parent: "Seeds", emoji: "🌱", items: ["Vegetable Seeds", "Flower Seeds", "Crop Seeds"] },
  { parent: "Plant Care", emoji: "🌿", items: ["Soil", "Compost", "Organic Manure"] },
  { parent: "Irrigation", emoji: "💧", items: ["Sprinklers", "Drip Systems", "Watering Equipment"] },
  { parent: "Agricultural Tools", emoji: "🚜", items: ["Sprayers", "Farm Tools", "Equipment"] },
  { parent: "Outdoor Living", emoji: "🌳", items: ["Outdoor Furniture", "Garden Lighting"] },
  { parent: "Painting", emoji: "🎨", items: ["Canvas", "Paints", "Brushes", "Easels"] },
  { parent: "Craft Supplies", emoji: "✂️", items: ["Glue", "Paper", "Beads", "Craft Kits"] },
  { parent: "Handmade Products", emoji: "🧶", items: ["Handmade Decor", "Handmade Gifts"] },
  { parent: "DIY Kits", emoji: "🧰", items: ["Model Kits", "Craft Kits", "Home Projects"] },
  { parent: "Collectibles", emoji: "🏆", items: ["Coins", "Stamps", "Memorabilia"] },
  { parent: "Musical Instruments", emoji: "🎸", items: ["Guitars", "Keyboards", "Drums", "Flutes"] },
  { parent: "Audio Equipment", emoji: "🎙️", items: ["Amplifiers", "Mixers", "Microphones"] },
  { parent: "Instrument Accessories", emoji: "🎼", items: ["Strings", "Picks", "Stands"] },
  { parent: "Entertainment", emoji: "🎬", items: ["DVDs", "Music Accessories", "Media Collectibles"] },
  { parent: "Gift Items", emoji: "🎁", items: ["Gift Hampers", "Personalized Gifts", "Greeting Cards"] },
  { parent: "Occasion Gifts", emoji: "💝", items: ["Birthday", "Anniversary", "Wedding Gifts"] },
  { parent: "Festival Decor", emoji: "🪔", items: ["Diwali", "Holi", "Christmas", "Ganesh Festival"] },
  { parent: "Party Supplies", emoji: "🎈", items: ["Balloons", "Banners", "Tableware"] },
  { parent: "Flowers & Plants", emoji: "💐", items: ["Bouquets", "Indoor Plants", "Gift Plants"] },
  { parent: "Software", emoji: "💿", items: ["Productivity Software", "Business Software", "Security Software"] },
  { parent: "Website Templates", emoji: "🌐", items: ["HTML Templates", "React Templates", "Next.js Templates"] },
  { parent: "Design Assets", emoji: "🎨", items: ["UI Kits", "Figma Templates", "Icons", "Illustrations"] },
  { parent: "Digital Media", emoji: "📱", items: ["E-books", "Stock Photos", "Graphics"] },
  { parent: "Digital Learning", emoji: "🎓", items: ["Courses", "Tutorials", "Downloadable Guides"] },
  { parent: "Subscriptions", emoji: "🔑", items: ["Digital Memberships", "Software Licenses"] },
  { parent: "Solar Products", emoji: "☀️", items: ["Solar Panels", "Solar Lights", "Solar Chargers"] },
  { parent: "Power Solutions", emoji: "🔋", items: ["Inverters", "Batteries", "UPS Systems"] },
  { parent: "Energy Efficiency", emoji: "💡", items: ["LED Lighting", "Energy-Saving Devices"] },
  { parent: "Reusable Products", emoji: "♻️", items: ["Reusable Bottles", "Bags", "Food Containers"] },
  { parent: "Eco-Friendly Home", emoji: "🌍", items: ["Biodegradable Products", "Composting Kits"] },
  { parent: "Recycling Supplies", emoji: "♻️", items: ["Recycling Bins", "Waste Segregation Products"] },
  { parent: "Travel Accessories", emoji: "🧳", items: ["Neck Pillows", "Luggage Tags", "Travel Adapters"] },
  { parent: "Outdoor Gear", emoji: "🏕️", items: ["Travel Backpacks", "Camping Accessories"] },
  { parent: "Lifestyle Products", emoji: "🥤", items: ["Drinkware", "Personal Organizers"] },
  { parent: "Travel Essentials", emoji: "🧴", items: ["Toiletry Bags", "Travel Kits"] },
  { parent: "Office Furniture", emoji: "🪑", items: ["Office Chairs", "Desks", "Cabinets"] },
  { parent: "Office Electronics", emoji: "🖨️", items: ["Printers", "Scanners", "Projectors"] },
  { parent: "Printing Supplies", emoji: "🖨️", items: ["Ink", "Toner", "Paper"] },
  { parent: "Business Essentials", emoji: "📇", items: ["ID Cards", "Name Plates", "Packaging Supplies"] },
  { parent: "POS Equipment", emoji: "🧾", items: ["Barcode Scanners", "Receipt Printers", "POS Devices"] },
  { parent: "Maternity Wear", emoji: "🤰", items: ["Maternity Dresses", "Nursing Tops"] },
  { parent: "Pregnancy Accessories", emoji: "🤰", items: ["Pregnancy Pillows", "Support Belts"] },
  { parent: "Nursing Products", emoji: "🍼", items: ["Breast Pumps", "Nursing Pads"] },
  { parent: "Baby Safety", emoji: "👶", items: ["Safety Gates", "Corner Protectors"] },
  { parent: "Indian Ethnic Products", emoji: "🪷", items: ["Traditional Clothing", "Ethnic Accessories"] },
  { parent: "Regional Foods", emoji: "🍛", items: ["Regional Snacks", "Traditional Sweets"] },
  { parent: "Handloom", emoji: "🧵", items: ["Cotton Fabrics", "Handwoven Sarees"] },
  { parent: "Local Handicrafts", emoji: "🏺", items: ["Wooden Crafts", "Pottery", "Traditional Art"] },
  { parent: "Cultural Products", emoji: "🪔", items: ["Festival Items", "Traditional Decor"] },
  { parent: "Home Services", emoji: "🧹", items: ["Cleaning", "Plumbing", "Electrical Repairs"] },
  { parent: "Technology Services", emoji: "💻", items: ["Web Development", "Software Support"] },
  { parent: "Installation", emoji: "🛠️", items: ["Appliance Installation", "Equipment Setup"] },
  { parent: "Professional Services", emoji: "🤝", items: ["Consulting", "Design Services"] },
  { parent: "Event Services", emoji: "📸", items: ["Photography", "Event Planning"] },
];

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function setupSubcategories() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_subcategories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      parent_id INTEGER NOT NULL REFERENCES admin_categories(id) ON DELETE RESTRICT,
      emoji VARCHAR(16) NOT NULL DEFAULT '📁',
      image_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 1 CHECK (sort_order > 0),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_subcategories_parent_sort_idx
    ON admin_subcategories (parent_id, sort_order, id)
  `;

  const seeds = catalog.flatMap(({ parent, emoji, items }) =>
    items.map((name, index) => ({
      name,
      slug: `${toSlug(parent)}-${toSlug(name)}`,
      parent_slug: toSlug(parent),
      emoji,
      sort_order: index + 1,
    }))
  );
  const seedData = JSON.stringify(seeds);
  const missingParents = await sql`
    SELECT DISTINCT seed.parent_slug
    FROM jsonb_to_recordset(${seedData}::jsonb) AS seed(parent_slug TEXT)
    LEFT JOIN admin_categories category ON category.slug = seed.parent_slug
    WHERE category.id IS NULL
    ORDER BY seed.parent_slug
  `;
  if (missingParents.length) {
    throw new Error(
      `Create these parent categories before seeding subcategories: ${missingParents.map(row => row.parent_slug).join(", ")}`
    );
  }

  const inserted = await sql`
    INSERT INTO admin_subcategories (name, slug, parent_id, emoji, sort_order, active)
    SELECT seed.name, seed.slug, category.id, seed.emoji, seed.sort_order, TRUE
    FROM jsonb_to_recordset(${seedData}::jsonb) AS seed(
      name TEXT,
      slug TEXT,
      parent_slug TEXT,
      emoji TEXT,
      sort_order INTEGER
    )
    JOIN admin_categories category ON category.slug = seed.parent_slug
    ON CONFLICT (slug) DO NOTHING
    RETURNING id
  `;
  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_subcategories`;
  console.log(
    `Subcategories table is ready (${result[0].count} records; ${inserted.length} catalog subcategories added).`
  );
}

setupSubcategories().catch(error => {
  console.error("Failed to set up subcategories:", error);
  process.exitCode = 1;
});
