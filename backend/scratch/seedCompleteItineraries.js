import pool from "../config/db.js";

const itineraries = {
    "Annapurna Base Camp": [
        { day: 1, title: "Pokhara to Ghandruk", desc: "Drive to Nayapul and trek up to the beautifully preserved Gurung village of Ghandruk. Enjoy up-close views of Annapurna South.", dist: "12km", alt: "1,940m", dur: "5-6hrs" },
        { day: 2, title: "Ghandruk to Chomrong", desc: "A steady climb through forests, descending to Kimrong Khola and ascending again to Chomrong, a major village of the region.", dist: "10km", alt: "2,170m", dur: "6hrs" },
        { day: 3, title: "Chomrong to Bamboo", desc: "Descend thousands of stone stairs to Chomrong Khola, cross a suspension bridge, and climb up to Sinuwa before descending into Bamboo forest.", dist: "8km", alt: "2,310m", dur: "5hrs" },
        { day: 4, title: "Bamboo to Deurali", desc: "Trek through cool, damp bamboo and rhododendron forests, ascending steadily past Dovan and the Hinku Cave to reach Deurali.", dist: "9km", alt: "3,230m", dur: "6hrs" },
        { day: 5, title: "Deurali to Machhapuchhre Base Camp", desc: "Trek along the Modi Khola riverbed, climbing through a rugged mountain pass into the spectacular Annapurna Sanctuary gates.", dist: "7km", alt: "3,700m", dur: "5hrs" },
        { day: 6, title: "MBC to Annapurna Base Camp", desc: "A majestic morning walk into the high-altitude glacial basin. Surround yourself with a 360-degree wall of ten towering peaks.", dist: "4km", alt: "4,130m", dur: "3hrs" },
        { day: 7, title: "ABC to Bamboo", desc: "Wake up early for a spectacular sunrise over Annapurna I. Begin a long but easy descent all the way back down to Bamboo.", dist: "13km", alt: "2,310m", dur: "6-7hrs" },
        { day: 8, title: "Bamboo to Jhinu Danda Hot Springs", desc: "Retrace steps to Chomrong, then take a steep descent to Jhinu Danda. Relax your muscles in the natural hot springs by the river.", dist: "8km", alt: "1,780m", dur: "5hrs" },
        { day: 9, title: "Jhinu Danda to Siwai & Drive to Pokhara", desc: "Trek to Siwai along the Modi Khola, followed by a scenic drive back to Pokhara to celebrate your successful trek.", dist: "6km", alt: "820m", dur: "4hrs" }
    ],
    "Everest Base Camp": [
        { day: 1, title: "Lukla to Phakding", desc: "Embark on a thrilling flight to Lukla, meet your crew, and begin a gentle downhill trek along the Dudh Koshi River to Phakding.", dist: "8km", alt: "2,610m", dur: "4hrs" },
        { day: 2, title: "Phakding to Namche Bazaar", desc: "Trek through pine forests, cross several high suspension bridges, and begin the legendary steep climb to Namche Bazaar.", dist: "11km", alt: "3,440m", dur: "6hrs" },
        { day: 3, title: "Acclimatization at Namche", desc: "Explore the bustling Sherpa capital. Hike to the Everest View Hotel for your first breathtaking look at Mt. Everest and Ama Dablam.", dist: "4km", alt: "3,440m", dur: "3hrs" },
        { day: 4, title: "Namche to Tengboche", desc: "Follow a spectacular ridgeline trail before descending to Phunki Thenga and climbing steeply through rhododendrons to Tengboche Monastery.", dist: "10km", alt: "3,860m", dur: "6hrs" },
        { day: 5, title: "Tengboche to Dingboche", desc: "Descend to Deboche, cross the Imja Khola, and walk past ancient mani walls to the summer settlement of Dingboche.", dist: "11km", alt: "4,410m", dur: "6hrs" },
        { day: 6, title: "Acclimatization at Dingboche", desc: "An essential second acclimatization day. Hike up Nangkartshang Peak for stunning views of Makalu, Lhotse, and Island Peak.", dist: "5km", alt: "4,410m", dur: "4hrs" },
        { day: 7, title: "Dingboche to Lobuche", desc: "Ascend past the Dughla Pass and the moving Sherpa memorial shrines, entering the high-altitude glacial valley of Lobuche.", dist: "9km", alt: "4,940m", dur: "6hrs" },
        { day: 8, title: "Lobuche to Gorakshep & EBC", desc: "Trek along the rocky Khumbu glacier to Gorakshep, drop your bags, and make the historic final push to Everest Base Camp.", dist: "15km", alt: "5,364m", dur: "8hrs" },
        { day: 9, title: "Gorakshep to Kala Patthar & Pheriche", desc: "Climb Kala Patthar before dawn for the ultimate sunrise over Mt. Everest. Return to Gorakshep for breakfast, then descend to Pheriche.", dist: "13km", alt: "4,371m", dur: "7hrs" },
        { day: 10, title: "Pheriche to Namche Bazaar", desc: "A satisfying downward trek as oxygen levels increase, walking back through Tengboche and descending to Namche Bazaar.", dist: "15km", alt: "3,440m", dur: "6hrs" },
        { day: 11, title: "Namche Bazaar to Lukla", desc: "A final long day of trekking back down the Dudh Koshi Valley to Lukla to share farewell drinks with your team.", dist: "19km", alt: "2,860m", dur: "7hrs" },
        { day: 12, title: "Flight Lukla to Kathmandu", desc: "Take a scenic morning flight back to Kathmandu and enjoy a free afternoon for souvenir shopping and rest.", dist: "136km (Flight)", alt: "1,400m", dur: "45mins" }
    ],
    "Mardi Himal Trek": [
        { day: 1, title: "Drive to Kande, Trek to Pothana", desc: "A short drive to Kande followed by an easy uphill climb through forests to Australian Camp and Pothana.", dist: "6km", alt: "2,125m", dur: "4hrs" },
        { day: 2, title: "Pothana to Forest Camp", desc: "Walk off the main Annapurna trail into pristine, quiet rhododendron and oak forests, climbing steadily to Forest Camp.", dist: "8km", alt: "2,520m", dur: "5hrs" },
        { day: 3, title: "Forest Camp to Low Camp", desc: "Continue ascending through silent wilderness. As you reach Low Camp, Machhapuchhre's iconic fishtail peak looms close ahead.", dist: "9km", alt: "2,970m", dur: "6hrs" },
        { day: 4, title: "Low Camp to High Camp", desc: "Ascend past the tree line onto a spectacular grassy ridge, offering dramatic panoramic views of Annapurna South and Hiunchuli.", dist: "7km", alt: "3,580m", dur: "5hrs" },
        { day: 5, title: "High Camp to Mardi Viewpoint & Low Camp", desc: "A pre-dawn hike along the ridge to Mardi Himal Viewpoint (4,500m) for an unmatched mountain sunrise, returning to Low Camp.", dist: "12km", alt: "4,500m", dur: "7-8hrs" },
        { day: 6, title: "Low Camp to Siding & Drive to Pokhara", desc: "Descend steeply through lush forest to the village of Siding, followed by a scenic jeep ride back to Pokhara.", dist: "8km", alt: "820m", dur: "5hrs" }
    ],
    "Langtang Valley Trek": [
        { day: 1, title: "Drive Kathmandu to Syabrubesi", desc: "A scenic but bumpy drive along the Trishuli River, passing through traditional villages to reach Syabrubesi.", dist: "122km (Drive)", alt: "1,550m", dur: "7-8hrs" },
        { day: 2, title: "Syabrubesi to Lama Hotel", desc: "Cross the suspension bridge and follow the Langtang Khola river upstream, climbing through oak, bamboo, and pine forests.", dist: "11km", alt: "2,480m", dur: "6hrs" },
        { day: 3, title: "Lama Hotel to Langtang Village", desc: "A steady climb through Ghoda Tabela, entering the wide alpine Langtang valley. Pass by the memorial of the 2015 earthquake.", dist: "13km", alt: "3,430m", dur: "6hrs" },
        { day: 4, title: "Langtang Village to Kyanjin Gompa", desc: "Walk past massive mani stones and chortens. Arrive at the scenic high-altitude valley of Kyanjin Gompa before lunchtime.", dist: "7km", alt: "3,870m", dur: "4hrs" },
        { day: 5, title: "Acclimatization, Hike to Tserko Ri", desc: "A challenging climb up Tserko Ri (4,984m) for an incredible panoramic view of Langtang Lirung, Yala Peak, and Tibetan glaciers.", dist: "8km", alt: "4,984m", dur: "6-7hrs" },
        { day: 6, title: "Kyanjin Gompa to Lama Hotel", desc: "Say goodbye to the glaciers and begin a long but pleasant downhill walk back to Lama Hotel.", dist: "20km", alt: "2,480m", dur: "6hrs" },
        { day: 7, title: "Lama Hotel to Syabrubesi", desc: "Complete your trek with a final descent through dense forests back to the starting point of Syabrubesi.", dist: "11km", alt: "1,550m", dur: "5hrs" },
        { day: 8, title: "Drive Syabrubesi to Kathmandu", desc: "Board your vehicle for the return drive to Kathmandu, arriving in the afternoon for hot showers and celebration.", dist: "122km (Drive)", alt: "1,400m", dur: "7hrs" }
    ],
    "Manaslu Circuit Trek": [
        { day: 1, title: "Drive Kathmandu to Soti Khola", desc: "Drive along the highway and turn off to off-road tracks to reach the starting point at Soti Khola.", dist: "140km (Drive)", alt: "700m", dur: "8hrs" },
        { day: 2, title: "Soti Khola to Machha Khola", desc: "Cross suspension bridges, trek through Sal forests, and follow the roaring Budhi Gandaki river to Machha Khola.", dist: "14km", alt: "870m", dur: "6hrs" },
        { day: 3, title: "Machha Khola to Jagat", desc: "Trek through Tatopani hot spring, climb a rocky ridge, and pass traditional Buddhist villages to reach the checkpoint at Jagat.", dist: "15km", alt: "1,340m", dur: "7hrs" },
        { day: 4, title: "Jagat to Deng", desc: "Descend to the riverbed, climb through pine and bamboo forests, and enter the restricted region at Deng.", dist: "19km", alt: "1,860m", dur: "7hrs" },
        { day: 5, title: "Deng to Namrung", desc: "A steady climb through the forest, past traditional Mani walls and stone chortens, to the beautiful viewpoint of Namrung.", dist: "18km", alt: "2,630m", dur: "7hrs" },
        { day: 6, title: "Namrung to Lho", desc: "Witness spectacular views of Mt. Manaslu. Arrive in the large Tibetan-influenced village of Lho, home to a massive monastery.", dist: "10km", alt: "3,180m", dur: "5hrs" },
        { day: 7, title: "Lho to Samagaon", desc: "A short, scenic walk through pine forests. Enter the spectacular glacial basin of Samagaon, the largest village on the route.", dist: "8km", alt: "3,530m", dur: "4hrs" },
        { day: 8, title: "Acclimatization, Hike to Manaslu Base Camp", desc: "Take a challenging day-hike to Manaslu Base Camp (4,400m) or Birendra Tal glacial lake to prepare for the high pass.", dist: "8km", alt: "4,400m", dur: "6hrs" },
        { day: 9, title: "Samagaon to Samdo", desc: "Follow the Budhi Gandaki riverbed upstream as the valley widens. Samdo is the last village before the Tibetan border.", dist: "9km", alt: "3,860m", dur: "4hrs" },
        { day: 10, title: "Samdo to Dharmasala (Larkya Phedi)", desc: "A short, slow climb through high alpine desert to the high camp shelter at Dharmasala. Rest early for the pass.", dist: "7km", alt: "4,460m", dur: "4hrs" },
        { day: 11, title: "Dharmasala to Larkya La & Bhimtang", desc: "A long, challenging pre-dawn climb to Larkya La Pass (5,160m) for jaw-dropping views of Himlung and Kang Guru, descending to Bhimtang.", dist: "20km", alt: "5,160m", dur: "9-10hrs" },
        { day: 12, title: "Bhimtang to Tilije", desc: "A spectacular downward walk through massive pine and rhododendron forests along the Dudh Khola.", dist: "14km", alt: "2,300m", dur: "6hrs" },
        { day: 13, title: "Tilije to Dharapani", desc: "Complete the final trekking leg, joining the Annapurna Circuit trail at Dharapani.", dist: "8km", alt: "1,860m", dur: "4hrs" },
        { day: 14, title: "Drive Dharapani to Kathmandu", desc: "Board a jeep to Besisahar, then a private vehicle back to Kathmandu, concluding your epic Manaslu journey.", dist: "210km (Drive)", alt: "1,400m", dur: "9hrs" }
    ],
    "Gokyo Lakes Trek": [
        { day: 1, title: "Fly to Lukla, Trek to Phakding", desc: "Fly to Lukla and begin your trek down the Dudh Koshi Valley to Phakding.", dist: "8km", alt: "2,610m", dur: "4hrs" },
        { day: 2, title: "Phakding to Namche Bazaar", desc: "Cross suspension bridges, climb steeply past Everest Viewpoint to Namche Bazaar.", dist: "11km", alt: "3,440m", dur: "6hrs" },
        { day: 3, title: "Acclimatization at Namche", desc: "Rest day to explore Namche and acclimatize, hiking to the Everest View Hotel.", dist: "4km", alt: "3,440m", dur: "3hrs" },
        { day: 4, title: "Namche to Phortse Tenga", desc: "Ascend the ridgeline and take the scenic high-route past Sanasa, descending to Phortse Tenga.", dist: "9km", alt: "3,680m", dur: "5hrs" },
        { day: 5, title: "Phortse Tenga to Dole", desc: "A steep climb out of the forest, entering the Gokyo valley with great views of Cho Oyu and Kantega.", dist: "6km", alt: "4,040m", dur: "4hrs" },
        { day: 6, title: "Dole to Machhermo", desc: "A steady ridge walk past summer pastures, climbing steadily to the small village of Machhermo.", dist: "7km", alt: "4,470m", dur: "5hrs" },
        { day: 7, title: "Machhermo to Gokyo Lakes", desc: "Ascend past the first and second lakes of Gokyo, arriving at the stunning turquoise third lake (Gokyo) by afternoon.", dist: "8km", alt: "4,750m", dur: "5hrs" },
        { day: 8, title: "Exploration of Fourth & Fifth Lakes", desc: "Walk further up the valley to Gokyo's fourth and fifth lakes for spectacular views of Everest's massive Ngozumpa Glacier.", dist: "10km", alt: "4,800m", dur: "6hrs" },
        { day: 9, title: "Gokyo Ri Sunrise & Descend to Dole", desc: "Climb Gokyo Ri (5,357m) at dawn for the ultimate panoramic view of Everest, Lhotse, Makalu, and Cho Oyu, descending to Dole.", dist: "12km", alt: "5,357m", dur: "8hrs" },
        { day: 10, title: "Dole to Namche Bazaar", desc: "Trek back down past Phortse and retrace steps along the scenic ridgeline back to Namche Bazaar.", dist: "14km", alt: "3,440m", dur: "6hrs" },
        { day: 11, title: "Namche Bazaar to Lukla", desc: "Your final long day of trekking downhill to the Lukla airport.", dist: "19km", alt: "2,860m", dur: "7hrs" },
        { day: 12, title: "Fly Lukla to Kathmandu", desc: "Scenic flight back to Kathmandu to conclude the adventure.", dist: "136km (Flight)", alt: "1,400m", dur: "45mins" }
    ],
    "Upper Mustang Trek": [
        { day: 1, title: "Fly Pokhara to Jomsom, Trek to Kagbeni", desc: "Fly through the deep Kali Gandaki Gorge to Jomsom and walk along the windy riverbed to Kagbeni.", dist: "11km", alt: "2,810m", dur: "4hrs" },
        { day: 2, title: "Kagbeni to Chele", desc: "Enter the restricted Upper Mustang region, climbing through red cliffs and dry gorges to Chele village.", dist: "15km", alt: "3,050m", dur: "6hrs" },
        { day: 3, title: "Chele to Syangboche", desc: "Cross the Taklam La pass and descend into cool valleys before climbing steeply up to Syangboche.", dist: "17km", alt: "3,800m", dur: "7hrs" },
        { day: 4, title: "Syangboche to Ghami", desc: "Walk past unique chortens and ascend high ridges before descending to Ghami, a beautiful walled village.", dist: "12km", alt: "3,520m", dur: "5hrs" },
        { day: 5, title: "Ghami to Tsarang", desc: "Pass Nepal's longest mani wall, cross the river, and hike through red cliffs to the ancient capital of Tsarang.", dist: "11km", alt: "3,560m", dur: "5hrs" },
        { day: 6, title: "Tsarang to Lo Manthang", desc: "Trek across the high desert pass to Lo Manthang, the historic walled capital of the Forbidden Kingdom.", dist: "13km", alt: "3,810m", dur: "5hrs" },
        { day: 7, title: "Exploration of Lo Manthang & Sky Caves", desc: "Explore the King's Palace, ancient Buddhist monasteries, and hike or ride a horse to Chhoser to explore the multi-story Sky Caves.", dist: "NA", alt: "3,810m", dur: "NA" },
        { day: 8, title: "Lo Manthang to Yara", desc: "Retrace steps slightly and branch east, descending through dry valleys to the remote village of Yara.", dist: "15km", alt: "3,650m", dur: "6hrs" },
        { day: 9, title: "Yara to Luri Gompa & Yara", desc: "Take a day-hike to the incredible 14th-century Luri Cave Monastery, built directly into a sandstone canyon cliff.", dist: "8km", alt: "3,900m", dur: "4hrs" },
        { day: 10, title: "Yara to Tangbe", desc: "A long, wild walk through dry valleys and river canyons to reach the traditional settlement of Tangbe.", dist: "18km", alt: "3,240m", dur: "7hrs" },
        { day: 11, title: "Tangbe to Jomsom", desc: "Complete the final trekking leg, returning to the transport hub of Jomsom.", dist: "16km", alt: "2,720m", dur: "6hrs" },
        { day: 12, title: "Fly Jomsom to Pokhara", desc: "Catch an early morning mountain flight back to Pokhara.", dist: "68km (Flight)", alt: "820m", dur: "25mins" }
    ],
    "Kanchenjunga Base Camp": [
        { day: 1, title: "Fly to Bhadrapur, Drive to Taplejung", desc: "Fly to the lowlands and take a long scenic drive up into the foothills to Taplejung.", dist: "160km (Drive)", alt: "1,820m", dur: "8hrs" },
        { day: 2, title: "Taplejung to Chirwa", desc: "Begin trekking through lush cardamom fields and Limbu villages to Chirwa.", dist: "15km", alt: "1,270m", dur: "6hrs" },
        { day: 3, title: "Chirwa to Sekathum", desc: "Follow the Tamur River upstream, crossing suspension bridges to Sekathum.", dist: "14km", alt: "1,670m", dur: "6hrs" },
        { day: 4, title: "Sekathum to Amjilosa", desc: "Trek along a narrow gorge, climbing steeply on stone steps to Amjilosa.", dist: "11km", alt: "2,395m", dur: "5hrs" },
        { day: 5, title: "Amjilosa to Gyabla", desc: "Walk through dense bamboo, oak, and rhododendron forests to the Tibetan village of Gyabla.", dist: "10km", alt: "2,730m", dur: "5hrs" },
        { day: 6, title: "Gyabla to Ghunsa", desc: "The valley widens as you climb to Ghunsa, the largest Sherpa settlement in the region.", dist: "12km", alt: "3,595m", dur: "5hrs" },
        { day: 7, title: "Acclimatization at Ghunsa", desc: "A crucial rest day. Take a short acclimatization hike to a ridge overlooking the valley.", dist: "4km", alt: "3,595m", dur: "3hrs" },
        { day: 8, title: "Ghunsa to Kambachen", desc: "Climb past pine forests and cross glacial moraine to the high summer pasture of Kambachen.", dist: "12km", alt: "4,050m", dur: "6hrs" },
        { day: 9, title: "Kambachen to Lhonak", desc: "Ascend past the lateral moraine of the Kanchenjunga Glacier to the high grassland of Lhonak.", dist: "10km", alt: "4,780m", dur: "5hrs" },
        { day: 10, title: "Lhonak to North Base Camp & Lhonak", desc: "Make the final push to Pangpema (North Base Camp, 5,143m) for an up-close look at the massive north face of Kanchenjunga.", dist: "15km", alt: "5,143m", dur: "8hrs" },
        { day: 11, title: "Lhonak to Ghunsa", desc: "Descend all the way back down past Kambachen to the hot showers of Ghunsa.", dist: "22km", alt: "3,595m", dur: "7hrs" },
        { day: 12, title: "Ghunsa to Sele La Pass Camp", desc: "Ascend a steep ridge trail through forests to the high pass campsite at Sele La.", dist: "8km", alt: "4,290m", dur: "5hrs" },
        { day: 13, title: "Sele La to Cheram via Mirgin La", desc: "Cross the high Mirgin La Pass (4,660m) for panoramic views before descending to Cheram.", dist: "12km", alt: "3,870m", dur: "7hrs" },
        { day: 14, title: "Cheram to South Base Camp & Cheram", desc: "Trek up past Oktang Glacier to South Base Camp (Oktang Viewpoint) before returning to Cheram.", dist: "14km", alt: "4,730m", dur: "7hrs" },
        { day: 15, title: "Cheram to Tortong", desc: "Enjoy a mostly downhill walk through beautiful old-growth forests to Tortong.", dist: "11km", alt: "2,995m", dur: "5hrs" },
        { day: 16, title: "Tortong to Yamphudin", desc: "Descend through lush jungle and cross a pass to the large ethnic village of Yamphudin.", dist: "15km", alt: "2,080m", dur: "6hrs" },
        { day: 17, title: "Yamphudin to Khebang", desc: "Trek past terraced hillsides and traditional farmhouses to Khebang.", dist: "12km", alt: "1,910m", dur: "5hrs" },
        { day: 18, title: "Drive to Bhadrapur, Fly to Kathmandu", desc: "Take a scenic local drive back to Bhadrapur and catch your flight home to Kathmandu.", dist: "160km (Drive)", alt: "1,400m", dur: "8hrs" }
    ],
    "Annapurna Circuit": [
        { day: 1, title: "Drive to Dharapani", desc: "A long drive along the Trishuli River, changing to a local 4WD at Besisahar to reach Dharapani.", dist: "190km (Drive)", alt: "1,860m", dur: "8-9hrs" },
        { day: 2, title: "Dharapani to Chame", desc: "Climb steadily past Tal and Bagarchhap, entering pine forests as you reach Chame, the district headquarters.", dist: "15km", alt: "2,670m", dur: "6hrs" },
        { day: 3, title: "Chame to Upper Pisang", desc: "Cross suspension bridges, walk under a massive curved rock wall, and climb to the historic village of Upper Pisang.", dist: "14km", alt: "3,300m", dur: "6hrs" },
        { day: 4, title: "Upper Pisang to Manang", desc: "Take the spectacular high-route via Ghyaru and Ngawal, offering jaw-dropping views of Annapurna II, III, and IV.", dist: "16km", alt: "3,540m", dur: "7hrs" },
        { day: 5, title: "Acclimatization at Manang", desc: "Rest and explore the uniquely dry, high valley of Manang. Hike to Gangapurna Lake or visit the local clinic.", dist: "4km", alt: "3,540m", dur: "3hrs" },
        { day: 6, title: "Manang to Yak Kharka", desc: "Ascend past the tree line, climbing steadily along the Jarsang Khola valley to Yak Kharka.", dist: "9km", alt: "4,050m", dur: "4hrs" },
        { day: 7, title: "Yak Kharka to Thorong Phedi", desc: "Walk along dry valley walls, cross a suspension bridge, and climb steadily to the high-camp base at Thorong Phedi.", dist: "7km", alt: "4,450m", dur: "4hrs" },
        { day: 8, title: "Thorong Phedi to Thorong La & Muktinath", desc: "Start before dawn. Climb to Thorong La Pass (5,416m), the highest point of the trek, and descend to the sacred Hindu temple of Muktinath.", dist: "15km", alt: "5,416m", dur: "9-10hrs" },
        { day: 9, title: "Muktinath to Marpha via Jomsom", desc: "Walk through the dry, windy Kali Gandaki Gorge, past Jomsom airport, to the historic stone village of Marpha, famous for apple orchards.", dist: "18km", alt: "2,670m", dur: "6hrs" },
        { day: 10, title: "Marpha to Ghasa", desc: "Trek or take a local drive down past beautiful pine forests, following the deepening river valley to Ghasa.", dist: "20km", alt: "2,010m", dur: "6hrs" },
        { day: 11, title: "Ghasa to Tatopani Hot Springs", desc: "Descend into the subtropical gorge. Check in at Tatopani and soak in the natural riverside hot springs.", dist: "16km", alt: "1,190m", dur: "5hrs" },
        { day: 12, title: "Tatopani to Ghorepani", desc: "A long, challenging ascent up through terraced farmlands and massive rhododendron forests to Ghorepani.", dist: "17km", alt: "2,860m", dur: "7-8hrs" },
        { day: 13, title: "Poon Hill Sunrise, Trek to Nayapul & Pokhara", desc: "Hike Poon Hill (3,210m) at dawn for an epic sunrise over Dhaulagiri, trek down to Nayapul, and drive back to Pokhara.", dist: "15km", alt: "820m", dur: "7hrs" },
        { day: 14, title: "Drive Pokhara to Kathmandu", desc: "Take a tourist bus or flight back to Kathmandu to celebrate your successful crossing.", dist: "200km (Drive)", alt: "1,400m", dur: "7hrs" }
    ],
    "Phoksundo Lake Trek": [
        { day: 1, title: "Fly to Juphal, Trek to Dunai", desc: "Take a scenic mountain flight to Juphal and begin a short, easy walk along the Bheri River to Dunai.", dist: "10km", alt: "2,140m", dur: "3hrs" },
        { day: 2, title: "Dunai to Chhepka", desc: "Follow the Phoksundo River upstream, entering the Shey Phoksundo National Park boundary to reach Chhepka.", dist: "15km", alt: "2,678m", dur: "6hrs" },
        { day: 3, title: "Chhepka to Jharana Hotel", desc: "Trek through cedar and pine forests, ascending steadily towards the high-altitude viewpoint of Jharana Hotel.", dist: "12km", alt: "3,040m", dur: "5hrs" },
        { day: 4, title: "Jharana Hotel to Phoksundo Lake", desc: "Witness the tallest waterfall in Nepal, climb over a ridge, and behold the jaw-dropping turquoise waters of Phoksundo Lake at Ringmo.", dist: "8km", alt: "3,611m", dur: "4hrs" },
        { day: 5, title: "Exploration of Ringmo & Bon Monastery", desc: "Spend a magical day exploring the unique, ancient Bon-po Buddhist monastery on the lakeside and walking along the cliffs.", dist: "NA", alt: "3,611m", dur: "NA" },
        { day: 6, title: "Ringmo to Shyanta", desc: "Retrace your steps down the valley, descending rapidly through the pine forest to Shyanta.", dist: "16km", alt: "2,520m", dur: "6hrs" },
        { day: 7, title: "Shyanta to Juphal", desc: "Trek back down past the national park gate and make a final climb back up to Juphal airport.", dist: "12km", alt: "2,475m", dur: "5hrs" },
        { day: 8, title: "Fly Juphal to Nepalgunj & Kathmandu", desc: "Catch your morning flight to Nepalgunj, followed by a connecting flight back to Kathmandu.", dist: "NA", alt: "1,400m", dur: "NA" },
        { day: 9, title: "Sightseeing in Kathmandu", desc: "Enjoy a free day to visit Swayambhunath Stupa (Monkey Temple) and enjoy a traditional farewell dinner.", dist: "NA", alt: "1,400m", dur: "NA" }
    ],
    "Makalu Base Camp Trek": [
        { day: 1, title: "Fly to Tumlingtar, Drive to Num", desc: "Fly to the hot lowlands of Tumlingtar and take a scenic 4WD drive up through cardamom fields to Num.", dist: "60km (Drive)", alt: "1,560m", dur: "5hrs" },
        { day: 2, title: "Num to Seduwa", desc: "Descend steeply to the Arun River suspension bridge, cross, and climb back up a hot stone trail to Seduwa.", dist: "12km", alt: "1,500m", dur: "5hrs" },
        { day: 3, title: "Seduwa to Tashi Gaon", desc: "A pleasant uphill climb through Sherpa villages and bamboo forests to Tashi Gaon, the last village on the route.", dist: "10km", alt: "2,100m", dur: "5hrs" },
        { day: 4, title: "Tashi Gaon to Kauma Danda", desc: "A steep, challenging climb up a high ridge, entering oak and rhododendron forests to the campsite at Kauma.", dist: "9km", alt: "3,500m", dur: "6hrs" },
        { day: 5, title: "Acclimatization at Kauma Danda", desc: "Rest and enjoy spectacular views of Kanchenjunga and Makalu, preparing your lungs for the high passes.", dist: "4km", alt: "3,500m", dur: "3hrs" },
        { day: 6, title: "Kauma to Mumbuk via Shipton La", desc: "Cross the spectacular Shipton La Pass (4,220m) for dramatic high-altitude views, descending to Mumbuk.", dist: "12km", alt: "4,220m", dur: "7-8hrs" },
        { day: 7, title: "Mumbuk to Nehe Kharka", desc: "Trek along the beautiful, pristine Barun River Valley, walking through old-growth forests to Nehe Kharka.", dist: "11km", alt: "3,700m", dur: "6hrs" },
        { day: 8, title: "Nehe Kharka to Yangri Kharka", desc: "Follow the riverbed upstream as the valley starts to open into a stunning alpine glacial meadow.", dist: "10km", alt: "4,130m", dur: "5hrs" },
        { day: 9, title: "Yangri Kharka to Langmale Kharka", desc: "Ascend past the tree line into a rugged alpine landscape, past glacial moraine to Langmale Kharka.", dist: "8km", alt: "4,410m", dur: "5hrs" },
        { day: 10, title: "Langmale Kharka to Makalu Base Camp", desc: "Make the final climb along the lateral moraine of the Barun Glacier, arriving at the base of the world's fifth highest peak.", dist: "9km", alt: "4,870m", dur: "6hrs" },
        { day: 11, title: "Exploration of Makalu Base Camp", desc: "Explore the wild, high-altitude basin. Walk to the base of Makalu's sheer south face and view Everest and Lhotse from the ridge.", dist: "NA", alt: "4,870m", dur: "NA" },
        { day: 12, title: "Base Camp to Yangri Kharka", desc: "Begin your downward trek, walking past Langmale all the way back to the meadows of Yangri Kharka.", dist: "17km", alt: "3,550m", dur: "6hrs" },
        { day: 13, title: "Yangri Kharka to Mumbuk", desc: "Retrace steps down the pristine Barun valley, descending back into the forest at Mumbuk.", dist: "14km", alt: "3,500m", dur: "6hrs" },
        { day: 14, title: "Mumbuk to Kauma Danda", desc: "Cross back over the Shipton La Pass, climbing past the glacial lakes to reach the ridge at Kauma.", dist: "12km", alt: "3,500m", dur: "7hrs" },
        { day: 15, title: "Kauma Danda to Tashi Gaon", desc: "A steep, rapid descent on stone stairs back to the Sherpa village of Tashi Gaon.", dist: "9km", alt: "2,100m", dur: "5hrs" },
        { day: 16, title: "Tashi Gaon to Seduwa", desc: "Retrace your steps past agricultural terraces and cardamom fields back to Seduwa.", dist: "10km", alt: "1,500m", dur: "5hrs" },
        { day: 17, title: "Seduwa to Num", desc: "Complete the final trekking leg, descending to the Arun River and climbing back up to Num.", dist: "12km", alt: "1,560m", dur: "5hrs" },
        { day: 18, title: "Drive to Tumlingtar & Fly to Kathmandu", desc: "Drive back down to Tumlingtar airport and catch your flight home to Kathmandu.", dist: "60km (Drive)", alt: "1,400m", dur: "6hrs" }
    ],
    "Tsum Valley Trek": [
        { day: 1, title: "Drive Kathmandu to Soti Khola", desc: "A scenic highway drive, transitioning to bumpy off-road tracks to reach Soti Khola.", dist: "140km (Drive)", alt: "700m", dur: "8hrs" },
        { day: 2, title: "Soti Khola to Machha Khola", desc: "Trek through Sal forests, cross suspension bridges, and follow the roaring Budhi Gandaki to Machha Khola.", dist: "14km", alt: "870m", dur: "6hrs" },
        { day: 3, title: "Machha Khola to Jagat", desc: "Pass by Tatopani, climb a rocky ridge, and pass traditional Buddhist villages to reach Jagat.", dist: "15km", alt: "1,340m", dur: "7hrs" },
        { day: 4, title: "Jagat to Lokpa", desc: "Trek past Philim and cross the river, branching off the main Manaslu trail into the quiet forests of Lokpa.", dist: "11km", alt: "2,240m", dur: "5hrs" },
        { day: 5, title: "Lokpa to Chumling", desc: "Climb through a wild river gorge, entering the lower Tsum Valley at the Sherpa/Tibetan village of Chumling.", dist: "13km", alt: "2,385m", dur: "6hrs" },
        { day: 6, title: "Chumling to Chhekampar", desc: "A scenic climb up the valley. Enter Upper Tsum at Chhekampar, a historic village with unique stone houses.", dist: "15km", alt: "3,010m", dur: "7hrs" },
        { day: 7, title: "Chhekampar to Nile", desc: "Follow the Shiar Khola upstream past ancient Buddhist monasteries and traditional farms to Nile.", dist: "12km", alt: "3,361m", dur: "6hrs" },
        { day: 8, title: "Nile to Mu Gompa", desc: "The final climb to the head of the valley. Arrive at Mu Gompa (3,700m), the largest and oldest monastery in Tsum.", dist: "8km", alt: "3,700m", dur: "4hrs" },
        { day: 9, title: "Exploration of Mu Gompa & Rachen Gompa", desc: "Spend a rest day exploring the massive monastery, visiting local nunneries, and viewing Ganesh Himal peaks.", dist: "NA", alt: "3,700m", dur: "NA" },
        { day: 10, title: "Mu Gompa to Chhekampar", desc: "Begin your descent back down the valley, enjoying expansive views of Ganesh Himal as you return to Chhekampar.", dist: "18km", alt: "3,010m", dur: "6hrs" },
        { day: 11, title: "Chhekampar to Gho", desc: "Retrace steps past Chumling and branch off towards the quiet forest settlement of Gho.", dist: "14km", alt: "2,485m", dur: "6hrs" },
        { day: 12, title: "Gho to Lokpa", desc: "Descend back through the wild river gorge to the entrance checkpoint at Lokpa.", dist: "11km", alt: "2,240m", dur: "5hrs" },
        { day: 13, title: "Lokpa to Soti Khola", desc: "Retrace steps downhill past Jagat and Machha Khola to the starting point at Soti Khola.", dist: "25km", alt: "700m", dur: "8hrs" },
        { day: 14, title: "Drive Soti Khola to Kathmandu", desc: "Drive back to Kathmandu, concluding your mystical Tsum Valley trek.", dist: "140km (Drive)", alt: "1,400m", dur: "8hrs" }
    ],
    "Tamang Heritage Trail": [
        { day: 1, title: "Drive Kathmandu to Syabrubesi", desc: "Take a scenic drive north past historic towns and cascading waterfalls to Syabrubesi.", dist: "122km (Drive)", alt: "1,550m", dur: "7hrs" },
        { day: 2, title: "Syabrubesi to Gatlang", desc: "Trek up through pine forests to the large, traditional black-stone Tamang village of Gatlang.", dist: "12km", alt: "2,238m", dur: "5hrs" },
        { day: 3, title: "Gatlang to Tatopani Hot Springs", desc: "Descend past traditional farm fields and make a steady ascent to the natural hot springs of Tatopani.", dist: "14km", alt: "2,607m", dur: "6hrs" },
        { day: 4, title: "Tatopani to Thuman via Nagthali", desc: "Trek up through beautiful old forests to the high viewpoint of Nagthali (3,165m) for stunning Tibet border views, descending to Thuman.", dist: "13km", alt: "2,338m", dur: "6hrs" },
        { day: 5, title: "Thuman to Briddim", desc: "Cross the Bhote Koshi River and hike through rhododendrons to the traditional homestay village of Briddim.", dist: "10km", alt: "2,229m", dur: "5hrs" },
        { day: 6, title: "Briddim to Syabrubesi & Drive to Kathmandu", desc: "Trek back down to Syabrubesi and board your return vehicle to Kathmandu.", dist: "8km", alt: "1,400m", dur: "5hrs" }
    ]
};

async function run() {
    try {
        console.log("Starting complete database itinerary seeding...");
        
        for (const [trekName, items] of Object.entries(itineraries)) {
            // Find trek ID by name
            const trekRes = await pool.query("SELECT id FROM treks WHERE name = $1", [trekName]);
            if (trekRes.rowCount === 0) {
                console.log(`Trek not found: "${trekName}", skipping...`);
                continue;
            }
            const trekId = trekRes.rows[0].id;
            
            // Clean old itinerary for this trek to avoid duplicates
            await pool.query("DELETE FROM trek_itineraries WHERE trek_id = $1", [trekId]);
            console.log(`Cleaned itineraries for "${trekName}" (ID: ${trekId})`);
            
            // Seed new complete itinerary
            for (const item of items) {
                await pool.query(
                    `INSERT INTO trek_itineraries (trek_id, day_number, title, description, distance, altitude, duration) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [trekId, item.day, item.title, item.desc, item.dist, item.alt, item.dur]
                );
            }
            console.log(`Successfully seeded ${items.length} days of itinerary for "${trekName}"!`);
        }
        
        console.log("All trek itineraries successfully completed in database!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
