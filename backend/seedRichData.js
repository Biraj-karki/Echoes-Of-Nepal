import pool from "./config/db.js";

const destinations = [
    {
        district_id: 'KASKI',
        name: 'Phewa Lake',
        category: 'Nature',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000',
        description: 'Phewa Lake is the second largest lake in Nepal, offering stunning reflections of the Machhapuchhre mountain. It is the heart of Pokhara tourism.',
        rating: 4.8,
        lat: 28.2125,
        lng: 83.9458,
        featured: true,
        highlights: ['Boating to Tal Barahi Temple', 'Stunning Machhapuchhre reflections', 'Lakeside walk and cafes', 'Bird watching'],
        best_time: 'September to May',
        things_to_do: ['Boating', 'Yoga by the lake', 'Cycling', 'Evening Arati'],
        tips: ['Rent a boat early morning for the best views', 'Visit Tal Barahi Temple in the middle of the lake', 'Carry a camera'],
        how_to_reach: 'Located in central Pokhara, easily accessible by foot, taxi, or local bus from any part of the city.',
        entry_fee: 'Free (Boat rentals extra: ~NPR 500-1000 per hour)'
    },
    {
        district_id: 'RUPANDEHI',
        name: 'Lumbini Sacred Garden',
        category: 'Religious',
        image: 'https://images.unsplash.com/photo-1598284534730-8a4d467f66a8?q=80&w=2000',
        description: 'The birthplace of Lord Buddha, Lumbini is one of the most important spiritual sites in the world, featuring the Maya Devi Temple and various international monasteries.',
        rating: 4.9,
        lat: 27.4672,
        lng: 83.2749,
        featured: true,
        highlights: ['Maya Devi Temple', 'Ashoka Pillar', 'Monastic Zone', 'World Peace Pagoda'],
        best_time: 'October to March',
        things_to_do: ['Meditation', 'Cycling tour of monasteries', 'Visiting museum', 'Sacred garden walk'],
        tips: ['Dress modestly', 'Remove shoes before entering temples', 'Hire a guide for historical context'],
        how_to_reach: 'Bhairahawa Airport is 30 mins away; daily buses from Kathmandu and Pokhara.',
        entry_fee: 'NPR 700 for Foreigners, NPR 100 for SAARC, Free for Nepalese.'
    },
    {
        district_id: 'CHITWAN',
        name: 'Chitwan National Park',
        category: 'Wildlife',
        image: 'https://images.unsplash.com/photo-1582297607733-1ee852ef76e5?q=80&w=2000',
        description: 'A UNESCO World Heritage site, Chitwan is home to One-horned Rhinoceros, Royal Bengal Tigers, and diverse bird species.',
        rating: 4.7,
        lat: 27.5341,
        lng: 84.4525,
        featured: true,
        highlights: ['One-horned Rhino sightings', 'Canoe ride on Rapti river', 'Tharu Cultural Dance', 'Elephant Breeding Center'],
        best_time: 'October to April',
        things_to_do: ['Jeep Safari', 'Jungle Walk', 'Canoeing', 'Bird Watching'],
        tips: ['Wear neutral colors for jungle walks', 'Stay in Sauraha for easy access', 'Carry insect repellent'],
        how_to_reach: '5-6 hours drive from Kathmandu or a 20-min flight to Bharatpur.',
        entry_fee: 'NPR 2000 for Foreigners, NPR 1000 for SAARC, NPR 150 for Nepalese.'
    },
    {
        district_id: 'MUGU',
        name: 'Rara Lake',
        category: 'Nature',
        image: 'https://images.unsplash.com/photo-1596395817012-709088ff0856?q=80&w=2000',
        description: 'Nepal\'s largest and deepest lake, Rara is a hidden gem in the remote Karnali region, surrounded by alpine forests and snow-capped peaks.',
        rating: 4.9,
        lat: 29.5292,
        lng: 82.0931,
        featured: true,
        highlights: ['Crystal clear blue water', 'Murma Top view', 'Horse riding around the lake', 'Rara National Park'],
        best_time: 'April to October',
        things_to_do: ['Boating', 'Hiking to Murma Top', 'Camping', 'Nature photography'],
        tips: ['Pack warm clothes even in summer', 'Carry personal medicines', 'Cash is essential'],
        how_to_reach: 'Flight to Nepalgunj then to Talcha, followed by a 3-hour trek.',
        entry_fee: 'NPR 3000 (+VAT) for Foreigners.'
    },
    {
        district_id: 'MUSTANG',
        name: 'Upper Mustang',
        category: 'Adventure',
        image: 'https://images.unsplash.com/photo-1614713560021-35205510619b?q=80&w=2000',
        description: 'The "Forbidden Kingdom" of Lo Manthang is a high-altitude desert with unique Tibetan culture, ancient caves, and dramatic red cliffs.',
        rating: 4.8,
        lat: 29.1837,
        lng: 83.9576,
        featured: true,
        highlights: ['King\'s Palace in Lo Manthang', 'Sky Caves', 'Muktinath Temple', 'Red Cliffs of Dhakmar'],
        best_time: 'April to November',
        things_to_do: ['Jeep Tour', 'Exploring Ancient Caves', 'Mountain Biking', 'Cultural Tour'],
        tips: ['Special Permit is required ($500 for 10 days)', 'Wear sunscreen for high desert sun', 'Plan for wind in the afternoon'],
        how_to_reach: 'Fly to Jomsom from Pokhara, then take a jeep; or drive via Beni.',
        entry_fee: '$500 USD Special Permit fee.'
    },
    {
        district_id: 'ILAM',
        name: 'Kanyam Tea Estate',
        category: 'Nature',
        image: 'https://images.unsplash.com/photo-1527341355448-f60bb1507fe0?q=80&w=2000',
        description: 'Known for its rolling green tea gardens, Kanyam is a popular picnic and photography spot in eastern Nepal.',
        rating: 4.6,
        lat: 26.9094,
        lng: 87.9282,
        featured: false,
        highlights: ['Endless tea gardens', 'Horse riding', 'Traditional costume photography', 'Sunrise views'],
        best_time: 'September to December',
        things_to_do: ['Tea tasting', 'Horse riding', 'Picnic', 'Local shopping'],
        tips: ['Try the local Chhurpi (hard cheese)', 'Stay in a homestay', 'Carry an umbrella'],
        how_to_reach: 'Drive from Bhadrapur or Jhapa; about 2 hours from Ilam Bazaar.',
        entry_fee: 'Free (Individual gardens may charge nominal fees).'
    },
    {
        district_id: 'MYAGDI',
        name: 'Ghorepani Poon Hill',
        category: 'Hiking',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        description: 'Poon Hill is the most famous sunrise viewpoint in the Annapurna region, offering panoramic views of Dhaulagiri and Annapurna ranges.',
        rating: 4.8,
        lat: 28.3949,
        lng: 83.7196,
        featured: true,
        highlights: ['Iconic sunrise view', 'Rhododendron forests', 'Village culture', 'Easy access'],
        best_time: 'September to May',
        things_to_do: ['Trekking', 'Photography', 'Cultural Stay'],
        tips: ['Reach the viewpoint before dawn', 'Carry a headlamp', 'Stay in Ghorepani village'],
        how_to_reach: '2-day trek from Nayapul (Pokhara).',
        entry_fee: 'ACAP Permit Required (~NPR 3000).'
    },
    {
        district_id: 'TANAHU',
        name: 'Bandipur',
        category: 'Cultural',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        description: 'A hilltop settlement with preserved Newari architecture, Bandipur is often called the "Queen of Hills" for its stunning views and atmosphere.',
        rating: 4.7,
        lat: 27.9351,
        lng: 84.4168,
        featured: true,
        highlights: ['Newari traditional houses', 'Himalayan views', 'Siddha Cave', 'No-car zone main street'],
        best_time: 'October to March',
        things_to_do: ['Relaxing', 'Caving', 'Sunset watching', 'Architecture tour'],
        tips: ['A calm alternative to busy cities', 'Try traditional Newari food', 'Visit Siddha Gufa'],
        how_to_reach: 'Turn off from Dumre on the Kathmandu-Pokhara highway; 30 mins drive up.',
        entry_fee: 'Free'
    },
    {
        district_id: 'DHANUSA',
        name: 'Janaki Temple',
        category: 'Religious',
        image: 'https://images.unsplash.com/photo-1590457493208-8df02888998f',
        description: 'An architectural masterpiece in the Mithila region, Janaki Temple is dedicated to Goddess Sita and is built in the Mughal-Hindu style.',
        rating: 4.8,
        lat: 26.7268,
        lng: 85.9268,
        featured: true,
        highlights: ['Brilliant architecture', 'Vibrant Mithila art', 'Religious significance', 'Vivah Mandap'],
        best_time: 'November to February',
        things_to_do: ['Pilgrimage', 'Mithila art workshop', 'Exploring local market'],
        tips: ['Visit during Vivah Panchami for a massive festival', 'Carry plenty of water', 'Respect local rituals'],
        how_to_reach: 'Daily flights from Kathmandu to Janakpur or 10-12 hours drive.',
        entry_fee: 'Free'
    },
    {
        district_id: 'BHAKTAPUR',
        name: 'Bhaktapur Durbar Square',
        category: 'Historical',
        image: 'https://images.unsplash.com/photo-1571473264421-c242337a6b98',
        description: 'The "City of Devotees", Bhaktapur is the best-preserved of the three valley kingdoms, famous for its pottery, woodcarving, and Juju Dhau (yogurt).',
        rating: 4.9,
        lat: 27.6722,
        lng: 85.4298,
        featured: true,
        highlights: ['55 Window Palace', 'Nyatapola Temple', 'Pottery Square', 'Peacock Window'],
        best_time: 'Year-round',
        things_to_do: ['Sightseeing', 'Pottery making', 'Tasting Juju Dhau', 'Photography'],
        tips: ['Visit Nyatapola temple at sunset', 'Buy authentic pottery directly from artisans', 'Try the famous local King Curd'],
        how_to_reach: '15km east of Kathmandu center; easily reached by taxi or bus.',
        entry_fee: 'NPR 1500 for Foreigners, NPR 500 for SAARC.'
    }
];

const treks = [
    {
        district_id: 'MYAGDI',
        name: 'Annapurna Base Camp',
        difficulty: 'Moderate',
        duration: '10-12 Days',
        altitude: '4,130m',
        image: 'https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=2000',
        description: 'The Annapurna Base Camp trek offers a spectacular 360-degree view of the Annapurna range, through diverse landscapes from terraced fields to high-altitude sanctuaries.',
        lat: 28.53,
        lng: 83.87,
        featured: true,
        highlights: ['Up-close view of Annapurna I and Machhapuchhre', 'Jhinu Danda Hot Springs', 'Ghandruk Heritage Village', 'Macchapuchhre Base Camp'],
        best_time: 'March-May, September-November',
        activities: ['Trekking', 'Cultural Immersion', 'Hot Spring Bath', 'Landscape Photography'],
        route: 'Pokhara -> Nayapul -> Ghandruk -> Chomrong -> ABC -> Nayapul',
        itinerary: [
            { day: 1, title: 'Pokhara to Ghandruk', desc: 'Drive to Nayapul and trek to the beautiful Gurung village of Ghandruk.', dist: '12km', alt: '1,940m', dur: '5-6hrs' },
            { day: 2, title: 'Ghandruk to Chomrong', desc: 'A steady climb with great views of the peaks.', dist: '10km', alt: '2,170m', dur: '6hrs' },
            { day: 3, title: 'Chomrong to Bamboo', desc: 'Descent through stone steps and climb up again through forest.', dist: '8km', alt: '2,310m', dur: '5hrs' },
            { day: 4, title: 'Bamboo to Deurali', desc: 'Ascending through bamboo and rhododendron forests.', dist: '9km', alt: '3,230m', dur: '6hrs' },
            { day: 5, title: 'Deurali to ABC', desc: 'Reaching the sanctuary with massive peaks surrounding you.', dist: '7km', alt: '4,130m', dur: '5hrs' }
        ]
    },
    {
        district_id: 'SOLUKHUMBU',
        name: 'Everest Base Camp',
        difficulty: 'Challenging',
        duration: '12-14 Days',
        altitude: '5,364m',
        image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=2000',
        description: 'The most iconic trek in the world, EBC takes you to the foot of Mt. Everest through the heart of Sherpa culture and the high-altitude trails of Khumbu.',
        lat: 28.00,
        lng: 86.84,
        featured: true,
        highlights: ['Namche Bazaar', 'Tengboche Monastery', 'Kala Patthar Viewpoint', 'Khumbu Glacier'],
        best_time: 'April-May, October-November',
        activities: ['High Altitude Trekking', 'Cultural Discovery', 'Mountain Views'],
        route: 'Lukla -> Namche -> Tengboche -> Dingboche -> Gorakshep -> EBC',
        itinerary: [
            { day: 1, title: 'Lukla to Phakding', desc: 'Scenic flight and a gentle start.', dist: '8km', alt: '2,610m', dur: '4hrs' },
            { day: 2, title: 'Phakding to Namche Bazaar', desc: 'Steep climb to the Sherpa capital.', dist: '11km', alt: '3,440m', dur: '6hrs' },
            { day: 3, title: 'Acclimatization at Namche', desc: 'Exploring the bazaar and hiking to Everest View Hotel.', dist: '4km', alt: '3,440m', dur: '3hrs' },
            { day: 4, title: 'Namche to Tengboche', desc: 'Visiting the highest monastery in the region.', dist: '10km', alt: '3,860m', dur: '6hrs' }
        ]
    },
    {
        district_id: 'KASKI',
        name: 'Mardi Himal Trek',
        difficulty: 'Moderate',
        duration: '5-7 Days',
        altitude: '4,500m',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000',
        description: 'A shorter, spectacularly scenic trek that gets you incredibly close to Mt. Machhapuchhre (Fishtail).',
        lat: 28.4715,
        lng: 83.8553,
        featured: true,
        highlights: ['Ridgeline walking with mountain views', 'Forest Camp', 'High Camp (3,700m)', 'Machhapuchhre View'],
        best_time: 'Sept-Nov, March-May',
        activities: ['Trekking', 'Camping', 'Photography'],
        route: 'Pokhara -> Kande -> Forest Camp -> High Camp -> Mardi Viewpoint',
        itinerary: [
            { day: 1, title: 'Drive to Kande, Trek to Pothana', desc: 'Easy start with Annapurna views.', dist: '6km', alt: '2,125m', dur: '4hrs' },
            { day: 2, title: 'Pothana to Forest Camp', desc: 'Walking through lush jungle.', dist: '8km', alt: '2,520m', dur: '5hrs' },
            { day: 3, title: 'Forest Camp to High Camp', desc: 'Gaining altitude on the ridge.', dist: '9km', alt: '3,780m', dur: '6hrs' },
            { day: 4, title: 'High Camp to Viewpoint & Back', desc: 'Reaching the base of Machhapuchhre.', dist: '7km', alt: '4,500m', dur: '7hrs' }
        ]
    },
    {
        district_id: 'RASUWA',
        name: 'Langtang Valley Trek',
        difficulty: 'Moderate',
        duration: '7-9 Days',
        altitude: '3,870m',
        image: 'https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=2000',
        description: 'Commonly known as the "Valley of Glaciers", Langtang offers a rich Tamang culture, stunning peaks, and beautiful forests close to Kathmandu.',
        lat: 28.2167,
        lng: 85.5667,
        featured: true,
        highlights: ['Kyanjin Gompa', 'Tserko Ri Summit (4,984m) View', 'Langtang National Park', 'Tamang heritage'],
        best_time: 'March-May, Oct-Dec',
        activities: ['Trekking', 'Cultural Stay', 'Wildlife Spotting'],
        route: 'Kathmandu -> Syabrubesi -> Langtang Village -> Kyanjin Gompa -> Syabrubesi',
        itinerary: [
            { day: 1, title: 'Drive to Syabrubesi', desc: 'Journey through winding mountain roads.', dist: '122km (Drive)', alt: '1,500m', dur: '7hrs' },
            { day: 2, title: 'Trek to Lama Hotel', desc: 'Walking along the Langtang Khola through dense forest.', dist: '11km', alt: '2,480m', dur: '6hrs' },
            { day: 3, title: 'Trek to Langtang Village', desc: 'Reaching the village rebuilt after the earthquake.', dist: '13km', alt: '3,430m', dur: '6hrs' },
            { day: 4, title: 'Trek to Kyanjin Gompa', desc: 'Walking into the high alpine valley.', dist: '7km', alt: '3,870m', dur: '4hrs' }
        ]
    },
    {
        district_id: 'GORKHA',
        name: 'Manaslu Circuit Trek',
        difficulty: 'Challenging',
        duration: '14-16 Days',
        altitude: '5,160m',
        image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=2000',
        description: 'A spectacular trek around the world\'s eighth highest peak, Manaslu. Features raw nature and untouched Tibetan culture.',
        lat: 28.5497,
        lng: 84.5597,
        featured: true,
        highlights: ['Larkya La Pass (5,160m)', 'Manaslu conservation area', 'Tibetan border views', 'Authentic mountain villages'],
        best_time: 'Sept-Nov, March-May',
        activities: ['High Pass Crossing', 'Remote Trekking', 'Cultural Research'],
        route: 'Soti Khola -> Machha Khola -> Samagaon -> Samdo -> Larkya La -> Dharapani',
        itinerary: [
            { day: 1, title: 'Machha Khola to Jagat', desc: 'Trekking along the Budhi Gandaki river.', dist: '15km', alt: '1,340m', dur: '7hrs' },
            { day: 2, title: 'Jagat to Deng', desc: 'Entering the restricted area through bamboo forests.', dist: '19km', alt: '1,860m', dur: '7hrs' },
            { day: 3, title: 'Deng to Namrung', desc: 'Witnessing the first views of Manaslu.', dist: '18km', alt: '2,630m', dur: '7hrs' },
            { day: 4, title: 'Samagaon to Samdo', desc: 'Walking towards the Tibetan border.', dist: '16km', alt: '3,860m', dur: '5hrs' },
            { day: 5, title: 'Crossing Larkya La Pass', desc: 'The longest and hardest day with rewarding views.', dist: '20km', alt: '5,160m', dur: '9hrs' }
        ]
    },
    {
        district_id: 'SOLUKHUMBU',
        name: 'Gokyo Lakes Trek',
        difficulty: 'Moderate',
        duration: '12-14 Days',
        altitude: '5,357m',
        image: 'https://images.unsplash.com/photo-1596395817012-709088ff0856?q=80&w=2000',
        description: 'An alternative to EBC that leads to the turquoise glacial lakes of Gokyo and the best panoramic view of the Everest region from Gokyo Ri.',
        lat: 27.9547,
        lng: 86.6947,
        featured: true,
        highlights: ['Turquoise Gokyo Lakes', 'Gokyo Ri Summit', 'Ngozumpa Glacier', 'Views of 4 eight-thousanders'],
        best_time: 'April-May, Oct-Nov',
        activities: ['Trekking', 'Glacier exploration', 'Photography'],
        route: 'Lukla -> Namche -> Dole -> Machhermo -> Gokyo',
        itinerary: [
            { day: 1, title: 'Namche to Dole', desc: 'Climbing out of the Khumbu valley into Gokyo.', dist: '12km', alt: '4,040m', dur: '6hrs' },
            { day: 2, title: 'Dole to Machhermo', desc: 'A steady climb with Cho Oyu views.', dist: '7km', alt: '4,410m', dur: '5hrs' },
            { day: 3, title: 'Machhermo to Gokyo Lakes', desc: 'Reaching the first, second, and third lakes.', dist: '8km', alt: '4,750m', dur: '5hrs' },
            { day: 4, title: 'Gokyo Ri Sunrise', desc: 'Best views of Everest, Lhotse, Makalu, and Cho Oyu.', dist: '4km', alt: '5,357m', dur: '4hrs' }
        ]
    },
    {
        district_id: 'MUSTANG',
        name: 'Upper Mustang Trek',
        difficulty: 'Moderate',
        duration: '12-14 Days',
        altitude: '3,810m',
        image: 'https://images.unsplash.com/photo-1614713560021-35205510619b?q=80&w=2000',
        description: 'A journey into the arid Trans-Himalayan desert region of Nepal, exploring ancient caves and the walled city of Lo Manthang.',
        lat: 29.1837,
        lng: 83.9576,
        featured: true,
        highlights: ['Lo Manthang Walled City', 'Ancient Sky Caves', 'Red Cliffs', 'Tibetan Buddhist culture'],
        best_time: 'March to November (Monsoon-free)',
        activities: ['Historical exploration', 'Cultural photography', 'Jeep Safari'],
        route: 'Jomsom -> Kagbeni -> Chele -> Ghami -> Charang -> Lo Manthang',
        itinerary: [
            { day: 1, title: 'Jomsom to Kagbeni', desc: 'Starting the trek along the Kali Gandaki riverbed.', dist: '10km', alt: '2,810m', dur: '4hrs' },
            { day: 2, title: 'Kagbeni to Chele', desc: 'Entering the restricted Upper Mustang region.', dist: '15km', alt: '3,050m', dur: '6hrs' },
            { day: 3, title: 'Chele to Syangboche', desc: 'Climbing over several high passes.', dist: '17km', alt: '3,800m', dur: '7hrs' },
            { day: 4, title: 'Lo Manthang Exploration', desc: 'Visiting the King\'s Palace and 14th-century monasteries.', dist: 'NA', alt: '3,810m', dur: 'NA' }
        ]
    },
    {
        district_id: 'TAPLEJUNG',
        name: 'Kanchenjunga Base Camp',
        difficulty: 'Challenging',
        duration: '20-22 Days',
        altitude: '5,143m',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000',
        description: 'One of the most remote and untouched treks in Nepal, leading to the base of the world\'s third-highest peak.',
        lat: 27.7032,
        lng: 88.1475,
        featured: false,
        highlights: ['Mt. Kanchenjunga Views', 'Diverse ecosystems (Forest to Glacier)', 'Limbu and Sherpa culture', 'Uncrowded trails'],
        best_time: 'Oct-Nov, March-May',
        activities: ['Wilderness Trekking', 'Cultural Research', 'Scientific Exploration'],
        route: 'Taplejung -> Ghunsa -> Kambachen -> Pangpema (North Base Camp)',
        itinerary: [
            { day: 1, title: 'Taplejung to Chirwa', desc: 'Entering the Kanchenjunga Conservation Area.', dist: '15km', alt: '1,270m', dur: '6hrs' },
            { day: 2, title: 'Chirwa to Sekathum', desc: 'Following the Tamur River through cardamom gardens.', dist: '14km', alt: '1,670m', dur: '6hrs' },
            { day: 3, title: 'Sekathum to Ghunsa', desc: 'Reaching a large Tibetan settlement.', dist: '18km', alt: '3,595m', dur: '7hrs' },
            { day: 4, title: 'Ghunsa to Kambachen', desc: 'Entering the high alpine meadows.', dist: '12km', alt: '4,050m', dur: '6hrs' },
            { day: 5, title: 'Pangpema (North Base Camp)', desc: 'Reaching the base of the mighty Kanchenjunga.', dist: '10km', alt: '5,143m', dur: '7hrs' }
        ]
    },
    {
        district_id: 'MUSTANG',
        name: 'Annapurna Circuit',
        difficulty: 'Challenging',
        duration: '12-18 Days',
        altitude: '5,416m',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000',
        description: 'Often voted the best long-distance trek in the world, the circuit crosses the Thorong La Pass and visits the sacred Muktinath temple.',
        lat: 28.7941,
        lng: 83.9514,
        featured: true,
        highlights: ['Thorong La Pass (5,416m)', 'Muktinath Temple', 'Tilicho Lake (Optional side trip)', 'Kali Gandaki Gorge'],
        best_time: 'Sept-Nov, March-May',
        activities: ['High Pass Crossing', 'Cultural Pilgrimage', 'Mountain Photography'],
        route: 'Besisahar -> Chame -> Manang -> Thorong La -> Muktinath -> Jomsom',
        itinerary: [
            { day: 1, title: 'Chame to Pisang', desc: 'Entering the alpine region with views of Annapurna II.', dist: '14km', alt: '3,300m', dur: '6hrs' },
            { day: 2, title: 'Pisang to Manang', desc: 'Acclimatization stop in the beautiful Manang village.', dist: '16km', alt: '3,540m', dur: '7hrs' },
            { day: 3, title: 'Manang to Yak Kharka', desc: 'Short climb to higher altitudes.', dist: '9km', alt: '4,050m', dur: '4hrs' },
            { day: 4, title: 'Thorong Phedi to Thorong La', desc: 'Pre-dawn start to cross the highest point of the trek.', dist: '15km', alt: '5,416m', dur: '9hrs' }
        ]
    },
    {
        district_id: 'DOLPA',
        name: 'Phoksundo Lake Trek',
        difficulty: 'Moderate',
        duration: '9-11 Days',
        altitude: '3,611m',
        image: 'https://images.unsplash.com/photo-1596395817012-709088ff0856?q=80&w=2000',
        description: 'Trek to the deepest and most stunning turquoise lake in Nepal, located in the remote and culturally rich Upper Dolpo region.',
        lat: 29.2014,
        lng: 82.9556,
        featured: true,
        highlights: ['Turquoise Phoksundo Lake', 'Suligad Waterfall', 'Bon Buddhist Culture', 'Shey Phoksundo National Park'],
        best_time: 'May to October',
        activities: ['Wilderness Trekking', 'Cultural Research', 'Nature Study'],
        route: 'Juphal -> Dunai -> Chhepka -> Jharana Hotel -> Ringmo (Phoksundo)',
        itinerary: [
            { day: 1, title: 'Juphal to Dunai', desc: 'Short trek along the Bheri River.', dist: '10km', alt: '2,140m', dur: '3hrs' },
            { day: 2, title: 'Dunai to Chhepka', desc: 'Entering the national park area.', dist: '15km', alt: '2,678m', dur: '6hrs' },
            { day: 3, title: 'Chhepka to Jharana Hotel', desc: 'Climb towards the great waterfall.', dist: '12km', alt: '3,040m', dur: '5hrs' },
            { day: 4, title: 'Ringmo (Phoksundo Lake)', desc: 'Arrival at the stunning blue lake and Bon monastery.', dist: '8km', alt: '3,611m', dur: '4hrs' }
        ]
    },
    {
        district_id: 'SOLUKHUMBU',
        name: 'Makalu Base Camp Trek',
        difficulty: 'Challenging',
        duration: '18-20 Days',
        altitude: '4,870m',
        image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=2000',
        description: 'A tough but rewarding trek to the base of the world\'s fifth highest peak, featuring remote wilderness and high alpine passes.',
        lat: 27.75,
        lng: 87.15,
        featured: false,
        highlights: ['Mt. Makalu (8,485m) Views', 'Barun Valley waterfalls', 'Shipton La Pass', 'Arun Valley biodiversity'],
        best_time: 'Sept-Nov, April-May',
        activities: ['Alpine Trekking', 'Botany Study', 'Adventure Camping'],
        route: 'Tumlingtar -> Chichila -> Num -> Sedua -> Tashi Gaon -> Makalu BC',
        itinerary: [
            { day: 1, title: 'Sedua to Tashi Gaon', desc: 'Climbing through Sherpa villages.', dist: '12km', alt: '2,100m', dur: '5hrs' },
            { day: 2, title: 'Tashi Gaon to Khongma', desc: 'Entering the high ridge area.', dist: '10km', alt: '3,500m', dur: '6hrs' },
            { day: 3, title: 'Crossing Shipton La', desc: 'Challenging pass with dramatic views.', dist: '15km', alt: '4,220m', dur: '8hrs' },
            { day: 4, title: 'Makalu Base Camp', desc: 'Final push to the awe-inspiring base of Makalu.', dist: '14km', alt: '4,870m', dur: '7hrs' }
        ]
    },
    {
        district_id: 'GORKHA',
        name: 'Tsum Valley Trek',
        difficulty: 'Moderate',
        duration: '14-16 Days',
        altitude: '3,700m',
        image: 'https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=2000',
        description: 'The "Hidden Valley of Happiness", Tsum Valley is a sacred Buddhist pilgrimage site with ancient monasteries and a unique non-violent culture.',
        lat: 28.5,
        lng: 85.0,
        featured: true,
        highlights: ['Mu Gompa', 'Rachen Gompa', 'Piren Phu Cave', 'Ganesh Himal Views'],
        best_time: 'Sept-Nov, March-May',
        activities: ['Spiritual Trekking', 'Cultural Immersion', 'Village Stay'],
        route: 'Jagat -> Lokpa -> Chumling -> Chhekampar -> Nile -> Mu Gompa',
        itinerary: [
            { day: 1, title: 'Lokpa to Chumling', desc: 'Entering the lower Tsum Valley.', dist: '13km', alt: '2,385m', dur: '6hrs' },
            { day: 2, title: 'Chumling to Chhekampar', desc: 'Entering Upper Tsum with its Tibetan influence.', dist: '15km', alt: '3,010m', dur: '7hrs' },
            { day: 3, title: 'Chhekampar to Nile', desc: 'Following the Shiar Khola upstream.', dist: '12km', alt: '3,361m', dur: '6hrs' },
            { day: 4, title: 'Mu Gompa Exploration', desc: 'Visiting the largest monastery in Tsum.', dist: '8km', alt: '3,700m', dur: '4hrs' }
        ]
    },
    {
        district_id: 'RASUWA',
        name: 'Tamang Heritage Trail',
        difficulty: 'Easy',
        duration: '5-7 Days',
        altitude: '3,165m',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000',
        description: 'A community-based trek that highlights the unique culture, traditions, and hot springs of the Tamang people near the Tibetan border.',
        lat: 28.232,
        lng: 85.352,
        featured: false,
        highlights: ['Gatlang Village', 'Tatopani Hot Springs', 'Tibetan border views', 'Authentic homestays'],
        best_time: 'Year-round (Best: Oct-May)',
        activities: ['Cultural Homestays', 'Natural Hot Spring', 'Village Walking'],
        route: 'Syabrubesi -> Gatlang -> Tatopani -> Thuman -> Briddim -> Syabrubesi',
        itinerary: [
            { day: 1, title: 'Syabrubesi to Gatlang', desc: 'Walk to the beautiful black village.', dist: '12km', alt: '2,238m', dur: '5hrs' },
            { day: 2, title: 'Gatlang to Tatopani', desc: 'En-route to the natural hot springs.', dist: '14km', alt: '2,607m', dur: '6hrs' },
            { day: 3, title: 'Tatopani to Thuman', desc: 'Walking through Nagthali viewpoint.', dist: '13km', alt: '2,338m', dur: '6hrs' },
            { day: 4, title: 'Thuman to Briddim', desc: 'Experiencing the Tibetan influenced hospitality.', dist: '10km', alt: '2,229m', dur: '5hrs' }
        ]
    }
];

async function seed() {
    try {
        console.log("Seeding started...");

        for (const dest of destinations) {
            await pool.query(
                `INSERT INTO destinations (district_id, name, category, image, description, rating, lat, lng, featured, highlights, best_time, things_to_do, tips, how_to_reach, entry_fee) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
                 ON CONFLICT (name) DO UPDATE SET 
                    highlights = EXCLUDED.highlights,
                    things_to_do = EXCLUDED.things_to_do,
                    tips = EXCLUDED.tips,
                    best_time = EXCLUDED.best_time,
                    how_to_reach = EXCLUDED.how_to_reach,
                    entry_fee = EXCLUDED.entry_fee`,
                [dest.district_id, dest.name, dest.category, dest.image, dest.description, dest.rating, dest.lat, dest.lng, dest.featured, JSON.stringify(dest.highlights), dest.best_time, JSON.stringify(dest.things_to_do), JSON.stringify(dest.tips), dest.how_to_reach, dest.entry_fee]
            );
        }

        for (const trek of treks) {
            const res = await pool.query(
                `INSERT INTO treks (district_id, name, difficulty, duration, altitude, description, featured, image, highlights, best_time, activities, route, lat, lng) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
                 ON CONFLICT (name) DO UPDATE SET
                    highlights = EXCLUDED.highlights,
                    best_time = EXCLUDED.best_time,
                    activities = EXCLUDED.activities,
                    route = EXCLUDED.route
                 RETURNING id`,
                [trek.district_id, trek.name, trek.difficulty, trek.duration, trek.altitude, trek.description, trek.featured, trek.image, JSON.stringify(trek.highlights), trek.best_time, JSON.stringify(trek.activities), trek.route, trek.lat, trek.lng]
            );
            
            const trekId = res.rows[0].id;
            // Clean old itinerary for this trek to avoid duplicates
            await pool.query("DELETE FROM trek_itineraries WHERE trek_id = $1", [trekId]);
            
            for (const item of trek.itinerary) {
                await pool.query(
                    `INSERT INTO trek_itineraries (trek_id, day_number, title, description, distance, altitude, duration) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [trekId, item.day, item.title, item.desc, item.dist, item.alt, item.dur]
                );
            }
        }

        console.log("Seeding completed successfully");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
}

seed();
