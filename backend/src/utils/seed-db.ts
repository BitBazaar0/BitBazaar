import prisma from '../lib/prisma';
import { hashPassword } from './bcrypt.util';

export const seedData = async () => {
  try {
    // Check if we already have data
    const userCount = await prisma.user.count();
    const listingCount = await prisma.listing.count();

    if (userCount > 0 || listingCount > 0) {
      console.log('⚠️  Data already exists, skipping seed...');
      return;
    }

    console.log('🌱 Seeding sample data...');

    // Hash default password
    const defaultPassword = await hashPassword('password123');

    // Create sample users
    const sampleUsers = [
      {
        email: 'gamer@bitbazaar.com',
        username: 'TechGamerPro',
        password: defaultPassword,
        firstName: 'John',
        lastName: 'Doe',
        location: 'Skopje',
        phone: '+38970123456'
      },
      {
        email: 'seller@bitbazaar.com',
        username: 'PCComponentsShop',
        password: defaultPassword,
        firstName: 'Maria',
        lastName: 'Petrovska',
        location: 'Bitola',
        phone: '+38971234567'
      },
      {
        email: 'builder@bitbazaar.com',
        username: 'CustomBuildsMK',
        password: defaultPassword,
        firstName: 'Aleksandar',
        lastName: 'Nikolov',
        location: 'Ohrid',
        phone: '+38972345678'
      }
    ];

    const createdUsers = await Promise.all(
      sampleUsers.map((user) => prisma.user.create({ data: user }))
    );

    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Create sample listings
    const sampleListings = [
      {
        title: 'NVIDIA RTX 3080 - Excellent Condition',
        description: `Used NVIDIA GeForce RTX 3080 graphics card in excellent condition. 

Features:
- 10GB GDDR6X memory
- Overclocked and well-maintained
- Never used for mining
- Original box and accessories included
- Tested and working perfectly
- Latest drivers installed

This GPU was used only for gaming, never overclocked aggressively, and always kept in a well-ventilated case. Perfect for 1440p and 4K gaming. Price negotiable for serious buyers.`,
        partType: 'GPU',
        brand: 'NVIDIA',
        model: 'RTX 3080',
        condition: 'used',
        price: 45000,
        location: 'Skopje',
        images: [
          'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800',
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
          'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800'
        ],
        sellerId: createdUsers[0].id,
        views: 245,
        isBoosted: true
      },
      {
        title: 'AMD Ryzen 9 5900X Processor - Brand New',
        description: `Brand new AMD Ryzen 9 5900X processor, still sealed in original box.

Specifications:
- 12 cores / 24 threads
- Base clock: 3.7 GHz, Boost: 4.8 GHz
- 64MB L3 cache
- AM4 socket
- Perfect for gaming and content creation

Comes with original cooler and warranty. Purchased but not needed as I decided to go with a different build. Price is firm.`,
        partType: 'CPU',
        brand: 'AMD',
        model: 'Ryzen 9 5900X',
        condition: 'new',
        price: 35000,
        location: 'Bitola',
        images: [
          'https://images.unsplash.com/photo-1588436706486-4d1d60b2f475?w=800',
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'
        ],
        sellerId: createdUsers[1].id,
        views: 189,
        isBoosted: false
      },
      {
        title: 'Corsair Vengeance RGB Pro 32GB DDR4-3200',
        description: `Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 RAM kit.

Features:
- Speed: 3200MHz
- CAS Latency: 16-18-18-36
- RGB lighting with Corsair iCUE support
- XMP 2.0 ready
- Lifetime warranty

Used for 1 year in a gaming rig, upgrading to faster RAM. All sticks tested and working perfectly. Original box included.`,
        partType: 'RAM',
        brand: 'Corsair',
        model: 'Vengeance RGB Pro',
        condition: 'used',
        price: 12000,
        location: 'Ohrid',
        images: [
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
        ],
        sellerId: createdUsers[2].id,
        views: 156,
        isBoosted: false
      },
      {
        title: 'Samsung 980 PRO 1TB NVMe SSD',
        description: `Samsung 980 PRO 1TB PCIe 4.0 NVMe SSD.

Specifications:
- Capacity: 1TB
- Interface: PCIe 4.0 x4 NVMe
- Sequential read: 7,000 MB/s
- Sequential write: 5,000 MB/s
- 5-year warranty

Used for 6 months, still has warranty. Low write cycles, excellent health. Perfect for your gaming rig or workstation.`,
        partType: 'Storage',
        brand: 'Samsung',
        model: '980 PRO',
        condition: 'used',
        price: 18000,
        location: 'Skopje',
        images: [
          'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800'
        ],
        sellerId: createdUsers[0].id,
        views: 203,
        isBoosted: true
      },
      {
        title: 'ASUS ROG Strix XG27AQ 27" 1440p 170Hz Monitor',
        description: `ASUS ROG Strix XG27AQ gaming monitor in excellent condition.

Specifications:
- 27" IPS panel
- Resolution: 2560x1440 (1440p)
- Refresh rate: 170Hz
- Response time: 1ms
- G-SYNC compatible
- HDR support

Includes original box, stand, cables, and power adapter. Perfect for competitive gaming and content creation. Minor scratch on the back, doesn't affect display quality.`,
        partType: 'Monitor',
        brand: 'ASUS',
        model: 'ROG Strix XG27AQ',
        condition: 'used',
        price: 55000,
        location: 'Bitola',
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'
        ],
        sellerId: createdUsers[1].id,
        views: 298,
        isBoosted: false
      },
      {
        title: 'Logitech G915 TKL Mechanical Keyboard',
        description: `Logitech G915 TKL wireless mechanical gaming keyboard.

Features:
- Wireless (LIGHTSPEED) with Bluetooth
- Low-profile mechanical switches (clicky)
- RGB LIGHTSYNC lighting
- USB-C charging
- Gaming-grade wireless performance

Used for 1 year, in great condition. Some keycaps show minor wear but all functions work perfectly. Includes original box, USB receiver, and cable.`,
        partType: 'Peripheral',
        brand: 'Logitech',
        model: 'G915 TKL',
        condition: 'used',
        price: 15000,
        location: 'Ohrid',
        images: [
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
        ],
        sellerId: createdUsers[2].id,
        views: 134,
        isBoosted: false
      },
      {
        title: 'ASUS ROG Strix X570-E Gaming Motherboard',
        description: `ASUS ROG Strix X570-E Gaming motherboard for AMD Ryzen processors.

Features:
- Socket: AM4
- Chipset: AMD X570
- Supports Ryzen 3000/5000 series
- PCIe 4.0 support
- WiFi 6 and 2.5G LAN
- RGB lighting and multiple fan headers

Excellent condition, used for 8 months. All original accessories and box included. BIOS updated to latest version. Perfect for high-end builds.`,
        partType: 'Motherboard',
        brand: 'ASUS',
        model: 'ROG Strix X570-E',
        condition: 'used',
        price: 25000,
        location: 'Skopje',
        images: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
          'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'
        ],
        sellerId: createdUsers[0].id,
        views: 167,
        isBoosted: false
      },
      {
        title: 'Corsair RM850x 850W 80+ Gold Modular PSU',
        description: `Corsair RM850x 850W fully modular power supply.

Specifications:
- 850W capacity
- 80+ Gold certified
- Fully modular cables
- Zero RPM fan mode
- 10-year warranty
- Compatible with all modern GPUs

Used for 2 years in a high-end gaming rig. All original cables included. Excellent efficiency and quiet operation. Perfect for RTX 3080/3090 builds.`,
        partType: 'PSU',
        brand: 'Corsair',
        model: 'RM850x',
        condition: 'used',
        price: 14000,
        location: 'Bitola',
        images: [
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
        ],
        sellerId: createdUsers[1].id,
        views: 142,
        isBoosted: false
      }
    ];

    const createdListings = await Promise.all(
      sampleListings.map((listing) => prisma.listing.create({ data: listing }))
    );

    console.log(`✅ Created ${createdListings.length} sample listings`);
    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

