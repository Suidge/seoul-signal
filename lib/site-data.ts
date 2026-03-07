export type TicketLink = {
  label: string;
  href: string;
  type: "official" | "resale" | "fanclub";
};

export type EventStatusValue = "on_sale" | "announced" | "sold_out";

export type EventItem = {
  id: string;
  artist: string;
  artistSlug?: string;
  slug: string;
  city: string;
  country: string;
  venue: string;
  startDate: string;
  timezone?: string;
  status: EventStatusValue;
  source: string;
  sourceUrl?: string;
  sourceConfidence?: "official" | "partner" | "venue";
  tags: string[];
  title?: string;
  description?: string;
  purchaseHint?: string;
  priceNote?: string;
  travelNote?: string;
  checklist?: string[];
  ticketSaleDate?: string;
  doorsTime?: string;
  ticketLinks: TicketLink[];
};

export type ArtistProfile = {
  slug: string;
  name: string;
  nameKo?: string;
  fandom?: string;
  tagline: string;
  intro: string;
  accent: string;
  officialUrl?: string;
};

export const artists: ArtistProfile[] = [
  {
    slug: "seventeen",
    name: "SEVENTEEN",
    nameKo: "세븐틴",
    fandom: "CARAT",
    tagline: "Self-producing performance powerhouse",
    intro: "适合做中文巡演聚合入口的典型团体，官方公告和票务节奏都较为明确。",
    accent: "#d36e57",
    officialUrl: "https://www.weverse.io/seventeen"
  },
  {
    slug: "blackpink",
    name: "BLACKPINK",
    nameKo: "블랙핑크",
    fandom: "BLINK",
    tagline: "Global stadium-scale K-pop headliner",
    intro: "国际巡演声量极大，适合验证多地区、多票务入口和高需求活动的展示方式。",
    accent: "#2a1c1f",
    officialUrl: "https://www.weverse.io/blackpink"
  },
  {
    slug: "aespa",
    name: "aespa",
    nameKo: "에스파",
    fandom: "MY",
    tagline: "High-concept live production with global reach",
    intro: "适合作为日本、北美和亚洲巡演站点的跨区域内容样本。",
    accent: "#5377a4",
    officialUrl: "https://www.weverse.io/aespa"
  },
  {
    slug: "stray-kids",
    name: "Stray Kids",
    nameKo: "스트레이 키즈",
    fandom: "STAY",
    tagline: "Arena and stadium routing with frequent updates",
    intro: "适合展示同一艺人多城市排期、官宣分批释放和高密度日程。",
    accent: "#6a4a34"
  },
  {
    slug: "le-sserafim",
    name: "LE SSERAFIM",
    nameKo: "르세라핌",
    fandom: "FEARNOT",
    tagline: "Fast-rising global girl group with fashion-led identity",
    intro: "适合承载演唱会信息之外的应援、穿搭和观演攻略内容。",
    accent: "#49614d"
  },
  {
    slug: "nct-dream",
    name: "NCT DREAM",
    nameKo: "엔시티 드림",
    fandom: "NCTzen",
    tagline: "Large fandom, frequent touring, strong city demand",
    intro: "适合验证城市榜单、提醒订阅和粉丝城市聚集页等未来模块。",
    accent: "#809447"
  }
];

export const featuredArtists = artists.map((artist) => artist.name);

export const events: EventItem[] = [
  {
    id: "svt-seoul-2026",
    artist: "SEVENTEEN",
    artistSlug: "seventeen",
    slug: "svt-seoul-2026",
    city: "Seoul",
    country: "South Korea",
    venue: "KSPO Dome",
    startDate: "2026-04-18T19:00:00+09:00",
    timezone: "Asia/Seoul",
    status: "on_sale",
    source: "Official artist notice",
    sourceUrl: "https://example.com/seventeen-seoul-notice",
    sourceConfidence: "official",
    tags: ["World Tour", "Korea", "VIP"],
    title: "SEVENTEEN World Tour in Seoul",
    description: "首尔场首演，适合验证站点对官方公告、预售规则和多票务入口的呈现方式。",
    purchaseHint: "CARAT 会员需要先完成预售认证，再进入正式购票流程。",
    priceNote: "通常会分 Floor、Stand 和 VIP Package，不同票档限制不同。",
    travelNote: "海外观众更适合提前锁定住宿，KSPO Dome 周边演出日交通波动较大。",
    checklist: ["确认实名规则", "确认预售认证时间", "准备国际信用卡或代付方案"],
    ticketSaleDate: "2026-03-12T20:00:00+09:00",
    doorsTime: "18:00",
    ticketLinks: [
      {
        label: "Official Ticket",
        href: "https://example.com/tickets/seventeen-seoul",
        type: "official"
      },
      {
        label: "Fanclub Presale",
        href: "https://example.com/fanclub/seventeen-seoul",
        type: "fanclub"
      }
    ]
  },
  {
    id: "svt-singapore-2026",
    artist: "SEVENTEEN",
    artistSlug: "seventeen",
    slug: "svt-singapore-2026",
    city: "Singapore",
    country: "Singapore",
    venue: "Singapore Indoor Stadium",
    startDate: "2026-06-13T19:30:00+08:00",
    timezone: "Asia/Singapore",
    status: "announced",
    source: "Promoter release",
    sourceUrl: "https://example.com/seventeen-singapore-promoter",
    sourceConfidence: "partner",
    tags: ["Asia", "Arena", "Travel"],
    title: "SEVENTEEN World Tour in Singapore",
    description: "东南亚高需求场次，适合补充旅行城市的购票和交通提示。",
    purchaseHint: "主办方售票页通常会分公开发售和银行卡优惠档。",
    priceNote: "跨境支付前先确认手续费和退改规则。",
    travelNote: "新加坡适合做中文旅行辅助信息，比如交通卡和住宿区域建议。",
    checklist: ["关注主办方邮件通知", "准备护照姓名拼写", "确认支付限额"],
    ticketLinks: [
      {
        label: "Promoter Sale",
        href: "https://example.com/tickets/seventeen-singapore",
        type: "official"
      }
    ]
  },
  {
    id: "bp-la-2026",
    artist: "BLACKPINK",
    artistSlug: "blackpink",
    slug: "bp-la-2026",
    city: "Los Angeles",
    country: "United States",
    venue: "BMO Stadium",
    startDate: "2026-05-09T20:00:00-07:00",
    timezone: "America/Los_Angeles",
    status: "announced",
    source: "Promoter release",
    sourceUrl: "https://example.com/blackpink-la-promoter",
    sourceConfidence: "partner",
    tags: ["North America", "Stadium", "Presale soon"],
    title: "BLACKPINK in Los Angeles",
    description: "高热度北美体育场场次，适合展示预售节点和大场馆入场建议。",
    purchaseHint: "北美场通常会有多轮 presale，优先判断你能否进入官方或赞助商预售。",
    priceNote: "体育场场次票价跨度很大，建议同时比较座位视野和总价。",
    travelNote: "洛杉矶跨区通勤时间成本高，演出当天建议优先围绕场馆安排行程。",
    checklist: ["确认 presale code 来源", "比较座位区块", "预留停车或网约车预算"],
    ticketLinks: [
      {
        label: "Promoter",
        href: "https://example.com/tickets/blackpink-la",
        type: "official"
      }
    ]
  },
  {
    id: "bp-paris-2026",
    artist: "BLACKPINK",
    artistSlug: "blackpink",
    slug: "bp-paris-2026",
    city: "Paris",
    country: "France",
    venue: "Accor Arena",
    startDate: "2026-07-03T20:00:00+02:00",
    timezone: "Europe/Paris",
    status: "on_sale",
    source: "Ticketing partner page",
    sourceUrl: "https://example.com/blackpink-paris-ticketing",
    sourceConfidence: "partner",
    tags: ["Europe", "Arena", "VIP package"],
    title: "BLACKPINK in Paris",
    description: "欧洲核心站点，适合展示 VIP package 和跨币种支付说明。",
    purchaseHint: "优先确认票务平台是否限制账户地区，以及 VIP package 的转让规则。",
    priceNote: "跨币种刷卡会带来汇率和手续费差异。",
    travelNote: "巴黎场适合补充场馆周边住宿与地铁末班时间说明。",
    checklist: ["确认平台账户地区", "检查欧元结算卡", "查看 VIP 入场时间"],
    ticketLinks: [
      {
        label: "Official Sale",
        href: "https://example.com/tickets/blackpink-paris",
        type: "official"
      }
    ]
  },
  {
    id: "aespa-tokyo-2026",
    artist: "aespa",
    artistSlug: "aespa",
    slug: "aespa-tokyo-2026",
    city: "Tokyo",
    country: "Japan",
    venue: "Ariake Arena",
    startDate: "2026-03-29T18:30:00+09:00",
    timezone: "Asia/Tokyo",
    status: "sold_out",
    source: "Venue schedule",
    sourceUrl: "https://example.com/aespa-tokyo-venue",
    sourceConfidence: "venue",
    tags: ["Japan", "Arena", "Waitlist"],
    title: "aespa Live Tour in Tokyo",
    description: "日本场售罄后更需要明确等待名单和官方转售渠道。",
    purchaseHint: "优先等待官方补票和抽选，不建议跳过验证机制直接买来路不明的票。",
    priceNote: "日本场往往存在会员抽选和多轮开票。",
    travelNote: "东京场适合补充演出结束后的返程和周边住宿建议。",
    checklist: ["关注官方补票", "确认电子票取票方式", "留意转售合法性"],
    ticketLinks: [
      {
        label: "Official Waitlist",
        href: "https://example.com/tickets/aespa-tokyo",
        type: "official"
      },
      {
        label: "Verified Resale",
        href: "https://example.com/resale/aespa-tokyo",
        type: "resale"
      }
    ]
  },
  {
    id: "aespa-sydney-2026",
    artist: "aespa",
    artistSlug: "aespa",
    slug: "aespa-sydney-2026",
    city: "Sydney",
    country: "Australia",
    venue: "Qudos Bank Arena",
    startDate: "2026-08-15T19:30:00+10:00",
    timezone: "Australia/Sydney",
    status: "announced",
    source: "Official tour page",
    sourceUrl: "https://example.com/aespa-sydney-tour",
    sourceConfidence: "official",
    tags: ["Oceania", "Arena", "Travel"],
    title: "aespa in Sydney",
    description: "澳洲场次适合测试时区、旅行和支付说明的组合展示。",
    purchaseHint: "关注 tour page 中的预售窗口和当地信用卡发卡行活动。",
    priceNote: "国际支付时关注外币换算。",
    travelNote: "演出结束后部分公共交通频次会下降，建议预留返程时间。",
    checklist: ["确认澳洲时区", "设置开票提醒", "关注场馆禁带规则"],
    ticketLinks: [
      {
        label: "Tour Page",
        href: "https://example.com/tickets/aespa-sydney",
        type: "official"
      }
    ]
  },
  {
    id: "sk-mexico-city-2026",
    artist: "Stray Kids",
    artistSlug: "stray-kids",
    slug: "sk-mexico-city-2026",
    city: "Mexico City",
    country: "Mexico",
    venue: "Palacio de los Deportes",
    startDate: "2026-09-04T20:00:00-06:00",
    timezone: "America/Mexico_City",
    status: "on_sale",
    source: "Promoter release",
    sourceUrl: "https://example.com/straykids-mexico-promoter",
    sourceConfidence: "partner",
    tags: ["Latin America", "Arena", "High demand"],
    title: "Stray Kids in Mexico City",
    description: "高需求拉美场次，适合展示排队和高需求购票提示。",
    purchaseHint: "高需求场次要提前登录票务账户并确认支付工具。",
    priceNote: "售票高峰时不同区块放票可能分批释放。",
    travelNote: "建议关注场馆周边出行安全和官方入场路线。",
    checklist: ["提前登录账户", "备好双支付方式", "关注官方入场公告"],
    ticketLinks: [
      {
        label: "Official Ticket",
        href: "https://example.com/tickets/straykids-mexico",
        type: "official"
      }
    ]
  },
  {
    id: "lsf-hong-kong-2026",
    artist: "LE SSERAFIM",
    artistSlug: "le-sserafim",
    slug: "lsf-hong-kong-2026",
    city: "Hong Kong",
    country: "Hong Kong",
    venue: "AsiaWorld-Arena",
    startDate: "2026-05-24T19:00:00+08:00",
    timezone: "Asia/Hong_Kong",
    status: "announced",
    source: "Official artist notice",
    sourceUrl: "https://example.com/lesserafim-hk-notice",
    sourceConfidence: "official",
    tags: ["Asia", "Arena", "Local payment"],
    title: "LE SSERAFIM in Hong Kong",
    description: "适合补充港区支付、实名和中文观演说明。",
    purchaseHint: "港区票务通常会涉及本地支付方式和实名规则，先看清条款再抢票。",
    priceNote: "不同平台支持的支付方式差异较大。",
    travelNote: "适合在详情页补充口岸和场馆交通建议。",
    checklist: ["确认平台支付方式", "确认实名需求", "提前规划口岸路线"],
    ticketLinks: [
      {
        label: "Official Sale",
        href: "https://example.com/tickets/lesserafim-hk",
        type: "official"
      }
    ]
  },
  {
    id: "dream-london-2026",
    artist: "NCT DREAM",
    artistSlug: "nct-dream",
    slug: "dream-london-2026",
    city: "London",
    country: "United Kingdom",
    venue: "The O2",
    startDate: "2026-10-11T19:30:00+01:00",
    timezone: "Europe/London",
    status: "on_sale",
    source: "Official tour page",
    sourceUrl: "https://example.com/nctdream-london-tour",
    sourceConfidence: "official",
    tags: ["Europe", "Arena", "VIP"],
    title: "NCT DREAM in London",
    description: "欧洲场常见的 VIP、站票和预售并存，适合做规则说明。",
    purchaseHint: "英国票务平台可能要求排队系统和验证码，建议提前就绪。",
    priceNote: "要同时比较站票和座票体验，不只是价格。",
    travelNote: "伦敦演出结束后优先确认地铁运营时间和返程区域。",
    checklist: ["提前登录票务平台", "确认 queue 规则", "对比站票与座票"],
    ticketLinks: [
      {
        label: "Official Ticket",
        href: "https://example.com/tickets/nctdream-london",
        type: "official"
      }
    ]
  }
];

export const productPillars = [
  {
    title: "全网巡演抓取",
    body: "聚合艺人官宣、票务平台、场馆日历与主办方发布，统一沉淀为标准化事件。"
  },
  {
    title: "中文用户优先",
    body: "时间、城市、票务状态、入场说明和交通建议都按中文语境组织，不只是翻译。"
  },
  {
    title: "向 fandom 平台扩展",
    body: "后续可增加艺人主页、饭拍内容、应援攻略、收藏夹、通知订阅与社区互动。"
  }
];

export const architectureTracks = [
  {
    name: "Frontend",
    detail: "Next.js App Router + TypeScript，先做内容型站点，后续可接登录、会员、SEO、ISR。"
  },
  {
    name: "Data",
    detail: "建议 PostgreSQL + Prisma，核心模型围绕 artist、tour、event、ticket_link、source_snapshot。"
  },
  {
    name: "Ingestion",
    detail: "独立抓取任务层，优先从官方公告、票务页和场馆 RSS/API 获取，再补充人工审核流。"
  },
  {
    name: "Platform",
    detail: "后续接对象存储、消息队列、搜索和用户系统，逐步演进为中文 K-pop fandom hub。"
  }
];

export function getStatusLabel(status: EventStatusValue) {
  switch (status) {
    case "on_sale":
      return "售票中";
    case "announced":
      return "已官宣";
    case "sold_out":
      return "已售罄";
    default:
      return status;
  }
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function findArtistByName(name: string) {
  return artists.find((artist) => artist.name === name) ?? null;
}

export function findArtistBySlug(slug: string) {
  return artists.find((artist) => artist.slug === slug) ?? null;
}

export function slugifyArtistName(name: string) {
  return findArtistByName(name)?.slug ?? name.toLowerCase().replaceAll(" ", "-");
}

export function uniqueCountries(items: EventItem[]) {
  return [...new Set(items.map((item) => item.country))].sort();
}

export function formatMonthLabel(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(new Date(date));
}
