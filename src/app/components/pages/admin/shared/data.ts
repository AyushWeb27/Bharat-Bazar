import type { GroupCat, Cat, SubCat, Product, ProdRequest, TaxRule, Brand, BrandRequest } from "./types";

const G = "#009966";

export const INIT_GROUPS: GroupCat[] = [
  { id: 1, name: "Electronics & Tech",  slug: "electronics-tech",  color: "#3b82f6", cats: 4, products: 8230,  active: true  },
  { id: 2, name: "Apparel & Lifestyle", slug: "apparel-lifestyle",  color: "#ec4899", cats: 6, products: 12450, active: true  },
  { id: 3, name: "Home & Lifestyle",    slug: "home-lifestyle",     color: "#f59e0b", cats: 5, products: 5670,  active: true  },
  { id: 4, name: "Health & Wellness",   slug: "health-wellness",    color: "#10b981", cats: 3, products: 4120,  active: true  },
  { id: 5, name: "Sports & Outdoors",   slug: "sports-outdoors",    color: "#8b5cf6", cats: 3, products: 2890,  active: true  },
  { id: 6, name: "Education & Media",   slug: "education-media",    color: "#f97316", cats: 4, products: 15230, active: true  },
  { id: 7, name: "Food & Beverages",    slug: "food-beverages",     color: G,         cats: 5, products: 8910,  active: true  },
  { id: 8, name: "Kids & Baby",         slug: "kids-baby",          color: "#ef4444", cats: 3, products: 2340,  active: false },
];

export const INIT_CATS: Cat[] = [
  { id: 1,  name: "Electronics",   slug: "electronics",   group: "Electronics & Tech",  emoji: "💻", products: 4821, active: true  },
  { id: 2,  name: "Fashion",       slug: "fashion",       group: "Apparel & Lifestyle",  emoji: "👗", products: 6234, active: true  },
  { id: 3,  name: "Home & Living", slug: "home-living",   group: "Home & Lifestyle",     emoji: "🏠", products: 3102, active: true  },
  { id: 4,  name: "Beauty",        slug: "beauty",        group: "Health & Wellness",    emoji: "💄", products: 2891, active: true  },
  { id: 5,  name: "Sports",        slug: "sports",        group: "Sports & Outdoors",    emoji: "⚽", products: 1654, active: true  },
  { id: 6,  name: "Books",         slug: "books",         group: "Education & Media",    emoji: "📚", products: 9823, active: true  },
  { id: 7,  name: "Grocery",       slug: "grocery",       group: "Food & Beverages",     emoji: "🛒", products: 5412, active: true  },
  { id: 8,  name: "Toys & Games",  slug: "toys-games",    group: "Kids & Baby",          emoji: "🎮", products: 1823, active: false },
  { id: 9,  name: "Furniture",     slug: "furniture",     group: "Home & Lifestyle",     emoji: "🛋️", products: 891,  active: true  },
  { id: 10, name: "Jewellery",     slug: "jewellery",     group: "Apparel & Lifestyle",  emoji: "💍", products: 1234, active: true  },
];

export const INIT_SUBCATS: SubCat[] = [
  { id: 1,  name: "Smartphones",       parent: "Electronics",   slug: "smartphones",    products: 1823, sort: 1, active: true  },
  { id: 2,  name: "Laptops",           parent: "Electronics",   slug: "laptops",         products: 934,  sort: 2, active: true  },
  { id: 3,  name: "Tablets",           parent: "Electronics",   slug: "tablets",         products: 412,  sort: 3, active: true  },
  { id: 4,  name: "Cameras",           parent: "Electronics",   slug: "cameras",         products: 289,  sort: 4, active: true  },
  { id: 5,  name: "Men's Clothing",    parent: "Fashion",       slug: "mens-clothing",   products: 2341, sort: 1, active: true  },
  { id: 6,  name: "Women's Clothing",  parent: "Fashion",       slug: "womens-clothing", products: 3102, sort: 2, active: true  },
  { id: 7,  name: "Footwear",          parent: "Fashion",       slug: "footwear",        products: 891,  sort: 3, active: true  },
  { id: 8,  name: "Jewellery",         parent: "Fashion",       slug: "jewellery-sub",   products: 1234, sort: 4, active: true  },
  { id: 9,  name: "Furniture",         parent: "Home & Living", slug: "furniture-sub",   products: 723,  sort: 1, active: true  },
  { id: 10, name: "Kitchen",           parent: "Home & Living", slug: "kitchen",         products: 1102, sort: 2, active: true  },
  { id: 11, name: "Skincare",          parent: "Beauty",        slug: "skincare",        products: 1421, sort: 1, active: true  },
  { id: 12, name: "Haircare",          parent: "Beauty",        slug: "haircare",        products: 890,  sort: 2, active: false },
  { id: 13, name: "Cricket",           parent: "Sports",        slug: "cricket",         products: 612,  sort: 1, active: true  },
  { id: 14, name: "Fitness Equipment", parent: "Sports",        slug: "fitness",         products: 891,  sort: 2, active: true  },
];

export const INIT_PRODUCTS: Product[] = [
  { id: 1,  name: "iPhone 15 Pro Max",        sku: "APL-IP15PM-256", cat: "Electronics",   subcat: "Smartphones",      emoji: "📱", mrp: 159900, price: 134900, stock: 42,  status: "active",       featured: true  },
  { id: 2,  name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-256",   cat: "Electronics",   subcat: "Smartphones",      emoji: "📱", mrp: 129999, price: 119999, stock: 28,  status: "active",       featured: false },
  { id: 3,  name: "MacBook Pro 14\" M3",      sku: "APL-MBP14-M3",   cat: "Electronics",   subcat: "Laptops",          emoji: "💻", mrp: 199900, price: 189900, stock: 15,  status: "active",       featured: true  },
  { id: 4,  name: "Kanjeevaram Silk Saree",   sku: "FSH-KJS-RED01",  cat: "Fashion",       subcat: "Women's Clothing", emoji: "👗", mrp: 12000,  price: 8450,   stock: 118, status: "active",       featured: false },
  { id: 5,  name: "Nike Air Max 270",         sku: "SPT-NK-AM270",   cat: "Sports",        subcat: "Footwear",         emoji: "👟", mrp: 12995,  price: 10995,  stock: 64,  status: "active",       featured: false },
  { id: 6,  name: "Prestige 5L Cooker",       sku: "HOM-PRE-5L01",   cat: "Home & Living", subcat: "Kitchen",          emoji: "🍳", mrp: 2895,   price: 2199,   stock: 214, status: "active",       featured: false },
  { id: 7,  name: "Mamaearth Vitamin C",      sku: "BTY-MME-VTC50",  cat: "Beauty",        subcat: "Skincare",         emoji: "✨", mrp: 799,    price: 599,    stock: 360, status: "active",       featured: false },
  { id: 8,  name: "Atomic Habits (Book)",     sku: "EDU-BK-AH01",    cat: "Books",         subcat: "Self-Help",        emoji: "📚", mrp: 399,    price: 299,    stock: 0,   status: "out_of_stock", featured: false },
  { id: 9,  name: "Lego Creator 3-in-1",      sku: "TOY-LGO-3N101",  cat: "Toys & Games",  subcat: "Building Sets",    emoji: "🧱", mrp: 4999,   price: 3999,   stock: 8,   status: "low_stock",    featured: false },
  { id: 10, name: "Dumbbell Set 20kg",        sku: "SPT-DB-20KG",    cat: "Sports",        subcat: "Fitness",          emoji: "🏋️", mrp: 2499,   price: 1999,   stock: 45,  status: "active",       featured: false },
  { id: 11, name: "3-Seater Fabric Sofa",     sku: "HOM-SOF-3P01",   cat: "Furniture",     subcat: "Sofas",            emoji: "🛋️", mrp: 45000,  price: 32999,  stock: 12,  status: "active",       featured: false },
  { id: 12, name: "Organic Basmati Rice 5kg", sku: "GRO-RICE-5KG",   cat: "Grocery",       subcat: "Grains",           emoji: "🌾", mrp: 650,    price: 499,    stock: 0,   status: "inactive",     featured: false },
];

export const INIT_REQUESTS: ProdRequest[] = [
  { id: 1, product: "Traditional Phulkari Dupatta", vendor: "Punjab Crafts Co.",   vendorInit: "PC", cat: "Fashion",       price: 1850, date: "24 Aug 2026", status: "pending",  note: "" },
  { id: 2, product: "Organic A2 Cow Ghee 1kg",     vendor: "Anand Dairy Farm",    vendorInit: "AD", cat: "Grocery",       price: 680,  date: "24 Aug 2026", status: "pending",  note: "" },
  { id: 3, product: "Handmade Wooden Toy Set",     vendor: "Karnataka Artisans",  vendorInit: "KA", cat: "Toys & Games",  price: 1299, date: "23 Aug 2026", status: "approved", note: "High quality, approved" },
  { id: 4, product: "Ayurvedic Hair Oil 200ml",    vendor: "NatureCure Pvt Ltd",  vendorInit: "NC", cat: "Beauty",        price: 349,  date: "23 Aug 2026", status: "pending",  note: "" },
  { id: 5, product: "BPA-Free Steel Bottle 1L",    vendor: "EcoGreen Products",   vendorInit: "EG", cat: "Home & Living", price: 499,  date: "22 Aug 2026", status: "approved", note: "Eco certified" },
  { id: 6, product: "Cotton Kurta Set Men XL",     vendor: "Jaipur Fabrics Ltd",  vendorInit: "JF", cat: "Fashion",       price: 1500, date: "22 Aug 2026", status: "rejected", note: "Images blurry, resubmit" },
  { id: 7, product: "Smart LED Bulb 9W Pack-4",    vendor: "Wipro Lighting",      vendorInit: "WL", cat: "Electronics",   price: 1199, date: "21 Aug 2026", status: "pending",  note: "" },
  { id: 8, product: "Turmeric Powder 200g Organic",vendor: "Spice Garden India",  vendorInit: "SG", cat: "Grocery",       price: 89,   date: "21 Aug 2026", status: "rejected", note: "No FSSAI license provided" },
];

export const INIT_TAXES: TaxRule[] = [
  { id: 1, name: "GST Exempt",      slab: 0,  rateLabel: "0%",  type: "GST",     category: "Essential Groceries",      products: 423,  active: true  },
  { id: 2, name: "GST 5%",          slab: 5,  rateLabel: "5%",  type: "GST",     category: "Food & Packaged Goods",    products: 1821, active: true  },
  { id: 3, name: "GST 12%",         slab: 12, rateLabel: "12%", type: "GST",     category: "Books & Stationery",       products: 892,  active: true  },
  { id: 4, name: "GST 18%",         slab: 18, rateLabel: "18%", type: "GST",     category: "Electronics & Apparel",    products: 8214, active: true  },
  { id: 5, name: "GST 28%",         slab: 28, rateLabel: "28%", type: "GST",     category: "Luxury & Premium Goods",   products: 234,  active: true  },
  { id: 6, name: "IGST 5%",         slab: 5,  rateLabel: "5%",  type: "IGST",    category: "Inter-state Food Items",   products: 312,  active: true  },
  { id: 7, name: "IGST 18%",        slab: 18, rateLabel: "18%", type: "IGST",    category: "Inter-state Electronics",  products: 1923, active: true  },
  { id: 8, name: "Customs Duty 10%",slab: 10, rateLabel: "10%", type: "Customs", category: "Imported Goods",           products: 89,   active: false },
];

export const INIT_BRANDS: Brand[] = [
  { id: 1,  name: "Apple",           slug: "apple",        category: "Electronics",   logoColor: "#1d1d1f", logoInit: "A",  products: 342,  country: "USA",         countryFlag: "🇺🇸", website: "apple.com",             featured: true,  active: true,  premium: true  },
  { id: 2,  name: "Samsung",         slug: "samsung",      category: "Electronics",   logoColor: "#1428a0", logoInit: "Sa", products: 891,  country: "South Korea", countryFlag: "🇰🇷", website: "samsung.com",           featured: true,  active: true,  premium: true  },
  { id: 3,  name: "OnePlus",         slug: "oneplus",      category: "Electronics",   logoColor: "#eb0029", logoInit: "O",  products: 124,  country: "China",       countryFlag: "🇨🇳", website: "oneplus.com",           featured: false, active: true,  premium: false },
  { id: 4,  name: "boAt",            slug: "boat",         category: "Electronics",   logoColor: "#111111", logoInit: "bO", products: 234,  country: "India",       countryFlag: "🇮🇳", website: "boat-lifestyle.com",    featured: false, active: true,  premium: false },
  { id: 5,  name: "Realme",          slug: "realme",       category: "Electronics",   logoColor: "#f5a623", logoInit: "Re", products: 98,   country: "China",       countryFlag: "🇨🇳", website: "realme.com",            featured: false, active: true,  premium: false },
  { id: 6,  name: "Fabindia",        slug: "fabindia",     category: "Fashion",       logoColor: "#8B4513", logoInit: "Fi", products: 1240, country: "India",       countryFlag: "🇮🇳", website: "fabindia.com",          featured: true,  active: true,  premium: false },
  { id: 7,  name: "Manyavar",        slug: "manyavar",     category: "Fashion",       logoColor: "#722f37", logoInit: "Mv", products: 567,  country: "India",       countryFlag: "🇮🇳", website: "manyavar.com",          featured: true,  active: true,  premium: false },
  { id: 8,  name: "W for Woman",     slug: "w-for-woman",  category: "Fashion",       logoColor: "#e91e8c", logoInit: "W",  products: 678,  country: "India",       countryFlag: "🇮🇳", website: "wforwoman.com",         featured: false, active: true,  premium: false },
  { id: 9,  name: "Himalaya",        slug: "himalaya",     category: "Beauty",        logoColor: "#2d6a4f", logoInit: "Hi", products: 432,  country: "India",       countryFlag: "🇮🇳", website: "himalayawellness.com",  featured: false, active: true,  premium: false },
  { id: 10, name: "Mamaearth",       slug: "mamaearth",    category: "Beauty",        logoColor: "#52b788", logoInit: "Me", products: 289,  country: "India",       countryFlag: "🇮🇳", website: "mamaearth.in",          featured: true,  active: true,  premium: false },
  { id: 11, name: "Nike",            slug: "nike",         category: "Sports",        logoColor: "#111111", logoInit: "Ni", products: 623,  country: "USA",         countryFlag: "🇺🇸", website: "nike.com",              featured: true,  active: true,  premium: true  },
  { id: 12, name: "Adidas",          slug: "adidas",       category: "Sports",        logoColor: "#111111", logoInit: "Ad", products: 534,  country: "Germany",     countryFlag: "🇩🇪", website: "adidas.com",            featured: true,  active: true,  premium: true  },
  { id: 13, name: "Decathlon",       slug: "decathlon",    category: "Sports",        logoColor: "#0082c3", logoInit: "Dc", products: 891,  country: "France",      countryFlag: "🇫🇷", website: "decathlon.in",          featured: false, active: true,  premium: false },
  { id: 14, name: "Prestige",        slug: "prestige",     category: "Home & Living", logoColor: "#c41e3a", logoInit: "Pr", products: 234,  country: "India",       countryFlag: "🇮🇳", website: "prestigeindia.com",     featured: false, active: true,  premium: false },
  { id: 15, name: "Asian Paints",    slug: "asian-paints", category: "Home & Living", logoColor: "#ff6600", logoInit: "AP", products: 123,  country: "India",       countryFlag: "🇮🇳", website: "asianpaints.com",       featured: false, active: true,  premium: false },
  { id: 16, name: "Amul",            slug: "amul",         category: "Grocery",       logoColor: "#ef4444", logoInit: "Am", products: 156,  country: "India",       countryFlag: "🇮🇳", website: "amul.com",              featured: true,  active: true,  premium: false },
  { id: 17, name: "Nestlé India",    slug: "nestle",       category: "Grocery",       logoColor: "#0052cc", logoInit: "Ne", products: 98,   country: "Switzerland", countryFlag: "🇨🇭", website: "nestle.in",             featured: false, active: true,  premium: false },
  { id: 18, name: "Puma",            slug: "puma",         category: "Sports",        logoColor: "#111111", logoInit: "Pu", products: 342,  country: "Germany",     countryFlag: "🇩🇪", website: "puma.com",              featured: false, active: false, premium: false },
];

export const INIT_BRAND_REQUESTS: BrandRequest[] = [
  { id: 1, brandName: "Kama Ayurveda",      owner: "Kama Retail Pvt Ltd",    ownerInit: "KA", category: "Beauty",        website: "kamaayurveda.com",    country: "India",       date: "24 Aug 2026", status: "pending",  note: "" },
  { id: 2, brandName: "Forest Essentials",  owner: "Mountain Valley Springs",ownerInit: "FE", category: "Beauty",        website: "forestessentials.com",country: "India",       date: "24 Aug 2026", status: "pending",  note: "" },
  { id: 3, brandName: "Taneira",            owner: "Titan Company Ltd",      ownerInit: "TN", category: "Fashion",       website: "taneirasaree.com",    country: "India",       date: "23 Aug 2026", status: "approved", note: "Tata group brand — verified" },
  { id: 4, brandName: "EcoSoul Home",       owner: "EcoSoul Pvt Ltd",        ownerInit: "ES", category: "Home & Living", website: "ecosoulhome.com",     country: "India",       date: "23 Aug 2026", status: "pending",  note: "" },
  { id: 5, brandName: "Noise",              owner: "Go Noise Technologies",  ownerInit: "NO", category: "Electronics",   website: "gonoise.com",         country: "India",       date: "22 Aug 2026", status: "approved", note: "Popular wearables brand" },
  { id: 6, brandName: "FabAlley",           owner: "High Street Essentials", ownerInit: "FA", category: "Fashion",       website: "faballey.com",        country: "India",       date: "22 Aug 2026", status: "rejected", note: "Incomplete GST documentation" },
  { id: 7, brandName: "Sleepy Owl Coffee",  owner: "Sleepy Owl Coffee LLP",  ownerInit: "SO", category: "Grocery",       website: "sleepyowlcoffee.com", country: "India",       date: "21 Aug 2026", status: "pending",  note: "" },
];

export const revenueData = [
  { day: "19 Aug", revenue: 68.4,  orders: 1241 },
  { day: "20 Aug", revenue: 72.8,  orders: 1384 },
  { day: "21 Aug", revenue: 65.2,  orders: 1192 },
  { day: "22 Aug", revenue: 89.6,  orders: 1627 },
  { day: "23 Aug", revenue: 94.1,  orders: 1714 },
  { day: "24 Aug", revenue: 112.3, orders: 2043 },
  { day: "Today",  revenue: 98.7,  orders: 1847 },
];

export const orderStatus = [
  { name: "Delivered",  value: 8420, color: G        },
  { name: "Shipped",    value: 3840, color: "#f59e0b" },
  { name: "Processing", value: 2130, color: "#3b82f6" },
  { name: "Cancelled",  value: 680,  color: "#ef4444" },
  { name: "Returned",   value: 430,  color: "#8b5cf6" },
];

export const catRevData = [
  { cat: "Electronics", revenue: 41.2 },
  { cat: "Fashion",     revenue: 28.6 },
  { cat: "Home",        revenue: 15.4 },
  { cat: "Beauty",      revenue: 8.9  },
  { cat: "Sports",      revenue: 4.6  },
];

export const recentOrders = [
  { id: "BB-89421", customer: "Priya Sharma",  av: "PS", items: 3, amount: 35999, status: "Delivered",  time: "11:42 AM", city: "Mumbai"    },
  { id: "BB-89420", customer: "Rahul Verma",   av: "RV", items: 1, amount: 8450,  status: "Processing", time: "11:38 AM", city: "Jaipur"    },
  { id: "BB-89419", customer: "Ananya Singh",  av: "AS", items: 5, amount: 2890,  status: "Shipped",    time: "11:22 AM", city: "Delhi"     },
  { id: "BB-89418", customer: "Vikram Nair",   av: "VN", items: 2, amount: 14200, status: "Delivered",  time: "10:58 AM", city: "Kochi"     },
  { id: "BB-89417", customer: "Sunita Patel",  av: "SP", items: 1, amount: 599,   status: "Cancelled",  time: "10:44 AM", city: "Surat"     },
  { id: "BB-89416", customer: "Arjun Mehta",   av: "AM", items: 4, amount: 6780,  status: "Shipped",    time: "10:30 AM", city: "Pune"      },
  { id: "BB-89415", customer: "Kavitha Reddy", av: "KR", items: 2, amount: 21500, status: "Processing", time: "10:15 AM", city: "Hyderabad" },
  { id: "BB-89414", customer: "Mohammed Khan", av: "MK", items: 1, amount: 3299,  status: "Delivered",  time: "09:52 AM", city: "Chennai"   },
];

export const topProducts = [
  { name: "iPhone 15 Pro Max",       cat: "Electronics", sold: 284, revenue: 284 * 134900, stock: 42  },
  { name: "Kanjeevaram Silk Saree",  cat: "Fashion",     sold: 431, revenue: 431 * 8450,   stock: 118 },
  { name: "OnePlus Nord CE 3 Lite",  cat: "Electronics", sold: 612, revenue: 612 * 19999,  stock: 89  },
  { name: "Prestige Cooker",         cat: "Home",        sold: 389, revenue: 389 * 2199,   stock: 214 },
  { name: "Mamaearth Face Serum",    cat: "Beauty",      sold: 821, revenue: 821 * 599,    stock: 360 },
];

export const NOTIFICATIONS = [
  { msg: "1,847 orders pending dispatch",    time: "Just now",  urgent: true  },
  { msg: "12 products out of stock",         time: "8 min ago", urgent: true  },
  { msg: "Daily target ₹1Cr achieved!",      time: "1 hr ago",  urgent: false },
  { msg: "New admin registered: dev@bb.com", time: "2 hr ago",  urgent: false },
];
