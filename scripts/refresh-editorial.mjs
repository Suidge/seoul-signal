import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");

const tagMap = {
  Arena: "Arena",
  Stadium: "体育场",
  Dome: "Dome",
  Theater: "剧场",
  Seats: "看台友好",
  Presale: "预售",
  Waitlist: "候补",
  Membership: "会员先行",
  Travel: "跨城观演",
  Fancon: "Fancon",
  Rookie: "新团观察",
  Watchlist: "持续关注",
  Legacy: "经典团体",
  Performance: "舞台型",
  Visual: "舞美强项",
  Global: "全球线路",
  Japan: "日本场",
  Korea: "韩国场",
  "North America": "北美场",
  Europe: "欧洲场",
  Asia: "亚洲场",
  Macau: "澳门场",
  Festival: "音乐节",
  Band: "乐队现场",
  Solo: "Solo",
  Fandom: "粉圈热度",
  Live: "现场口碑",
  VIP: "高需求",
  Showcase: "Showcase"
  ,
  Seoul: "首尔",
  Tokyo: "东京",
  Bangkok: "曼谷",
  Europe: "欧洲",
  "Local payment": "本地支付",
  Singapore: "新加坡",
  "Hong Kong": "香港",
  Macau: "澳门",
  Taipei: "台北",
  Manila: "马尼拉",
  Jakarta: "雅加达",
  "Kuala Lumpur": "吉隆坡",
  Sydney: "悉尼",
  Osaka: "大阪",
  Paris: "巴黎",
  London: "伦敦",
  "Los Angeles": "洛杉矶",
  "Mexico City": "墨西哥城"
  ,
  "Southeast Asia": "东南亚",
  Chicago: "芝加哥"
};

const memberRoleMap = {
  "主舞台焦点": "主舞台正面与延伸台前段的完整表情、动作线条和大屏 focus",
  "现场气氛担当": "安可和 ment 段的高互动，以及靠近主镜头一侧的即时反馈",
  "高辨识 vocal tone": "正面中段和声场更稳的位置，能把现场层次听得更完整",
  "fan-cam 热门成员": "延伸台停留点、返图高频区和最容易拿到个人 focus 的位置",
  "舞台能量中轴": "正面中区最能看清编舞队形、走位变化和整体张力",
  "视觉与表演亮点": "灯光、造型和特写最出彩的主舞台区，以及第一次延伸台展开",
  "表演线亮点": "正面或微斜角最能看到动作力度、线条和编排细节"
};

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function hashValue(input = "") {
  return [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

async function readJson(name) {
  return JSON.parse(await fs.readFile(path.join(dataDir, name), "utf8"));
}

async function writeJson(name, data) {
  await fs.writeFile(path.join(dataDir, name), `${JSON.stringify(data, null, 2)}\n`);
}

function translateTags(tags = []) {
  return uniq(tags.map((tag) => tagMap[tag] ?? tag));
}

function artistFocus(artist) {
  const genres = artist.genres ?? [];
  const notes = [];

  if (genres.includes("Stadium")) notes.push("体育场看台层级、延伸台覆盖和开票节奏");
  if (genres.includes("Arena")) notes.push("Arena 区块视野、主舞台距离和票档优先级");
  if (genres.includes("Dome")) notes.push("Dome 场的大屏体验、声场和正面区块");
  if (genres.includes("Japan")) notes.push("日本抽选、电子票和取票规则");
  if (genres.includes("North America")) notes.push("presale、信用卡入口和停车预算");
  if (genres.includes("Europe")) notes.push("平台地区限制、夜间返程和酒店区域");
  if (genres.includes("Korea")) notes.push("韩区会员先行、实名规则和散场动线");
  if (genres.includes("Band")) notes.push("声场、坐席舒适度和返场氛围");
  if (genres.includes("Solo")) notes.push("舞台距离、灯光层次和个人 focus");
  if (genres.includes("Fandom")) notes.push("应援点、返图热区和场内氛围");
  if (genres.includes("Rookie")) notes.push("fancon 福利、排队节奏和小中场体验");
  if (genres.includes("Legacy")) notes.push("回归信号、固定高频城市和老饭常问问题");
  if (genres.includes("Visual")) notes.push("舞美、屏幕调度和正面视线");
  if (genres.includes("Performance")) notes.push("编舞展开、延伸台和正面中区");
  if (genres.includes("Festival")) notes.push("音乐节 slot、站位和入退场节奏");
  if (!notes.length) notes.push("官方入口、场馆重点和最值得先看的观演细节");

  return uniq(notes).slice(0, 3);
}

function buildArtistTagline(artist) {
  const genres = translateTags(artist.genres ?? []).slice(0, 2).join(" / ");
  return genres ? `${genres} 现场情报` : "现场情报页";
}

function buildArtistIntro(artist) {
  const focuses = artistFocus(artist);
  const templates = [
    `想追 ${artist.name} 的现场，先把 ${focuses.join("、")} 看完，再决定哪一站更值得冲、哪个票档更适合下手，会稳很多。`,
    `如果 ${artist.name} 已经进了你的下一场候选，这一页会把 ${focuses.join("、")} 收成一条顺手可看的线，省掉来回翻公告和返图的时间。`,
    `看 ${artist.name} 的现场，最容易拉开体验差距的通常就是 ${focuses.join("、")}。这里会把这些重点和官方入口一起整理好。`,
    `从抢票优先级到场馆动线，${artist.name} 这一页会重点盯住 ${focuses.join("、")}。想少走弯路，先从这里看起基本不会错。`
  ];
  return templates[hashValue(artist.slug) % templates.length];
}

function refreshMemberProfiles(artist) {
  return (artist.members ?? []).map((member) => ({
    ...member,
    profile: [
      `${member.name} 在现场最常被问到的看点，通常都会落在 ${memberRoleMap[member.role] ?? "返图区块、安可互动和最值得提前卡位的位置"}。`
      ,
      `如果你是冲着 ${member.name} 的舞台存在感去，这一位通常最值得先看 ${memberRoleMap[member.role] ?? "延伸台停留点、安可互动和镜头高频区"}。`
      ,
      `${member.name} 的现场魅力，通常会在 ${memberRoleMap[member.role] ?? "主舞台正面、互动段和高频返图区块"} 这些位置被放大得最明显。`
    ][hashValue(`${artist.slug}-${member.slug}`) % 3]
  }));
}

function buildEventDescription(event) {
  const templates = [
    `${event.artist} ${event.city} 这场的时间、票务入口、场馆动线和中文提醒都会收在这里。抢票前先把支付方式、区块优先级和演后返程看明白，现场会轻松很多。`,
    `${event.artist} 在 ${event.city} 这一站最值得先确认的，就是开票入口、场馆动线和散场后的返程节奏。这一页会把关键节点都捋顺。`,
    `如果你已经在盯 ${event.artist} ${event.city} 这一场，这一页会先帮你把时间、票务链接、场馆细节和观演准备收齐。`,
    `${event.city} 这一场真正会影响体验的，不只是有没有抢到票，还有进场、视线和演后返程。这里会把该先看的重点集中整理好。`
  ];
  return templates[hashValue(event.slug) % templates.length];
}

function buildPurchaseHint(event) {
  const hints = [];
  const tags = event.tags ?? [];
  if (tags.includes("会员先行")) hints.push("先确认自己能不能进会员先行或 presale");
  if (tags.includes("日本场")) hints.push("日本场别只盯首轮抽选，二轮和补票也值得看");
  if (tags.includes("北美场")) hints.push("北美场要先准备信用卡和 presale code");
  if (tags.includes("欧洲场")) hints.push("欧洲平台常会卡地区和支付方式");
  if (tags.includes("Stadium")) hints.push("体育场场次别只看票面价格，也要把交通和散场成本算进去");
  if (tags.includes("Dome")) hints.push("Dome 场更值得先比正面区和斜侧区，而不是只看离舞台远近");
  if (!hints.length) hints.push("开票前先把账号、支付方式和区块优先级准备好");
  return `${hints[0]}。${hints[1] ?? "如果是高需求场次，减少临场切换平台和支付方式会更稳。"}`;
}

function buildTravelNote(event) {
  const country = event.country;
  if (country === "Japan") return `${event.venue} 这类日本场馆最怕的是演后返程和电子票临场出错。酒店尽量围绕直达线路订，散场后的列车和步行距离要提前看。`;
  if (country === "South Korea") return `${event.venue} 这类首尔高频场馆，真正拉开体验差距的是到场时间、排队动线和散场地铁。住处最好围绕场馆或直达线，不要把返程留到最后一刻。`;
  if (country === "United States") return `${event.venue} 这类北美场馆要把停车、网约车等待和夜间返程一起算进去。很多时候交通成本和时间消耗，不会比票价轻松。`;
  if (country === "France" || country === "United Kingdom") return `${event.city} 场更值得先看夜间返程、酒店区域和步行路线。演后人流一起来，临时找车通常最容易出问题。`;
  if (country === "Thailand" || country === "Singapore" || country === "Hong Kong" || country === "Taiwan" || country === "Macau" || country === "Indonesia" || country === "Philippines" || country === "Malaysia") return `${event.city} 这一场更建议先把支付方式、酒店位置和返程节奏想清楚。真正影响观演心情的，往往不是买到票，而是演后怎么顺利回去。`;
  return `${event.city} 这场演出建议优先把交通、酒店和散场后的路线看稳，再决定具体票档。`;
}

function refreshTourPlan(plan) {
  const regions = translateTags(plan.regions);
  const noteTemplates = [
    `${plan.artist} 这一轮已经出现巡演风向，具体日期还在等下一次官宣。这一栏会先盯住 ${regions.join("、")} 的官方入口和演出信号，日期一落地就会补进正式排期。`,
    `${plan.artist} 的下一轮巡演消息已经开始升温，但完整日期还没有落地。这里会先盯 ${regions.join("、")} 这些高频方向，等官宣下来再补进日历。`,
    `${plan.artist} 这波巡演已经有了明显信号，只是还差最后一轮日期官宣。${regions.join("、")} 会是优先关注的方向，确认后会直接转入正式场次。`
  ];
  return {
    ...plan,
    title: `${plan.artist} 巡演消息追踪`,
    note: noteTemplates[hashValue(plan.slug) % noteTemplates.length],
    regions
  };
}

function polishGuide(guide) {
  const body = guide.body
    .replace(/试运行阶段/g, "现在这版")
    .replace(/当前先/g, "这一页先把")
    .replace(/先通过 GitHub issue 收集/g, "现在通过投稿入口收集")
    .replace(/先把/g, "把")
    .replace(/样板/g, "重点页");

  return {
    ...guide,
    body
  };
}

async function main() {
  const [artists, events, guides, tourPlans] = await Promise.all([
    readJson("artists.json"),
    readJson("events.json"),
    readJson("guides.json"),
    readJson("tour-plans.json")
  ]);

  const nextArtists = artists.map((artist) => ({
    ...artist,
    genres: translateTags(artist.genres),
    tagline: buildArtistTagline(artist),
    intro: buildArtistIntro(artist),
    members: refreshMemberProfiles(artist)
  }));

  const nextEvents = events.map((event) => ({
    ...event,
    tags: translateTags(event.tags),
    description: buildEventDescription(event),
    purchaseHint: buildPurchaseHint(event),
    travelNote: buildTravelNote(event)
  }));

  const nextGuides = guides.map(polishGuide);
  const nextPlans = tourPlans.map(refreshTourPlan);

  await Promise.all([
    writeJson("artists.json", nextArtists),
    writeJson("events.json", nextEvents),
    writeJson("guides.json", nextGuides),
    writeJson("tour-plans.json", nextPlans)
  ]);

  console.log(JSON.stringify({
    task: "refresh-editorial",
    artists: nextArtists.length,
    events: nextEvents.length,
    guides: nextGuides.length,
    tourPlans: nextPlans.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
