import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const artistMediaDir = path.join(root, "public", "media", "artists");
const eventMediaDir = path.join(root, "public", "media", "events");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function tint(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: Math.max(0, Math.min(255, Math.round(r + (255 - r) * amount))),
    g: Math.max(0, Math.min(255, Math.round(g + (255 - g) * amount))),
    b: Math.max(0, Math.min(255, Math.round(b + (255 - b) * amount)))
  });
}

function shade(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: Math.max(0, Math.min(255, Math.round(r * (1 - amount)))),
    g: Math.max(0, Math.min(255, Math.round(g * (1 - amount)))),
    b: Math.max(0, Math.min(255, Math.round(b * (1 - amount))))
  });
}

function initials(name) {
  const parts = name.replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const roleCycle = [
  "主舞台焦点",
  "现场气氛担当",
  "高辨识 vocal tone",
  "fan-cam 热门成员",
  "舞台能量中轴",
  "视觉与表演亮点"
];

const memberProfileCycle = [
  "适合优先补充饭拍高频站位、安可互动和现场应援点的观察。",
  "适合在指南里记录舞台段落、服装变化和粉丝常提到的看点。",
  "适合承接首次入坑用户最容易搜到的代表舞台和现场表现关键词。",
  "适合收纳抢票后选座时最常被问到的视角偏好和舞台覆盖范围。",
  "适合在艺人页里沉淀同场观演体验、返图热区和安可环节提示。",
  "适合补充成员相关应援点、拍照时机和舞台互动记忆点。"
];

const artistSeeds = [
  {
    slug: "andteam",
    name: "&TEAM",
    nameKo: "앤팀",
    fandom: "LUNE",
    accent: "#6b6f8f",
    agency: "YX LABELS",
    debutYear: 2022,
    origin: "Japan / South Korea",
    officialUrl: "https://weverse.io/andteam",
    genres: ["Performance", "Japan", "Travel"],
    tagline: "Japan-first routing with clear travel planning needs",
    intro: "适合把日本城市场馆、电子票流程和跨境观演交通组织在同一页里。",
    members: ["K", "Fuma", "Nicholas", "EJ", "Yuma", "Jo", "Harua", "Taki", "Maki"]
  },
  {
    slug: "aespa",
    name: "aespa",
    nameKo: "에스파",
    fandom: "MY",
    accent: "#5377a4",
    agency: "SM Entertainment",
    debutYear: 2020,
    origin: "South Korea",
    officialUrl: "https://weverse.io/aespa",
    genres: ["Arena", "Global", "Visual"],
    tagline: "High-concept live production with global routing",
    intro: "适合承接亚洲和北美城市的巡演卡片，以及选座和视线建议。",
    members: ["Karina", "Winter", "Giselle", "Ningning"]
  },
  {
    slug: "ateez",
    name: "ATEEZ",
    nameKo: "에이티즈",
    fandom: "ATINY",
    accent: "#694f43",
    agency: "KQ Entertainment",
    debutYear: 2018,
    origin: "South Korea",
    officialUrl: "https://ateez.kqent.com/",
    genres: ["Arena", "Europe", "North America"],
    tagline: "Global routing with strong travel fandom coordination",
    intro: "适合覆盖欧美、日韩和亚洲多地观演攻略与同城同行内容。",
    members: ["Hongjoong", "Seonghwa", "Yunho", "Yeosang", "San", "Mingi", "Wooyoung", "Jongho"]
  },
  {
    slug: "babymonster",
    name: "BABYMONSTER",
    nameKo: "베이비몬스터",
    fandom: "MONSTIEZ",
    accent: "#544f3f",
    agency: "YG Entertainment",
    debutYear: 2024,
    origin: "South Korea",
    officialUrl: "https://www.ygfamily.com/artist/Main.asp?LANGDIV=K&ATYPE=2&ARTIDX=70",
    genres: ["Rookie", "Asia", "Fandom"],
    tagline: "Rising new-gen act with fast-expanding live demand",
    intro: "适合作为新生代女团页样板，承接第一次跨城观演的中文说明。",
    members: ["Ruka", "Pharita", "Asa", "Ahyeon", "Rami", "Rora", "Chiquita"]
  },
  {
    slug: "bibi",
    name: "BIBI",
    nameKo: "비비",
    fandom: "BIBI BUL",
    accent: "#8b5a62",
    agency: "Feel Ghood Music",
    debutYear: 2019,
    origin: "South Korea",
    officialUrl: "https://www.instagram.com/nakedbibi/",
    genres: ["Solo", "Festival", "R&B"],
    tagline: "Solo performance identity with crossover audience appeal",
    intro: "适合承接 festival、剧场和海外音乐节信息的中文整理。",
    members: ["BIBI"]
  },
  {
    slug: "blackpink",
    name: "BLACKPINK",
    nameKo: "블랙핑크",
    fandom: "BLINK",
    accent: "#2a1c1f",
    agency: "YG Entertainment",
    debutYear: 2016,
    origin: "South Korea",
    officialUrl: "https://www.blackpinkmusic.com/",
    genres: ["Stadium", "Global", "VIP"],
    tagline: "Global stadium headliner with the widest mainstream pull",
    intro: "适合验证体育场大场、欧美 presale 节点和高需求城市攻略。",
    members: ["Jisoo", "Jennie", "Rosé", "Lisa"]
  },
  {
    slug: "boynextdoor",
    name: "BOYNEXTDOOR",
    nameKo: "보이넥스트도어",
    fandom: "ONEDOOR",
    accent: "#5a6d43",
    agency: "KOZ Entertainment",
    debutYear: 2023,
    origin: "South Korea",
    officialUrl: "https://weverse.io/boynextdoor",
    genres: ["Fancon", "Rookie", "Travel"],
    tagline: "Fast-growing fandom with strong event-planning needs",
    intro: "适合承接 fancon、站席和小型 arena 场馆的中文购票说明。",
    members: ["Sungho", "Riwoo", "Jaehyun", "Taesan", "Leehan", "Woonhak"]
  },
  {
    slug: "bts",
    name: "BTS",
    nameKo: "방탄소년단",
    fandom: "ARMY",
    accent: "#40344a",
    agency: "BIGHIT MUSIC",
    debutYear: 2013,
    origin: "South Korea",
    officialUrl: "https://weverse.io/bts",
    genres: ["Stadium", "Global", "Membership"],
    tagline: "Global benchmark for K-pop touring attention",
    intro: "适合作为全站最高优先级的长期监测页，整理官方入口、会员预售和复出巡演雷达。",
    members: ["RM", "Jin", "SUGA", "j-hope", "Jimin", "V", "Jung Kook"]
  },
  {
    slug: "day6",
    name: "DAY6",
    nameKo: "데이식스",
    fandom: "My Day",
    accent: "#6e6550",
    agency: "JYP Entertainment",
    debutYear: 2015,
    origin: "South Korea",
    officialUrl: "https://day6.jype.com/",
    genres: ["Band", "Arena", "Korea"],
    tagline: "Band concerts that benefit from venue acoustics and seated-view notes",
    intro: "适合作为乐队场页样板，重点解释场馆音场、坐席和散场交通。",
    members: ["Sungjin", "Young K", "Wonpil", "Dowoon"]
  },
  {
    slug: "enhypen",
    name: "ENHYPEN",
    nameKo: "엔하이픈",
    fandom: "ENGENE",
    accent: "#6d5945",
    agency: "BELIFT LAB",
    debutYear: 2020,
    origin: "South Korea",
    officialUrl: "https://weverse.io/enhypen",
    genres: ["Arena", "North America", "Asia"],
    tagline: "High-demand routing across Asia and North America",
    intro: "适合做高热场次的购票路径、周边住宿和支付方式说明。",
    members: ["Jungwon", "Heeseung", "Jay", "Jake", "Sunghoon", "Sunoo", "Ni-ki"]
  },
  {
    slug: "exo",
    name: "EXO",
    nameKo: "엑소",
    fandom: "EXO-L",
    accent: "#7b6b5b",
    agency: "SM Entertainment",
    debutYear: 2012,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Legacy", "Arena", "Asia"],
    tagline: "Legacy fandom with sustained interest in reunion and solo routing",
    intro: "适合承接大型 legacy fandom 的长期巡演监测和团体回归雷达。",
    members: ["Xiumin", "Suho", "Baekhyun", "Chen", "Chanyeol", "D.O.", "Kai", "Sehun"]
  },
  {
    slug: "fromis-9",
    name: "fromis_9",
    nameKo: "프로미스나인",
    fandom: "flover",
    accent: "#5b8a79",
    agency: "ASND",
    debutYear: 2018,
    origin: "South Korea",
    officialUrl: "https://weverse.io/fromis9",
    genres: ["Fandom", "Korea", "Live"],
    tagline: "Core fandom page suited for slower but deeper content coverage",
    intro: "适合作为中高粘性 fandom 的长期追踪页和观演经验沉淀入口。",
    members: ["Saerom", "Hayoung", "Jiwon", "Jisun", "Seoyeon", "Chaeyoung", "Nagyung", "Jiheon"]
  },
  {
    slug: "gidle",
    name: "i-dle",
    nameKo: "아이들",
    fandom: "NEVERLAND",
    accent: "#7d5b6d",
    agency: "Cube Entertainment",
    debutYear: 2018,
    origin: "South Korea",
    officialUrl: "https://www.cubeent.co.kr/gidle",
    genres: ["Global", "Arena", "Festival"],
    tagline: "International fandom with strong multilingual crossover",
    intro: "适合作为多语言粉圈共同关注艺人的中文信息入口。",
    members: ["Miyeon", "Minnie", "Soyeon", "Yuqi", "Shuhua"]
  },
  {
    slug: "illit",
    name: "ILLIT",
    nameKo: "아일릿",
    fandom: "GLLIT",
    accent: "#8a6f5d",
    agency: "BELIFT LAB",
    debutYear: 2024,
    origin: "South Korea",
    officialUrl: "https://weverse.io/illit",
    genres: ["Rookie", "Asia", "Pop"],
    tagline: "Emerging group worth tracking before full world-tour scale",
    intro: "适合作为新生代艺人页模板，先铺官方入口和巡演计划雷达。",
    members: ["Yunah", "Minju", "Moka", "Wonhee", "Iroha"]
  },
  {
    slug: "itzy",
    name: "ITZY",
    nameKo: "있지",
    fandom: "MIDZY",
    accent: "#7d5d4f",
    agency: "JYP Entertainment",
    debutYear: 2019,
    origin: "South Korea",
    officialUrl: "https://itzy.jype.com/",
    genres: ["Arena", "Asia", "Performance"],
    tagline: "Frequent routing makes them ideal for recurring event tracking",
    intro: "适合作为稳定多站点巡演的艺人监测页和选座说明样板。",
    members: ["Yeji", "Lia", "Ryujin", "Chaeryeong", "Yuna"]
  },
  {
    slug: "ive",
    name: "IVE",
    nameKo: "아이브",
    fandom: "DIVE",
    accent: "#7e5265",
    agency: "Starship Entertainment",
    debutYear: 2021,
    origin: "South Korea",
    officialUrl: "https://www.ive-official.com/",
    genres: ["Asia", "Arena", "Travel"],
    tagline: "Strong Asia routing and high demand for ticketing guides",
    intro: "适合作为亚洲城市攻略和多平台售票说明的内容样本。",
    members: ["Yujin", "Gaeul", "Rei", "Wonyoung", "Liz", "Leeseo"]
  },
  {
    slug: "iu",
    name: "IU",
    nameKo: "아이유",
    fandom: "UAENA",
    accent: "#8a7287",
    agency: "EDAM Entertainment",
    debutYear: 2008,
    origin: "South Korea",
    officialUrl: "https://www.iu-official.com/",
    genres: ["Solo", "Stadium", "Legacy"],
    tagline: "Solo headline act with high-value seat-selection questions",
    intro: "适合作为 solo 顶流艺人的观演攻略页，重点解释视角、舞台距离和票档选择。",
    members: ["IU"]
  },
  {
    slug: "j-hope",
    name: "j-hope",
    nameKo: "제이홉",
    fandom: "ARMY",
    accent: "#8a6246",
    agency: "BIGHIT MUSIC",
    debutYear: 2022,
    origin: "South Korea",
    officialUrl: "https://weverse.io/jhope",
    genres: ["Solo", "Festival", "Travel"],
    tagline: "Solo routing that blends festival slots and arena demand",
    intro: "适合作为 BTS solo 页模板，承接首尔、北美和亚洲城市观演攻略。",
    members: ["j-hope"]
  },
  {
    slug: "jimin",
    name: "Jimin",
    nameKo: "지민",
    fandom: "ARMY",
    accent: "#7f6578",
    agency: "BIGHIT MUSIC",
    debutYear: 2023,
    origin: "South Korea",
    officialUrl: "https://weverse.io/jimin",
    genres: ["Solo", "Global", "Visual"],
    tagline: "High solo visibility with strong crossover demand",
    intro: "适合作为高关注 solo 艺人的长期追踪页和官方入口页。",
    members: ["Jimin"]
  },
  {
    slug: "jin",
    name: "Jin",
    nameKo: "진",
    fandom: "ARMY",
    accent: "#6a7a8d",
    agency: "BIGHIT MUSIC",
    debutYear: 2024,
    origin: "South Korea",
    officialUrl: "https://weverse.io/jin",
    genres: ["Solo", "Arena", "Membership"],
    tagline: "Solo touring attention backed by global BTS fandom",
    intro: "适合作为 solo artist 页面模板，承接会员预售和海外城市排期。",
    members: ["Jin"]
  },
  {
    slug: "jung-kook",
    name: "Jung Kook",
    nameKo: "정국",
    fandom: "ARMY",
    accent: "#5a6c55",
    agency: "BIGHIT MUSIC",
    debutYear: 2023,
    origin: "South Korea",
    officialUrl: "https://weverse.io/jungkook",
    genres: ["Solo", "Global", "Arena"],
    tagline: "Massive crossover demand for solo live dates",
    intro: "适合作为全球高热 solo 场的官方入口和巡演雷达页。",
    members: ["Jung Kook"]
  },
  {
    slug: "katseye",
    name: "KATSEYE",
    nameKo: "캣츠아이",
    fandom: "EYEKONS",
    accent: "#8e6354",
    agency: "HYBE x Geffen",
    debutYear: 2024,
    origin: "Global",
    officialUrl: "https://weverse.io/katseye",
    genres: ["Global", "Showcase", "Fandom"],
    tagline: "Global fandom overlap and growing live interest",
    intro: "适合作为全球向女团页面模板，承接英语圈与中文圈共同关注的话题。",
    members: ["Manon", "Sophia", "Daniela", "Lara", "Megan", "Yoonchae"]
  },
  {
    slug: "kiss-of-life",
    name: "KISS OF LIFE",
    nameKo: "키스오브라이프",
    fandom: "KISSY",
    accent: "#8d4c45",
    agency: "S2 Entertainment",
    debutYear: 2023,
    origin: "South Korea",
    officialUrl: "https://www.s2ent.co.kr/",
    genres: ["Club", "Festival", "Asia"],
    tagline: "Fast-growing live interest with venue-size questions",
    intro: "适合作为中型场馆和 festival 兼容型女团页面。",
    members: ["Julie", "Natty", "Belle", "Haneul"]
  },
  {
    slug: "le-sserafim",
    name: "LE SSERAFIM",
    nameKo: "르세라핌",
    fandom: "FEARNOT",
    accent: "#49614d",
    agency: "SOURCE MUSIC",
    debutYear: 2022,
    origin: "South Korea",
    officialUrl: "https://weverse.io/lesserafim",
    genres: ["Arena", "Global", "Travel"],
    tagline: "Fast-rising global girl group with strong travel demand",
    intro: "适合承载演唱会信息之外的应援、穿搭和观演攻略内容。",
    members: ["Chaewon", "Sakura", "Yunjin", "Kazuha", "Eunchae"]
  },
  {
    slug: "meovv",
    name: "MEOVV",
    nameKo: "미야오",
    fandom: "PAWMPAWM",
    accent: "#7a5f57",
    agency: "THEBLACKLABEL",
    debutYear: 2024,
    origin: "South Korea",
    officialUrl: "https://www.instagram.com/meovv/",
    genres: ["Rookie", "Visual", "Watchlist"],
    tagline: "Early-cycle group worth tracking before full routing lands",
    intro: "适合作为先立入口、后补排期的新团模板。",
    members: ["Sooin", "Gawon", "Anna", "Narin", "Ella"]
  },
  {
    slug: "monsta-x",
    name: "MONSTA X",
    nameKo: "몬스타엑스",
    fandom: "MONBEBE",
    accent: "#5c5668",
    agency: "Starship Entertainment",
    debutYear: 2015,
    origin: "South Korea",
    officialUrl: "https://monstax-official.com/",
    genres: ["Legacy", "Arena", "Touring"],
    tagline: "Reliable touring history with strong global travel fandom",
    intro: "适合作为 legacy 男团的巡演回归雷达和城市说明页。",
    members: ["Shownu", "Minhyuk", "Kihyun", "Hyungwon", "Joohoney", "I.M"]
  },
  {
    slug: "nct-127",
    name: "NCT 127",
    nameKo: "엔시티 127",
    fandom: "NCTzen",
    accent: "#6f7d53",
    agency: "SM Entertainment",
    debutYear: 2016,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Arena", "World Tour", "Asia"],
    tagline: "Frequent routing that benefits from city-by-city detail",
    intro: "适合作为大规模多城市巡演的日历和攻略模板。",
    members: ["Johnny", "Taeyong", "Yuta", "Doyoung", "Jaehyun", "Jungwoo", "Mark", "Haechan"]
  },
  {
    slug: "nct-dream",
    name: "NCT DREAM",
    nameKo: "엔시티 드림",
    fandom: "NCTzen",
    accent: "#809447",
    agency: "SM Entertainment",
    debutYear: 2016,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Arena", "Asia", "Travel"],
    tagline: "Large fandom and high city-specific demand",
    intro: "适合验证城市榜单、提醒订阅和粉丝城市聚集页等未来模块。",
    members: ["Mark", "Renjun", "Jeno", "Haechan", "Jaemin", "Chenle", "Jisung"]
  },
  {
    slug: "newjeans",
    name: "NewJeans",
    nameKo: "뉴진스",
    fandom: "Bunnies",
    accent: "#6b7b94",
    agency: "ADOR",
    debutYear: 2022,
    origin: "South Korea",
    officialUrl: "https://weverse.io/newjeans",
    genres: ["Global", "Watchlist", "Fandom"],
    tagline: "High public interest even when routing remains sparse",
    intro: "即使活动节奏不固定，艺人页也值得保留官方入口和长期监测状态。",
    members: ["Minji", "Hanni", "Danielle", "Haerin", "Hyein"]
  },
  {
    slug: "nmixx",
    name: "NMIXX",
    nameKo: "엔믹스",
    fandom: "NSWER",
    accent: "#7d6d52",
    agency: "JYP Entertainment",
    debutYear: 2022,
    origin: "South Korea",
    officialUrl: "https://nmixx.jype.com/",
    genres: ["Arena", "Festival", "Asia"],
    tagline: "Performance-heavy act with strong live-stage curiosity",
    intro: "适合作为选座、舞台延伸和站席体验说明的样板页。",
    members: ["Lily", "Haewon", "Sullyoon", "Bae", "Jiwoo", "Kyujin"]
  },
  {
    slug: "red-velvet",
    name: "Red Velvet",
    nameKo: "레드벨벳",
    fandom: "ReVeluv",
    accent: "#8b4a58",
    agency: "SM Entertainment",
    debutYear: 2014,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Legacy", "Arena", "Fandom"],
    tagline: "Established catalog and enduring multi-generation fandom",
    intro: "适合作为资深女团页面，承接经典场馆与跨代粉丝需求。",
    members: ["Irene", "Seulgi", "Wendy", "Joy", "Yeri"]
  },
  {
    slug: "riize",
    name: "RIIZE",
    nameKo: "라이즈",
    fandom: "BRIIZE",
    accent: "#7e704f",
    agency: "SM Entertainment",
    debutYear: 2023,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Rookie", "Arena", "Travel"],
    tagline: "Fast rookie-to-mainstream trajectory with high travel interest",
    intro: "适合作为新生代男团的巡演监测和 fandom 内容样板。",
    members: ["Shotaro", "Eunseok", "Sungchan", "Wonbin", "Sohee", "Anton"]
  },
  {
    slug: "seventeen",
    name: "SEVENTEEN",
    nameKo: "세븐틴",
    fandom: "CARAT",
    accent: "#d36e57",
    agency: "PLEDIS Entertainment",
    debutYear: 2015,
    origin: "South Korea",
    officialUrl: "https://weverse.io/seventeen",
    genres: ["World Tour", "Membership", "Travel"],
    tagline: "Self-producing performance powerhouse with broad travel fandom",
    intro: "适合做中文巡演聚合入口的典型团体，官宣和票务节奏都较为明确。",
    members: ["S.Coups", "Jeonghan", "Joshua", "Jun", "Hoshi", "Wonwoo", "Woozi", "DK", "Mingyu", "The8", "Seungkwan", "Vernon", "Dino"]
  },
  {
    slug: "shinee",
    name: "SHINee",
    nameKo: "샤이니",
    fandom: "SHINee World",
    accent: "#5ca195",
    agency: "SM Entertainment",
    debutYear: 2008,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Legacy", "Arena", "Japan"],
    tagline: "Legacy touring act with strong Japan and Korea demand",
    intro: "适合作为资深团体页，承接日本场抽选、选座和饭拍经验。",
    members: ["Onew", "Key", "Minho", "Taemin"]
  },
  {
    slug: "stray-kids",
    name: "Stray Kids",
    nameKo: "스트레이 키즈",
    fandom: "STAY",
    accent: "#6a4a34",
    agency: "JYP Entertainment",
    debutYear: 2018,
    origin: "South Korea",
    officialUrl: "https://www.straykids.jype.com/",
    genres: ["Arena", "Stadium", "Travel"],
    tagline: "Arena and stadium routing with frequent updates",
    intro: "适合展示同一艺人多城市排期、官宣分批释放和高密度日程。",
    members: ["Bang Chan", "Lee Know", "Changbin", "Hyunjin", "Han", "Felix", "Seungmin", "I.N"]
  },
  {
    slug: "taemin",
    name: "Taemin",
    nameKo: "태민",
    fandom: "TAEMate",
    accent: "#6f5b77",
    agency: "Big Planet Made",
    debutYear: 2014,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Solo", "Arena", "Japan"],
    tagline: "Solo performance specialist with strong seat-value questions",
    intro: "适合作为表演型 solo 艺人页，重点解释舞台延伸和视线优势。",
    members: ["Taemin"]
  },
  {
    slug: "taeyeon",
    name: "Taeyeon",
    nameKo: "태연",
    fandom: "SONE",
    accent: "#6d707c",
    agency: "SM Entertainment",
    debutYear: 2015,
    origin: "South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Solo", "Arena", "Legacy"],
    tagline: "Solo vocalist with high interest in acoustics and seat choice",
    intro: "适合作为声场、坐席和会场体验导向的 solo 观演页。",
    members: ["Taeyeon"]
  },
  {
    slug: "the-boyz",
    name: "THE BOYZ",
    nameKo: "더보이즈",
    fandom: "THE B",
    accent: "#6e5a4d",
    agency: "One Hundred",
    debutYear: 2017,
    origin: "South Korea",
    officialUrl: "https://www.theboyz.kr/",
    genres: ["Arena", "Asia", "Fandom"],
    tagline: "High member-count group suited to profile-heavy artist pages",
    intro: "适合作为多成员男团页面，承接成员档案和同场观演经验。",
    members: ["Sangyeon", "Jacob", "Younghoon", "Hyunjae", "Juyeon", "Kevin", "New", "Q", "Ju Haknyeon", "Sunwoo", "Eric"]
  },
  {
    slug: "txt",
    name: "TOMORROW X TOGETHER",
    nameKo: "투모로우바이투게더",
    fandom: "MOA",
    accent: "#557ea1",
    agency: "BIGHIT MUSIC",
    debutYear: 2019,
    origin: "South Korea",
    officialUrl: "https://weverse.io/txt",
    genres: ["Arena", "World Tour", "Membership"],
    tagline: "Global arena routing with strong fanclub ticketing demand",
    intro: "适合覆盖日韩和北美路线，中文用户常关心会员预售、场馆交通和跨境支付。",
    members: ["Soobin", "Yeonjun", "Beomgyu", "Taehyun", "Huening Kai"]
  },
  {
    slug: "treasure",
    name: "TREASURE",
    nameKo: "트레저",
    fandom: "TREASURE MAKER",
    accent: "#5876a0",
    agency: "YG Entertainment",
    debutYear: 2020,
    origin: "South Korea",
    officialUrl: "https://www.ygfamily.com/artist/Main.asp?LANGDIV=K&ATYPE=2&ARTIDX=65",
    genres: ["Asia", "Arena", "Travel"],
    tagline: "Asia-focused routing with strong fan travel overlap",
    intro: "适合作为亚洲场和多城市追踪的艺人页样本。",
    members: ["Choi Hyunsuk", "Jihoon", "Yoshi", "Junkyu", "Jaehyuk", "Asahi", "Doyoung", "Haruto", "Jeongwoo", "Junghwan"]
  },
  {
    slug: "tws",
    name: "TWS",
    nameKo: "투어스",
    fandom: "42",
    accent: "#7f8b64",
    agency: "PLEDIS Entertainment",
    debutYear: 2024,
    origin: "South Korea",
    officialUrl: "https://weverse.io/tws",
    genres: ["Rookie", "Fancon", "Travel"],
    tagline: "Early fandom growth suited to fancon and showcase tracking",
    intro: "适合作为新团 fancon 路线和抽选信息的中文入口。",
    members: ["Shinyu", "Dohoon", "Youngjae", "Hanjin", "Jihoon", "Kyungmin"]
  },
  {
    slug: "twice",
    name: "TWICE",
    nameKo: "트와이스",
    fandom: "ONCE",
    accent: "#a46a68",
    agency: "JYP Entertainment",
    debutYear: 2015,
    origin: "South Korea",
    officialUrl: "https://twice.jype.com/",
    genres: ["Stadium", "Arena", "Japan"],
    tagline: "Large-scale routing across Korea, Japan and Southeast Asia",
    intro: "适合作为多市场售票规则和多轮抽选的中文说明入口。",
    members: ["Nayeon", "Jeongyeon", "Momo", "Sana", "Jihyo", "Mina", "Dahyun", "Chaeyoung", "Tzuyu"]
  },
  {
    slug: "v",
    name: "V",
    nameKo: "뷔",
    fandom: "ARMY",
    accent: "#6a5b50",
    agency: "BIGHIT MUSIC",
    debutYear: 2023,
    origin: "South Korea",
    officialUrl: "https://weverse.io/v",
    genres: ["Solo", "Global", "Visual"],
    tagline: "Solo page that benefits from travel and visual-stage notes",
    intro: "适合作为 global solo artist 的长期监测入口。",
    members: ["V"]
  },
  {
    slug: "wayv",
    name: "WayV",
    nameKo: "웨이션브이",
    fandom: "WayZenNi",
    accent: "#5c7d74",
    agency: "SM Entertainment",
    debutYear: 2019,
    origin: "China / South Korea",
    officialUrl: "https://www.smtown.com/",
    genres: ["Asia", "Arena", "Travel"],
    tagline: "Cross-market act suited to multilingual event routing",
    intro: "适合作为中文用户熟悉度较高的跨地区男团页。",
    members: ["Kun", "Ten", "Xiaojun", "Hendery", "Yangyang", "Winwin"]
  },
  {
    slug: "xg",
    name: "XG",
    nameKo: "엑스지",
    fandom: "ALPHAZ",
    accent: "#645d90",
    agency: "XGALX",
    debutYear: 2022,
    origin: "Japan",
    officialUrl: "https://xgalx.com/xg/",
    genres: ["Global", "Arena", "Travel"],
    tagline: "Global girl-group routing with strong visual performance demand",
    intro: "适合作为日本与欧美交叉市场的内容样本。",
    members: ["Jurin", "Chisa", "Hinata", "Harvey", "Juria", "Maya", "Cocona"]
  },
  {
    slug: "zerobaseone",
    name: "ZEROBASEONE",
    nameKo: "제로베이스원",
    fandom: "ZEROSE",
    accent: "#6c7fa8",
    agency: "WAKEONE",
    debutYear: 2023,
    origin: "South Korea",
    officialUrl: "https://zb1-official.com/",
    genres: ["Arena", "Fancon", "Asia"],
    tagline: "Fast-growing fandom that benefits from route aggregation",
    intro: "适合作为 fancon 到 arena 过渡阶段的男团页面。",
    members: ["Sung Hanbin", "Kim Jiwoong", "Zhang Hao", "Seok Matthew", "Kim Taerae", "Ricky", "Kim Gyuvin", "Park Gunwook", "Han Yujin"]
  },
  {
    slug: "zico",
    name: "ZICO",
    nameKo: "지코",
    fandom: "COMMON",
    accent: "#7c5a42",
    agency: "KOZ Entertainment",
    debutYear: 2014,
    origin: "South Korea",
    officialUrl: "https://weverse.io/zico",
    genres: ["Solo", "Festival", "Hip-hop"],
    tagline: "Festival and solo routing that broadens the site beyond idol groups",
    intro: "适合作为站点从 idol tour 扩到 broader K-pop live 的入口。",
    members: ["ZICO"]
  }
];

const artistBySlug = new Map(artistSeeds.map((artist) => [artist.slug, artist]));


const timezoneByCountry = {
  "Japan": "Asia/Tokyo",
  "South Korea": "Asia/Seoul",
  "United States": "America/Los_Angeles",
  "Philippines": "Asia/Manila",
  "Hong Kong": "Asia/Hong_Kong",
  "Taiwan": "Asia/Taipei",
  "Singapore": "Asia/Singapore",
  "Malaysia": "Asia/Kuala_Lumpur",
  "France": "Europe/Paris",
  "United Kingdom": "Europe/London",
  "Macau": "Asia/Macau",
  "Indonesia": "Asia/Jakarta",
  "Thailand": "Asia/Bangkok",
  "Mexico": "America/Mexico_City",
  "Australia": "Australia/Sydney"
};


function memberObject(artist, memberName, index) {
  return {
    slug: slugify(memberName),
    name: memberName,
    role: roleCycle[index % roleCycle.length],
    profile: `${memberName} 的个人入口会优先整理舞台记忆点、返图讨论和 ${memberProfileCycle[index % memberProfileCycle.length]}`,
    initials: initials(memberName)
  };
}

const artists = artistSeeds.map((artist) => ({
  slug: artist.slug,
  name: artist.name,
  nameKo: artist.nameKo,
  fandom: artist.fandom,
  tagline: artist.tagline,
  intro: artist.intro,
  accent: artist.accent,
  officialUrl: artist.officialUrl,
  agency: artist.agency,
  debutYear: artist.debutYear,
  origin: artist.origin,
  genres: artist.genres,
  memberCount: artist.members.length,
  coverImage: `/media/artists/${artist.slug}.svg`,
  heroImage: `/media/artists/${artist.slug}.svg`,
  members: artist.members.map((memberName, index) => memberObject(artist, memberName, index))
}));

const eventSeeds = [
  ["aespa", "Tokyo", "Japan", "Ariake Arena", "2026-03-29T18:30:00+09:00", "sold_out", ["Japan", "Arena", "Waitlist"], "官方转售和补票机制往往比二级票更安全。", "日本场常见会员抽选与多轮补票。", "适合在页内补电子票、返程和周边住宿建议。", ["关注官方补票", "确认电子票取票方式", "留意转售合法性"]],
  ["seventeen", "Seoul", "South Korea", "KSPO Dome", "2026-04-18T19:00:00+09:00", "on_sale", ["World Tour", "Korea", "Membership"], "CARAT 会员预售通常需要先完成认证。", "优先比较 Floor、Stand 和福利票规则。", "演出日人流很大，住宿和返程最好围绕 5 号线或 9 号线安排。", ["确认实名规则", "确认预售认证时间", "准备支付方式"]],
  ["j-hope", "Seoul", "South Korea", "Jamsil Indoor Stadium", "2026-04-26T18:00:00+09:00", "announced", ["Solo", "Korea", "Membership"], "先确认会员预售与公开发售的时间差。", "solo 场常见福利票和限购规则。", "蚕室一带散场后叫车难度高，建议优先地铁。", ["准备 Weverse 账号", "确认实名信息", "预留返程时间"]],
  ["txt", "Osaka", "Japan", "Kyocera Dome Osaka", "2026-05-03T18:00:00+09:00", "announced", ["Japan", "Dome", "MOA"], "日本巨蛋场优先看抽选和发券节点。", "日本大场多轮抽选的支付和取票方式会不同。", "大阪场适合补周边住宿和散场交通。", ["确认抽选轮次", "核对电子票规则", "预订返程列车"]],
  ["blackpink", "Los Angeles", "United States", "BMO Stadium", "2026-05-09T20:00:00-07:00", "announced", ["North America", "Stadium", "Presale"], "先判断自己能否进入官方、平台或信用卡预售。", "体育场票价跨度大，别只看票面价格。", "BMO Stadium 演出日停车和网约车压力都很高。", ["确认 presale code 来源", "比较座位区块", "预留停车预算"]],
  ["enhypen", "Manila", "Philippines", "Mall of Asia Arena", "2026-05-16T19:00:00+08:00", "on_sale", ["Asia", "Arena", "Travel"], "东南亚场通常要先确认支付通道和账户地区。", "不同平台的支付成功率差异很大。", "马尼拉场适合补机场到场馆的接驳建议。", ["确认支付方式", "核对实名规则", "预留机场接驳时间"]],
  ["le-sserafim", "Hong Kong", "Hong Kong", "AsiaWorld-Arena", "2026-05-24T19:00:00+08:00", "announced", ["Asia", "Arena", "Local payment"], "港区票务常涉及本地支付方式和实名规则。", "不同平台支持的支付方式差异较大。", "适合在详情页补机场快线和口岸路线。", ["确认支付方式", "确认实名需求", "规划口岸路线"]],
  ["nct-dream", "Seoul", "South Korea", "Gocheok Sky Dome", "2026-05-30T18:00:00+09:00", "on_sale", ["Korea", "Dome", "Membership"], "大场优先核对区块视野和安检时间。", "韩场通常对实名和取票证件要求更细。", "高尺散场后地铁会拥挤，建议留足返程缓冲。", ["确认区块视野", "核对实名信息", "规划散场路线"]],
  ["ive", "Taipei", "Taiwan", "Taipei Arena", "2026-06-06T19:30:00+08:00", "announced", ["Asia", "Arena", "Travel"], "台北场适合先确认本地票务平台的注册和支付流程。", "留意信用卡验证和退票政策。", "台北小巨蛋周边住宿和捷运路线都比较成熟。", ["提前注册票务平台", "准备可用信用卡", "确认捷运末班时间"]],
  ["seventeen", "Singapore", "Singapore", "Singapore Indoor Stadium", "2026-06-13T19:30:00+08:00", "announced", ["Asia", "Arena", "Travel"], "新加坡场常有主办方预售、信用卡预售和公开发售。", "跨境支付前先确认手续费和退改规则。", "酒店优先选在地铁便利区而不是景点区。", ["关注主办方通知", "准备护照姓名拼写", "确认支付限额"]],
  ["treasure", "Kuala Lumpur", "Malaysia", "Axiata Arena", "2026-06-20T18:00:00+08:00", "announced", ["Asia", "Arena", "Travel"], "马来西亚场常见多轮开票和主办方会员机制。", "先确认货币转换与支付限额。", "Bukit Jalil 一带需要提前规划散场交通。", ["确认开票轮次", "检查银行卡限额", "规划返程路线"]],
  ["itzy", "Manila", "Philippines", "Smart Araneta Coliseum", "2026-06-27T19:00:00+08:00", "on_sale", ["Asia", "Arena", "Seats"], "先比较近舞台区域和看全景区域的取舍。", "不同票档的溢价差距较大。", "Araneta 一带交通选择多，但演出日拥堵明显。", ["先画好选座优先级", "核对票档福利", "预留散场缓冲"]],
  ["blackpink", "Paris", "France", "Accor Arena", "2026-07-03T20:00:00+02:00", "on_sale", ["Europe", "Arena", "VIP"], "优先确认票务平台是否限制账户地区。", "欧元结算会带来汇率和手续费差异。", "适合补地铁末班和周边住宿策略。", ["确认账户地区", "检查欧元结算卡", "查看 VIP 入场时间"]],
  ["ateez", "London", "United Kingdom", "The O2", "2026-07-10T19:30:00+01:00", "announced", ["Europe", "Arena", "Travel"], "英国场先看 AXS/Ticketmaster 双平台差异。", "部分福利票限制转让。", "O2 周边交通成熟，但散场排队明显。", ["先准备两套票务账户", "核对福利规则", "留出散场时间"]],
  ["xg", "London", "United Kingdom", "OVO Arena Wembley", "2026-07-17T19:30:00+01:00", "announced", ["Europe", "Arena", "Travel"], "海外场要先确认站席和看台票差异。", "英区卡支付成功率很关键。", "伦敦场适合补夜间交通和地铁换乘建议。", ["核对站席规则", "测试支付方式", "确认返程车次"]],
  ["twice", "Tokyo", "Japan", "Tokyo Dome", "2026-07-25T18:00:00+09:00", "sold_out", ["Japan", "Dome", "Waitlist"], "巨蛋场要优先看抽选和官方补票。", "票档差异和场内视野差距都很大。", "东京场适合补巨蛋周边酒店与返程经验。", ["确认抽选结果", "查看官方补票", "预订返程交通"]],
  ["boynextdoor", "Seoul", "South Korea", "Olympic Hall", "2026-08-01T18:00:00+09:00", "on_sale", ["Fancon", "Korea", "Membership"], "fancon 场通常更看重会员预售和福利说明。", "不同票档福利差距可能大于座位差距。", "首尔小场馆更适合补周边排队和安检提示。", ["核对福利票规则", "确认会员认证", "留意入场队列"]],
  ["tws", "Yokohama", "Japan", "K-Arena Yokohama", "2026-08-08T18:00:00+09:00", "announced", ["Japan", "Arena", "Rookie"], "日本新团场要重点看会员抽选和二轮抽选。", "新团演出常出现票务节奏变化。", "横滨场适合补海滨区住宿和散场路线。", ["关注抽选节点", "准备日区账号", "规划返程路线"]],
  ["andteam", "Saitama", "Japan", "Saitama Super Arena", "2026-08-15T18:00:00+09:00", "on_sale", ["Japan", "Arena", "Travel"], "SSA 场适合优先看区块视线和站席规则。", "不同区块对主舞台和延伸台视野差异很大。", "埼玉场返程列车和酒店选择要尽早确定。", ["确认区块图", "核对电子票说明", "提前看返程列车"]],
  ["zerobaseone", "Macau", "Macau", "Galaxy Arena", "2026-08-22T19:00:00+08:00", "announced", ["Asia", "Arena", "Travel"], "澳门场常涉及跨境住宿和口岸动线。", "先确认票务平台是否支持国际支付。", "银河综艺馆散场后叫车和口岸压力都较大。", ["确认支付方式", "预留口岸时间", "看酒店接驳"]],
  ["riize", "Hong Kong", "Hong Kong", "AsiaWorld-Arena", "2026-08-29T19:00:00+08:00", "announced", ["Asia", "Arena", "Travel"], "适合补充港区购票、实名和场馆动线。", "同一场次不同平台的余票节奏会不一样。", "机场快线和的士预算都要提前算。", ["确认平台规则", "核对实名信息", "预留交通预算"]],
  ["katseye", "New York", "United States", "Hammerstein Ballroom", "2026-09-05T20:00:00-04:00", "announced", ["Showcase", "North America", "GA"], "GA standing 场优先看排队和包袋政策。", "北美小场抢位比单纯票档更重要。", "纽约场适合补地铁、安检和排队建议。", ["查看包袋政策", "确认排队时间", "规划夜间返程"]],
  ["babymonster", "Jakarta", "Indonesia", "ICE BSD Hall 5", "2026-09-12T19:00:00+07:00", "announced", ["Asia", "Arena", "Travel"], "雅加达场适合补支付、口岸和交通信息。", "部分主办方会分平台和分轮开票。", "BSD 演出日路面交通时间不可低估。", ["准备支付卡", "确认平台账号", "预留出城时间"]],
  ["stray-kids", "Bangkok", "Thailand", "Impact Arena", "2026-09-19T19:00:00+07:00", "on_sale", ["Asia", "Arena", "Travel"], "泰国场要优先确认支付方式、票务区和站席规则。", "高需求场次容易出现抢票拥堵。", "IMPACT 周边住宿和返程策略要提早做。", ["准备多张支付卡", "确认站席规则", "订好场馆周边酒店"]],
  ["iu", "Taipei", "Taiwan", "Taipei Arena", "2026-09-26T19:30:00+08:00", "announced", ["Solo", "Arena", "Seats"], "solo 场更值得花时间比较区块和视角。", "不同票档的观感差异可能大于价差。", "台北小巨蛋散场交通稳定，但末班时间仍要确认。", ["先看区块视角", "比较票档价格", "确认捷运末班"]],
  ["twice", "Singapore", "Singapore", "National Stadium", "2026-10-03T19:30:00+08:00", "announced", ["Asia", "Stadium", "Travel"], "新加坡大场要先看平台预售和看台视野。", "体育场票档跨度很大。", "国家体育场演出日散场人流密集。", ["核对预售规则", "比较视野图", "规划散场交通"]],
  ["nmixx", "Seoul", "South Korea", "Blue Square Mastercard Hall", "2026-10-10T18:00:00+09:00", "announced", ["Korea", "Theater", "Close-up"], "剧场型场馆更值得细看楼层和视角。", "小场和中场的体验差距明显。", "首尔剧场场通常安检和队列节奏更快。", ["核对楼层座位", "留意包袋规则", "提早到场"]],
  ["taeyeon", "Seoul", "South Korea", "KSPO Dome", "2026-10-17T18:00:00+09:00", "announced", ["Solo", "Korea", "Seats"], "声场和视线通常比靠前距离更重要。", "适合优先比较中前区与高层正中的取舍。", "奥林匹克公园一带住宿和返程都要早订。", ["优先看音场评价", "比较正中区块", "尽早订酒店"]],
  ["treasure", "Bangkok", "Thailand", "Impact Arena", "2026-10-24T19:00:00+07:00", "announced", ["Asia", "Arena", "Travel"], "适合补泰国场多轮售票和站席经验。", "不同票档福利差异较大。", "IMPACT 返程和住宿建议值得单独写清楚。", ["确认开票轮次", "看福利差异", "规划返程"]],
  ["ateez", "Mexico City", "Mexico", "Palacio de los Deportes", "2026-11-01T20:00:00-06:00", "announced", ["North America", "Arena", "Travel"], "拉美场优先确认平台规则和支付渠道。", "跨区购票更要留意结算和票券形式。", "墨西哥城场适合补治安和夜间返程提示。", ["确认票券形式", "准备国际支付", "留出返程缓冲"]],
  ["nct-dream", "Jakarta", "Indonesia", "Indonesia Arena", "2026-11-08T19:00:00+07:00", "announced", ["Asia", "Arena", "Travel"], "适合补印尼平台支付和手机取票规则。", "开票节奏和实名验证都值得单独说明。", "Jakarta 场馆周边交通拥堵要提前考虑。", ["确认手机取票规则", "核对实名信息", "预留交通时间"]],
  ["stray-kids", "Sydney", "Australia", "Qudos Bank Arena", "2026-11-15T19:30:00+11:00", "announced", ["Oceania", "Arena", "Travel"], "澳洲场要重点看 Ticketek/Ticketmaster 路线差异。", "不同入场区对视野影响较大。", "悉尼奥林匹克公园返程车次值得提前确认。", ["准备当地票务账号", "核对区块视角", "确认返程车次"]],
  ["txt", "Los Angeles", "United States", "Kia Forum", "2026-11-22T20:00:00-08:00", "announced", ["North America", "Arena", "Travel"], "论坛场适合补停车、排队和周边住宿建议。", "北美 arena 场的座位性价比差异大。", "洛杉矶演出日优先地铁或提前进场。", ["看好停车预算", "比较下层与上层", "提前出发"]],
  ["blackpink", "Tokyo", "Japan", "Tokyo Dome", "2026-11-29T18:00:00+09:00", "announced", ["Japan", "Dome", "BLINK"], "日本巨蛋场的抽选和补票规则优先级最高。", "别忽视电子票和入场证件的细节。", "东京巨蛋周边酒店和返程车票都要先订。", ["核对抽选条件", "确认电子票", "预订返程交通"]],
  ["zerobaseone", "Seoul", "South Korea", "Olympic Handball Gymnasium", "2026-12-06T18:00:00+09:00", "on_sale", ["Fancon", "Korea", "Membership"], "韩场 fancon 更适合提前研究福利票和认证规则。", "福利票常有更严格的取票条件。", "手球馆场适合补排队和安检经验。", ["确认福利票说明", "核对认证规则", "留意入场时间"]],
  ["xg", "Los Angeles", "United States", "YouTube Theater", "2026-12-13T20:00:00-08:00", "announced", ["North America", "Theater", "GA"], "小中型场馆更需要看排队和视角。", "GA 票和坐席票体验差距明显。", "Inglewood 一带交通和散场接驳值得提前规划。", ["确认排队时间", "看清 GA 规则", "规划散场接驳"]]
];

const events = eventSeeds.map(([artistSlug, city, country, venue, startDate, status, tags, purchaseHint, priceNote, travelNote, checklist]) => {
  const artist = artistBySlug.get(artistSlug);
  if (!artist) {
    throw new Error(`Missing artist for event seed: ${artistSlug}`);
  }

  const citySlug = slugify(city);
  const slug = `${artistSlug}-${citySlug}-${new Date(startDate).getUTCFullYear()}`;
  return {
    id: slug,
    artist: artist.name,
    artistSlug: artist.slug,
    slug,
    city,
    country,
    venue,
    startDate,
    timezone: timezoneByCountry[country] ?? "Asia/Seoul",
    status,
    source: `${artist.name} official channel`,
    sourceUrl: artist.officialUrl,
    sourceConfidence: "official",
    tags,
    title: `${artist.name} in ${city}`,
    tourName: `${artist.name} Tour Watch`,
    description: `${artist.name} 的 ${city} 场会把官宣入口、购票说明、场馆交通和中文观演决策放在一起。`,
    purchaseHint,
    priceNote,
    travelNote,
    checklist,
    heroImage: `/media/events/${slug}.svg`,
    ticketLinks: [
      {
        label: `${artist.name} Official`,
        href: artist.officialUrl,
        type: "official"
      }
    ]
  };
});

const tourPlans = [
  ["bts", "BTS reunion routing watch", "已建立长期监测，优先关注 Weverse 与官方公告中的团体演出信号。", ["Seoul", "Japan", "North America", "Europe"]],
  ["jin", "Jin solo tour radar", "先把 solo 页、预售路径和场馆说明搭起来，等待完整日期落地。", ["Korea", "Japan", "Southeast Asia"]],
  ["jimin", "Jimin live schedule watch", "适合先追踪官宣窗口、festival slot 和媒体放出的 live planning。", ["Korea", "Japan", "North America"]],
  ["jung-kook", "Jung Kook arena watch", "先保留官方入口和全球高需求城市观察名单。", ["Seoul", "Tokyo", "Los Angeles", "London"]],
  ["v", "V showcase and arena watch", "以官方入口和媒体窗口为主，不在无明确信息时伪造日程。", ["Seoul", "Paris", "Tokyo"]],
  ["newjeans", "NewJeans long-term watch", "当前以官方入口和长期监测为主，等待更明确信号再进入日期卡片。", ["Seoul", "Tokyo", "Global"]],
  ["illit", "ILLIT first major tour watch", "适合提前铺好艺人页和城市攻略模板，等待完整路线。", ["Seoul", "Tokyo", "Bangkok"]],
  ["meovv", "MEOVV live expansion watch", "先监测 showcase、festival 和 fan event，再视官宣补齐日期卡片。", ["Seoul", "Tokyo", "Jakarta"]],
  ["exo", "EXO reunion and solo-linked watch", "以团体与成员联动信息为主，优先保留官方入口和关键市场。", ["Seoul", "Tokyo", "Taipei"]],
  ["shinee", "SHINee Japan and Korea watch", "优先监测日本 arena/dome 与韩国周年演出窗口。", ["Seoul", "Tokyo", "Osaka"]],
  ["taemin", "Taemin solo routing watch", "重点关注表演型 solo 常见的日本和首尔路线。", ["Seoul", "Tokyo", "Singapore"]],
  ["red-velvet", "Red Velvet group watch", "保留 legacy 女团页和城市攻略模板，等待更明确信息。", ["Seoul", "Tokyo", "Bangkok"]],
  ["wayv", "WayV multilingual route watch", "适合先监测亚洲主要市场和中文用户关注的场次。", ["Macau", "Hong Kong", "Bangkok"]],
  ["monsta-x", "MONSTA X return watch", "以回归和 tour teaser 为主，日期未落地前只做雷达卡片。", ["Seoul", "Tokyo", "Los Angeles"]],
  ["the-boyz", "THE BOYZ Asia routing watch", "适合先监测 fancon、arena 和成员密集型内容需求。", ["Seoul", "Jakarta", "Bangkok"]],
  ["kiss-of-life", "KISS OF LIFE festival and tour watch", "优先观察 festival slots 如何转成完整 tour routing。", ["Seoul", "Bangkok", "Taipei"]],
  ["bibi", "BIBI global live watch", "先追踪 festival 和 theatre 级别演出，不伪造具体日期。", ["Seoul", "Singapore", "Los Angeles"]],
  ["day6", "DAY6 band tour watch", "先保留乐队场模板和声场说明，再根据官宣补日期。", ["Seoul", "Tokyo", "Manila"]],
  ["iu", "IU stadium and arena watch", "以官方窗口为主，等待完整 tour routing 再补多城市排期。", ["Seoul", "Taipei", "Singapore"]],
  ["zico", "ZICO live and festival watch", "适合作为 broader live 页面入口，先看 festival 再看独立演唱会。", ["Seoul", "Tokyo", "Bangkok"]]
].map(([artistSlug, title, note, regions]) => {
  const artist = artistBySlug.get(artistSlug);
  return {
    slug: `${artistSlug}-tour-radar`,
    artistSlug,
    artist: artist.name,
    title,
    stage: "watch",
    note,
    regions,
    source: `${artist.name} official channel`,
    sourceUrl: artist.officialUrl
  };
});

const sourceRegistry = artists
  .filter((artist) => artist.officialUrl)
  .map((artist) => ({
    id: `artist-${artist.slug}`,
    label: `${artist.name} official`,
    category: "artist",
    artistSlug: artist.slug,
    url: artist.officialUrl
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "en"));

const baseMeta = {
  generatedAt: new Date().toISOString(),
  siteMode: "github-pages-trial",
  coverageNote: "Static public site with locally maintained event and fandom content.",
  counts: {
    artists: artists.length,
    events: events.length,
    guides: 0,
    communityPosts: 0,
    monitoredSources: sourceRegistry.length,
    tourPlans: tourPlans.length
  }
};

function artistSvg(artist) {
  const accentSoft = tint(artist.accent, 0.52);
  const accentDark = shade(artist.accent, 0.28);
  const band = tint(artist.accent, 0.18);
  const initialsText = initials(artist.name);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="900" viewBox="0 0 1200 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="60" y1="40" x2="1100" y2="860" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accentDark}"/>
    </linearGradient>
    <radialGradient id="halo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(950 180) rotate(120) scale(380 320)">
      <stop stop-color="#FFF7EC" stop-opacity="0.78"/>
      <stop offset="1" stop-color="#FFF7EC" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="900" rx="48" fill="url(#bg)"/>
  <rect x="52" y="52" width="1096" height="796" rx="40" stroke="rgba(255,255,255,0.34)" stroke-width="2"/>
  <circle cx="914" cy="214" r="284" fill="url(#halo)"/>
  <path d="M138 714C256 578 406 514 546 514C686 514 804 592 942 734" stroke="${band}" stroke-width="24" stroke-linecap="round"/>
  <circle cx="600" cy="362" r="188" fill="rgba(255,247,236,0.18)" stroke="rgba(255,247,236,0.34)" stroke-width="8"/>
  <text x="600" y="400" text-anchor="middle" fill="#FFF7EC" font-size="92" font-family="Georgia, serif" letter-spacing="8">${initialsText}</text>
  <text x="96" y="128" fill="#FFF7EC" font-size="28" font-family="Arial, sans-serif" letter-spacing="7">KONCERT TOGETHER</text>
  <text x="96" y="690" fill="#FFF7EC" font-size="110" font-family="Georgia, serif" font-weight="700">${artist.name}</text>
  <text x="96" y="748" fill="#FFF7EC" font-size="34" font-family="Arial, sans-serif" opacity="0.88">${artist.nameKo}  •  ${artist.fandom}  •  ${artist.memberCount} members</text>
  <text x="96" y="814" fill="#FFF7EC" font-size="24" font-family="Arial, sans-serif" opacity="0.9">${artist.tagline}</text>
</svg>`;
}

function eventSvg(event) {
  const artist = artistBySlug.get(event.artistSlug);
  const accent = artist.accent;
  const accentSoft = tint(accent, 0.55);
  const accentDark = shade(accent, 0.3);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="720" viewBox="0 0 1200 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="card" x1="120" y1="40" x2="1080" y2="680" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accentDark}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="720" rx="42" fill="url(#card)"/>
  <circle cx="944" cy="144" r="164" fill="rgba(255,247,236,0.2)"/>
  <rect x="72" y="72" width="1056" height="576" rx="32" stroke="rgba(255,247,236,0.34)" stroke-width="2"/>
  <text x="96" y="126" fill="#FFF7EC" font-size="24" font-family="Arial, sans-serif" letter-spacing="6">TOUR CARD</text>
  <text x="96" y="286" fill="#FFF7EC" font-size="84" font-family="Georgia, serif" font-weight="700">${artist.name}</text>
  <text x="96" y="364" fill="#FFF7EC" font-size="72" font-family="Georgia, serif">${event.city}</text>
  <text x="96" y="428" fill="#FFF7EC" font-size="28" font-family="Arial, sans-serif">${event.country}  •  ${event.venue}</text>
  <text x="96" y="492" fill="#FFF7EC" font-size="24" font-family="Arial, sans-serif">${event.status.replaceAll("_", " ").toUpperCase()}  •  KONCERT TOGETHER</text>
</svg>`;
}

await fs.mkdir(artistMediaDir, { recursive: true });
await fs.mkdir(eventMediaDir, { recursive: true });

await Promise.all([
  fs.writeFile(path.join(dataDir, "artists.json"), `${JSON.stringify(artists, null, 2)}\n`),
  fs.writeFile(path.join(dataDir, "events.json"), `${JSON.stringify(events, null, 2)}\n`),
  fs.writeFile(path.join(dataDir, "tour-plans.json"), `${JSON.stringify(tourPlans, null, 2)}\n`),
  fs.writeFile(path.join(dataDir, "source-registry.json"), `${JSON.stringify(sourceRegistry, null, 2)}\n`),
  fs.writeFile(path.join(dataDir, "site-meta.json"), `${JSON.stringify(baseMeta, null, 2)}\n`),
  ...artists.map((artist) => fs.writeFile(path.join(artistMediaDir, `${artist.slug}.svg`), artistSvg(artist))),
  ...events.map((event) => fs.writeFile(path.join(eventMediaDir, `${event.slug}.svg`), eventSvg(event)))
]);

console.log(JSON.stringify({
  task: "reseed-trial-content",
  artists: artists.length,
  events: events.length,
  tourPlans: tourPlans.length,
  sources: sourceRegistry.length
}, null, 2));
