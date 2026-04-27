export type LegalArea =
  | "Housing"
  | "Employment"
  | "Debt"
  | "Consumer Rights"
  | "Family"
  | "Immigration"
  | "Criminal"
  | "Business"
  | "Other";

export type Jurisdiction =
  | "England and Wales"
  | "Scotland"
  | "Northern Ireland";

export interface Review {
  id:               string;
  reviewerName:     string;
  rating:           number;   /* 1–5 */
  comment:          string;
  date:             string;   /* ISO date string */
  verified_contact: boolean;  /* only show if true */
}

export interface Solicitor {
  id:             string;
  firmName:       string;
  solicitorName:  string;
  title:          string;
  jobTitle?:      string;
  city:           string;
  address:        string;
  postcode:       string;
  lat:            number;
  lng:            number;
  legalAreas:     LegalArea[];
  jurisdictions?: string[];
  jurisdiction?:  Jurisdiction;
  rating:         number;
  reviewCount?:   number;
  phone:          string;
  email:          string;
  website:        string;
  sraNumber:      string;
  verified:       boolean;
  featured?:      boolean;
  description:    string;
  reviews:        Review[];
  source?:        "mock" | "supabase";
}

/* ─────────────────────────────────────────────────── */

export const SOLICITORS: Solicitor[] = [

  /* ── 1 — Adams & Partners LLP ── */
  {
    id: "1", firmName: "Adams & Partners LLP", solicitorName: "Sarah Adams", title: "Managing Partner",
    city: "London", address: "12 Clerkenwell Road, Clerkenwell", postcode: "EC1A 1BB",
    lat: 51.5200, lng: -0.0990,
    legalAreas: ["Housing", "Employment", "Debt"],
    jurisdiction: "England and Wales",
    rating: 4.8, reviewCount: 142,
    phone: "020 7123 4567", email: "enquiries@adamspartners.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "123456",
    verified: true,
    description: "Adams & Partners LLP is a highly regarded London law firm with over 20 years of experience helping individuals and families navigate housing disputes, workplace issues, and debt recovery. We pride ourselves on clear communication, transparent fees, and outcomes that matter to our clients. Based in Clerkenwell, we act for clients across Greater London and the Home Counties.",
    reviews: [
      { id: "r1a", reviewerName: "Marcus T.", rating: 5, comment: "Sarah guided me through an unlawful eviction case with incredible professionalism. I felt supported every step of the way.", date: "2026-03-15", verified_contact: true },
      { id: "r1b", reviewerName: "Diane K.", rating: 5, comment: "Excellent service from start to finish. The team responded quickly and the outcome was far better than I expected.", date: "2026-02-28", verified_contact: true },
      { id: "r1c", reviewerName: "Oluwaseun B.", rating: 4, comment: "Very knowledgeable solicitor. Slightly slow on email responses at times but the overall result was great.", date: "2026-01-10", verified_contact: true },
      { id: "r1d", reviewerName: "Claire M.", rating: 5, comment: "Handled my employment tribunal case brilliantly. Highly recommend.", date: "2025-12-20", verified_contact: false },
    ],
  },

  /* ── 2 — Blake Solicitors ── */
  {
    id: "2", firmName: "Blake Solicitors", solicitorName: "James Blake", title: "Principal Solicitor",
    city: "London", address: "7 Chancery Lane, Holborn", postcode: "WC2A 1LG",
    lat: 51.5150, lng: -0.1130,
    legalAreas: ["Family", "Immigration", "Criminal"],
    jurisdiction: "England and Wales",
    rating: 4.6, reviewCount: 98,
    phone: "020 7234 5678", email: "james@blakesolicitors.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "234567",
    verified: true,
    description: "Blake Solicitors is a specialist firm based in the heart of London's legal district. We have extensive experience in family law, complex immigration matters, and criminal defence. James Blake has appeared in the Crown Court on numerous occasions and has a track record of achieving excellent results for clients at all stages of proceedings.",
    reviews: [
      { id: "r2a", reviewerName: "Amara J.", rating: 5, comment: "James handled my spouse visa application with great attention to detail. Approved first time.", date: "2026-04-01", verified_contact: true },
      { id: "r2b", reviewerName: "Peter S.", rating: 4, comment: "Good service during a difficult divorce. Kept things calm and focused on reaching a fair settlement.", date: "2026-02-14", verified_contact: true },
      { id: "r2c", reviewerName: "Tunde O.", rating: 5, comment: "Outstanding criminal defence. The charges were dropped before trial.", date: "2025-11-05", verified_contact: true },
    ],
  },

  /* ── 3 — Citylaw Group ── */
  {
    id: "3", firmName: "Citylaw Group", solicitorName: "Priya Sharma", title: "Senior Partner",
    city: "London", address: "One Canada Square, Canary Wharf", postcode: "E14 5AB",
    lat: 51.5055, lng: -0.0210,
    legalAreas: ["Business", "Employment", "Consumer Rights"],
    jurisdiction: "England and Wales",
    rating: 4.9, reviewCount: 211,
    phone: "020 7345 6789", email: "info@citylawgroup.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "345678",
    verified: true,
    description: "Citylaw Group is one of London's leading commercial law firms, operating from Canary Wharf. We advise SMEs and corporate clients on employment disputes, consumer contracts, and business law matters. Priya Sharma leads a team of 12 solicitors and has been recognised in the Legal 500 for her work in commercial employment law.",
    reviews: [
      { id: "r3a", reviewerName: "Rashid A.", rating: 5, comment: "Superb commercial advice. Saved our startup thousands in a contract dispute.", date: "2026-04-10", verified_contact: true },
      { id: "r3b", reviewerName: "Fiona L.", rating: 5, comment: "Priya is exceptional. She explained everything in plain English and fought hard for us.", date: "2026-03-22", verified_contact: true },
      { id: "r3c", reviewerName: "Gary B.", rating: 5, comment: "Best solicitor I have ever instructed. Will use again without hesitation.", date: "2026-02-05", verified_contact: true },
      { id: "r3d", reviewerName: "Nadia H.", rating: 4, comment: "Very professional firm. Slightly higher fees than average but worth every penny.", date: "2026-01-18", verified_contact: true },
    ],
  },

  /* ── 4 — Dunmore Legal ── */
  {
    id: "4", firmName: "Dunmore Legal", solicitorName: "Tom Dunmore", title: "Solicitor",
    city: "London", address: "45 Victoria Street, Westminster", postcode: "SW1A 2AA",
    lat: 51.5010, lng: -0.1270,
    legalAreas: ["Immigration", "Criminal"],
    jurisdiction: "England and Wales",
    rating: 4.3, reviewCount: 67,
    phone: "020 7456 7890", email: "tom@dunmorelegal.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "456789",
    verified: false,
    description: "Dunmore Legal is a boutique practice near Westminster specialising in immigration law and criminal defence. Tom Dunmore has over a decade of experience representing clients at immigration tribunals and in Crown Court proceedings. We offer competitive fixed-fee consultations for new clients.",
    reviews: [
      { id: "r4a", reviewerName: "Blessing O.", rating: 4, comment: "Tom was calm and reassuring throughout my asylum claim. Result was positive.", date: "2026-03-08", verified_contact: true },
      { id: "r4b", reviewerName: "Stefan K.", rating: 5, comment: "Excellent advice on my deportation appeal. Highly recommended for immigration matters.", date: "2025-12-01", verified_contact: true },
    ],
  },

  /* ── 5 — Eastbridge Law ── */
  {
    id: "5", firmName: "Eastbridge Law", solicitorName: "Nina Patel", title: "Senior Solicitor",
    city: "London", address: "3 London Bridge Street, London Bridge", postcode: "SE1 7PB",
    lat: 51.5040, lng: -0.0870,
    legalAreas: ["Debt", "Consumer Rights", "Housing"],
    jurisdiction: "England and Wales",
    rating: 4.7, reviewCount: 133,
    phone: "020 7567 8901", email: "nina@eastbridgelaw.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "567890",
    verified: true,
    description: "Eastbridge Law is a specialist debt and housing law firm based at London Bridge. We help individuals facing debt recovery action, county court judgments, and housing possession proceedings. Nina Patel has secured positive outcomes for hundreds of clients facing financial difficulty and is a recognised expert in consumer credit disputes.",
    reviews: [
      { id: "r5a", reviewerName: "Janet W.", rating: 5, comment: "Nina stopped the possession order and we kept our home. I cannot thank her enough.", date: "2026-04-15", verified_contact: true },
      { id: "r5b", reviewerName: "Kofi A.", rating: 5, comment: "Brilliant at handling a complex debt dispute. Very affordable too.", date: "2026-03-02", verified_contact: true },
      { id: "r5c", reviewerName: "Leanne P.", rating: 4, comment: "Good firm. Slightly long wait times for appointments but the advice was first rate.", date: "2026-01-25", verified_contact: true },
    ],
  },

  /* ── 6 — Fletcher & Co ── */
  {
    id: "6", firmName: "Fletcher & Co", solicitorName: "Mark Fletcher", title: "Director",
    city: "Manchester", address: "22 Deansgate, City Centre", postcode: "M1 1AE",
    lat: 53.4808, lng: -2.2426,
    legalAreas: ["Employment", "Housing"],
    jurisdiction: "England and Wales",
    rating: 4.5, reviewCount: 89,
    phone: "0161 123 4567", email: "mark@fletcherandco.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "678901",
    verified: true,
    description: "Fletcher & Co is a well-established Manchester firm with particular expertise in employment law and housing disputes. Mark Fletcher has over 15 years of experience representing employees in unfair dismissal, discrimination, and redundancy claims. We are known for our straightforward approach and no-win no-fee arrangements in suitable cases.",
    reviews: [
      { id: "r6a", reviewerName: "Sandra H.", rating: 5, comment: "Won my unfair dismissal case. Mark was brilliant at tribunal.", date: "2026-02-20", verified_contact: true },
      { id: "r6b", reviewerName: "Dean C.", rating: 4, comment: "Helped me resolve a housing disrepair issue with my landlord. Efficient and professional.", date: "2026-01-14", verified_contact: true },
    ],
  },

  /* ── 7 — Greater North Solicitors ── */
  {
    id: "7", firmName: "Greater North Solicitors", solicitorName: "Aisha Rahman", title: "Partner",
    city: "Manchester", address: "18 King Street, Manchester City Centre", postcode: "M2 3HQ",
    lat: 53.4830, lng: -2.2380,
    legalAreas: ["Family", "Immigration"],
    jurisdiction: "England and Wales",
    rating: 4.4, reviewCount: 54,
    phone: "0161 234 5678", email: "aisha@greaternorthsolicitors.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "789012",
    verified: true,
    description: "Greater North Solicitors provides compassionate and expert legal advice in family and immigration law. Aisha Rahman is an accredited family law mediator and has handled hundreds of divorce and child arrangement cases. Our immigration team assists clients with spouse visas, settlement applications, and appeals.",
    reviews: [
      { id: "r7a", reviewerName: "Miriam S.", rating: 5, comment: "Aisha made a very difficult divorce as smooth as possible. Wonderful support.", date: "2026-03-18", verified_contact: true },
      { id: "r7b", reviewerName: "Hassan M.", rating: 4, comment: "Great help with our family visa. Clear communication throughout.", date: "2025-12-10", verified_contact: true },
    ],
  },

  /* ── 8 — Hargreaves Law ── */
  {
    id: "8", firmName: "Hargreaves Law", solicitorName: "David Hargreaves", title: "Principal",
    city: "Manchester", address: "5 Piccadilly Gardens, Manchester", postcode: "M4 1HQ",
    lat: 53.4870, lng: -2.2320,
    legalAreas: ["Criminal", "Business", "Debt"],
    jurisdiction: "England and Wales",
    rating: 4.2, reviewCount: 41,
    phone: "0161 345 6789", email: "david@hargreaveslaw.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "890123",
    verified: false,
    description: "Hargreaves Law is a Manchester firm handling criminal defence, business disputes, and debt matters. David Hargreaves has extensive Magistrates' and Crown Court experience and provides practical, commercially minded advice to small businesses in dispute.",
    reviews: [
      { id: "r8a", reviewerName: "Callum R.", rating: 4, comment: "Solid defence representation at the Magistrates Court. Would use again.", date: "2026-01-30", verified_contact: true },
    ],
  },

  /* ── 9 — Irons & Webb ── */
  {
    id: "9", firmName: "Irons & Webb", solicitorName: "Claire Irons", title: "Founding Partner",
    city: "Birmingham", address: "9 Colmore Row, Birmingham City Centre", postcode: "B1 1BB",
    lat: 52.4800, lng: -1.8990,
    legalAreas: ["Housing", "Debt", "Consumer Rights"],
    jurisdiction: "England and Wales",
    rating: 4.6, reviewCount: 102,
    phone: "0121 123 4567", email: "claire@ironswebb.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "901234",
    verified: true,
    description: "Irons & Webb is a Birmingham-based firm dedicated to protecting the rights of individuals in housing and financial disputes. Claire Irons has a distinguished record of challenging unlawful evictions, pursuing disrepair claims, and representing clients facing possession proceedings. Fixed-fee consultations available.",
    reviews: [
      { id: "r9a", reviewerName: "Brenda O.", rating: 5, comment: "Stopped an illegal eviction in 48 hours. Exceptional service.", date: "2026-04-02", verified_contact: true },
      { id: "r9b", reviewerName: "Mohammed A.", rating: 5, comment: "Great help with a mortgage arrears problem. Claire was incredibly reassuring.", date: "2026-02-16", verified_contact: true },
      { id: "r9c", reviewerName: "Tracey F.", rating: 4, comment: "Professional and efficient. Resolved my consumer dispute quickly.", date: "2025-11-22", verified_contact: true },
    ],
  },

  /* ── 10 — Justice Point ── */
  {
    id: "10", firmName: "Justice Point", solicitorName: "Raj Kapoor", title: "Senior Associate",
    city: "Birmingham", address: "14 Temple Row, Birmingham", postcode: "B2 4QA",
    lat: 52.4820, lng: -1.8960,
    legalAreas: ["Immigration", "Employment", "Criminal"],
    jurisdiction: "England and Wales",
    rating: 4.1, reviewCount: 38,
    phone: "0121 234 5678", email: "raj@justicepoint.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "012345",
    verified: false,
    description: "Justice Point provides accessible legal services to individuals in Birmingham and the wider West Midlands. Raj Kapoor has a particular focus on immigration casework for families and individuals, as well as employment and criminal matters.",
    reviews: [
      { id: "r10a", reviewerName: "Yvonne T.", rating: 4, comment: "Helpful with my work permit application. Kept me informed at every stage.", date: "2026-03-25", verified_contact: true },
    ],
  },

  /* ── 11 — Kirkby & Sons ── */
  {
    id: "11", firmName: "Kirkby & Sons", solicitorName: "Peter Kirkby", title: "Managing Solicitor",
    city: "Leeds", address: "30 Park Row, Leeds City Centre", postcode: "LS1 1BA",
    lat: 53.7997, lng: -1.5492,
    legalAreas: ["Family", "Business", "Housing"],
    jurisdiction: "England and Wales",
    rating: 4.7, reviewCount: 76,
    phone: "0113 123 4567", email: "peter@kirkbyandsons.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "112233",
    verified: true,
    description: "Kirkby & Sons is a long-established Leeds law firm offering a personal, partner-led service in family, business, and housing law. Peter Kirkby brings a wealth of practical experience to every case and is known for his approachable manner and clear, no-nonsense advice.",
    reviews: [
      { id: "r11a", reviewerName: "Alison G.", rating: 5, comment: "Peter helped us through a very stressful business dissolution. Professional and reassuring.", date: "2026-04-08", verified_contact: true },
      { id: "r11b", reviewerName: "Wayne D.", rating: 5, comment: "Brilliant family solicitor. Child arrangements order handled sensitively.", date: "2026-02-11", verified_contact: true },
    ],
  },

  /* ── 12 — Leeds Legal Centre ── */
  {
    id: "12", firmName: "Leeds Legal Centre", solicitorName: "Fatima Hussain", title: "Solicitor",
    city: "Leeds", address: "6 Boar Lane, Leeds", postcode: "LS2 7HY",
    lat: 53.8010, lng: -1.5460,
    legalAreas: ["Debt", "Consumer Rights", "Employment"],
    jurisdiction: "England and Wales",
    rating: 4.5, reviewCount: 93,
    phone: "0113 234 5678", email: "fatima@leedslegalcentre.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "223344",
    verified: true,
    description: "Leeds Legal Centre is a community-focused firm helping individuals across West Yorkshire with debt, consumer, and employment problems. Fatima Hussain is committed to making justice accessible and offers a free 30-minute initial consultation to all new clients.",
    reviews: [
      { id: "r12a", reviewerName: "Karl S.", rating: 5, comment: "Free consultation saved us hundreds. Fatima sorted our council tax debt issue swiftly.", date: "2026-03-12", verified_contact: true },
      { id: "r12b", reviewerName: "Sonia R.", rating: 4, comment: "Helpful employment advice. Very reasonable fees.", date: "2026-01-05", verified_contact: true },
    ],
  },

  /* ── 13 — Moore Solicitors ── */
  {
    id: "13", firmName: "Moore Solicitors", solicitorName: "Helen Moore", title: "Solicitor",
    city: "Sheffield", address: "11 Tudor Square, Sheffield City Centre", postcode: "S1 2GU",
    lat: 53.3811, lng: -1.4701,
    legalAreas: ["Housing", "Criminal"],
    jurisdiction: "England and Wales",
    rating: 4.3, reviewCount: 49,
    phone: "0114 123 4567", email: "helen@mooresolicitors.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "334455",
    verified: true,
    description: "Moore Solicitors is a Sheffield practice specialising in housing law and criminal defence. Helen Moore has built a strong reputation for tenacious advocacy and clear, practical advice. We offer evening and weekend appointments for clients who cannot attend during normal working hours.",
    reviews: [
      { id: "r13a", reviewerName: "Phil T.", rating: 4, comment: "Helen was great during my housing disrepair claim. Settled for more than I expected.", date: "2026-02-27", verified_contact: true },
    ],
  },

  /* ── 14 — Northern Rights Law ── */
  {
    id: "14", firmName: "Northern Rights Law", solicitorName: "Chris Booth", title: "Partner",
    city: "Sheffield", address: "24 Fargate, Sheffield", postcode: "S2 4SU",
    lat: 53.3790, lng: -1.4720,
    legalAreas: ["Employment", "Immigration", "Family"],
    jurisdiction: "England and Wales",
    rating: 4.8, reviewCount: 117,
    phone: "0114 234 5678", email: "chris@northernrightslaw.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "445566",
    verified: true,
    description: "Northern Rights Law is one of Sheffield's most respected firms for employment, immigration, and family law. Chris Booth has appeared in the Employment Appeal Tribunal and has a distinguished record in discrimination law. Our multilingual team supports clients in Urdu, Arabic, and Polish.",
    reviews: [
      { id: "r14a", reviewerName: "Zara H.", rating: 5, comment: "Chris won my race discrimination case. I felt heard and fully supported.", date: "2026-04-18", verified_contact: true },
      { id: "r14b", reviewerName: "Andrzej W.", rating: 5, comment: "Excellent immigration advice. They helped my whole family's settlement applications.", date: "2026-03-01", verified_contact: true },
      { id: "r14c", reviewerName: "Louise B.", rating: 5, comment: "Highly recommend for family law. Chris is calm, thorough, and genuinely cares.", date: "2026-01-22", verified_contact: true },
    ],
  },

  /* ── 15 — Oakwood Legal ── */
  {
    id: "15", firmName: "Oakwood Legal", solicitorName: "Amanda Oakley", title: "Director",
    city: "Bristol", address: "40 Corn Street, Bristol City Centre", postcode: "BS1 4ST",
    lat: 51.4545, lng: -2.5879,
    legalAreas: ["Business", "Consumer Rights", "Debt"],
    jurisdiction: "England and Wales",
    rating: 4.6, reviewCount: 84,
    phone: "0117 123 4567", email: "amanda@oakwoodlegal.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "556677",
    verified: true,
    description: "Oakwood Legal is Bristol's go-to firm for business and commercial disputes. Amanda Oakley advises startups, SMEs, and individuals on contract disputes, consumer rights, and debt recovery. We are known for practical, cost-effective solutions and transparent billing.",
    reviews: [
      { id: "r15a", reviewerName: "Tom B.", rating: 5, comment: "Amanda resolved a contract dispute with a supplier efficiently. Great value.", date: "2026-04-05", verified_contact: true },
      { id: "r15b", reviewerName: "Emma C.", rating: 4, comment: "Good business legal advice. Clear fees and very responsive.", date: "2026-02-19", verified_contact: true },
    ],
  },

  /* ── 16 — Portman & Associates ── */
  {
    id: "16", firmName: "Portman & Associates", solicitorName: "George Portman", title: "Senior Solicitor",
    city: "Bristol", address: "2 Clifton Down, Clifton", postcode: "BS8 1TH",
    lat: 51.4560, lng: -2.6000,
    legalAreas: ["Family", "Housing", "Immigration"],
    jurisdiction: "England and Wales",
    rating: 4.4, reviewCount: 61,
    phone: "0117 234 5678", email: "george@portmanassociates.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "667788",
    verified: true,
    description: "Portman & Associates is a family-oriented Bristol practice with expertise in housing, family, and immigration law. George Portman is a Resolution-accredited family solicitor committed to reaching constructive settlements wherever possible. We provide legal aid in suitable cases.",
    reviews: [
      { id: "r16a", reviewerName: "Rachel M.", rating: 4, comment: "George handled our housing case professionally and got us the outcome we needed.", date: "2026-03-14", verified_contact: true },
    ],
  },

  /* ── 17 — Quinn & MacLeod ── */
  {
    id: "17", firmName: "Quinn & MacLeod", solicitorName: "Fiona MacLeod", title: "Partner",
    city: "Edinburgh", address: "15 George Street, Edinburgh New Town", postcode: "EH1 1YZ",
    lat: 55.9533, lng: -3.1883,
    legalAreas: ["Housing", "Employment", "Family"],
    jurisdiction: "Scotland",
    rating: 4.7, reviewCount: 108,
    phone: "0131 123 4567", email: "fiona@quinnmacleod.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "778899",
    verified: true,
    description: "Quinn & MacLeod is a leading Edinburgh firm practising Scots law across housing, employment, and family matters. Fiona MacLeod is a member of the Law Society of Scotland and has an enviable track record in housing rights cases, including those involving section 11 notices and private rented sector disputes.",
    reviews: [
      { id: "r17a", reviewerName: "Isobel R.", rating: 5, comment: "Fiona was incredibly knowledgeable about Scottish housing law. Superb result.", date: "2026-04-12", verified_contact: true },
      { id: "r17b", reviewerName: "Callum F.", rating: 5, comment: "Outstanding employment advice. My redundancy settlement was much higher than offered.", date: "2026-02-22", verified_contact: true },
    ],
  },

  /* ── 18 — Ross Legal Scotland ── */
  {
    id: "18", firmName: "Ross Legal Scotland", solicitorName: "Alistair Ross", title: "Principal Solicitor",
    city: "Edinburgh", address: "8 Queen Street, Edinburgh", postcode: "EH2 2AB",
    lat: 55.9520, lng: -3.1940,
    legalAreas: ["Criminal", "Immigration", "Business"],
    jurisdiction: "Scotland",
    rating: 4.5, reviewCount: 72,
    phone: "0131 234 5678", email: "alistair@rosslegalscotland.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "889900",
    verified: true,
    description: "Ross Legal Scotland provides specialist criminal defence and immigration legal services in Edinburgh and across Scotland. Alistair Ross has extensive Sheriff Court and High Court experience and is recognised for his robust approach to criminal defence work.",
    reviews: [
      { id: "r18a", reviewerName: "Duncan S.", rating: 5, comment: "Alistair secured a not-guilty verdict. His preparation was meticulous.", date: "2026-03-28", verified_contact: true },
    ],
  },

  /* ── 19 — Stewart & Mackenzie ── */
  {
    id: "19", firmName: "Stewart & Mackenzie", solicitorName: "Iain Stewart", title: "Managing Partner",
    city: "Glasgow", address: "33 St Vincent Street, Glasgow City Centre", postcode: "G1 1DT",
    lat: 55.8617, lng: -4.2583,
    legalAreas: ["Debt", "Consumer Rights", "Employment"],
    jurisdiction: "Scotland",
    rating: 4.3, reviewCount: 55,
    phone: "0141 123 4567", email: "iain@stewartmackenzie.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "990011",
    verified: true,
    description: "Stewart & Mackenzie is a Glasgow firm serving working individuals and families with debt recovery, consumer rights, and employment issues. Iain Stewart is known for his plain-speaking style and commitment to making legal support accessible to all.",
    reviews: [
      { id: "r19a", reviewerName: "Gavin P.", rating: 4, comment: "Solid advice on a consumer dispute. Got my money back plus costs.", date: "2026-01-18", verified_contact: true },
    ],
  },

  /* ── 20 — Thompson & Partners ── */
  {
    id: "20", firmName: "Thompson & Partners", solicitorName: "Siobhan Thompson", title: "Senior Partner",
    city: "Belfast", address: "10 Chichester Street, Belfast City Centre", postcode: "BT1 1NB",
    lat: 54.5973, lng: -5.9301,
    legalAreas: ["Family", "Housing", "Criminal"],
    jurisdiction: "Northern Ireland",
    rating: 4.6, reviewCount: 91,
    phone: "028 9023 4567", email: "siobhan@thompsonpartners.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "001122",
    verified: true,
    description: "Thompson & Partners is one of Belfast's most trusted law firms, offering compassionate and expert legal support in family, housing, and criminal matters. Siobhan Thompson has over 18 years of experience and is a recognised authority on Northern Ireland family law.",
    reviews: [
      { id: "r20a", reviewerName: "Aoife M.", rating: 5, comment: "Siobhan guided me through a very difficult custody dispute with great sensitivity.", date: "2026-04-16", verified_contact: true },
      { id: "r20b", reviewerName: "Patrick D.", rating: 4, comment: "Good housing legal advice. Dealt with my landlord dispute professionally.", date: "2026-02-08", verified_contact: true },
    ],
  },

  /* ── 21 — Urban Law Chambers ── */
  {
    id: "21", firmName: "Urban Law Chambers", solicitorName: "Dan Urban", title: "Barrister-Solicitor",
    city: "Liverpool", address: "20 Water Street, Liverpool City Centre", postcode: "L1 1AA",
    lat: 53.4084, lng: -2.9916,
    legalAreas: ["Employment", "Housing", "Debt"],
    jurisdiction: "England and Wales",
    rating: 4.4, reviewCount: 63,
    phone: "0151 123 4567", email: "dan@urbanlawchambers.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "112244",
    verified: true,
    description: "Urban Law Chambers is a Liverpool firm combining solicitor and advocacy services in employment, housing, and debt law. Dan Urban has a background in barrister chambers and brings sharp analytical skills to complex disputes.",
    reviews: [
      { id: "r21a", reviewerName: "Linda T.", rating: 4, comment: "Dan sorted my employment issue quickly and professionally. Highly recommend.", date: "2026-03-20", verified_contact: true },
    ],
  },

  /* ── 22 — Vickers Solicitors ── */
  {
    id: "22", firmName: "Vickers Solicitors", solicitorName: "Jane Vickers", title: "Director",
    city: "Liverpool", address: "5 Castle Street, Liverpool", postcode: "L2 2QP",
    lat: 53.4100, lng: -2.9880,
    legalAreas: ["Consumer Rights", "Business"],
    jurisdiction: "England and Wales",
    rating: 4.6, reviewCount: 77,
    phone: "0151 234 5678", email: "jane@vickerssolicitors.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "223355",
    verified: true,
    description: "Vickers Solicitors is a commercial practice in Liverpool's historic business district. Jane Vickers advises small and medium-sized businesses on contract disputes, trading standards, and consumer law compliance. A highly practical and commercially aware firm.",
    reviews: [
      { id: "r22a", reviewerName: "Barry H.", rating: 5, comment: "Jane dealt with our consumer contract dispute brilliantly. Cost-effective and fast.", date: "2026-04-09", verified_contact: true },
      { id: "r22b", reviewerName: "Karen L.", rating: 4, comment: "Good business solicitor. Understood our needs quickly.", date: "2026-02-28", verified_contact: true },
    ],
  },

  /* ── 23 — Wentworth Legal ── */
  {
    id: "23", firmName: "Wentworth Legal", solicitorName: "Susan Wentworth", title: "Partner",
    city: "Newcastle", address: "4 Grey Street, Newcastle City Centre", postcode: "NE1 1EE",
    lat: 54.9783, lng: -1.6178,
    legalAreas: ["Criminal", "Family", "Immigration"],
    jurisdiction: "England and Wales",
    rating: 4.5, reviewCount: 58,
    phone: "0191 123 4567", email: "susan@wentworthlegal.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "334466",
    verified: true,
    description: "Wentworth Legal is a well-regarded Newcastle firm with strength in criminal defence, family, and immigration law. Susan Wentworth is known for her tenacious advocacy and has represented clients at all levels of court in the North East.",
    reviews: [
      { id: "r23a", reviewerName: "Craig B.", rating: 5, comment: "Susan kept me calm and got the charges reduced significantly. Fantastic solicitor.", date: "2026-03-05", verified_contact: true },
    ],
  },

  /* ── 24 — XL Solicitors ── */
  {
    id: "24", firmName: "XL Solicitors", solicitorName: "Ben Cross", title: "Solicitor",
    city: "Nottingham", address: "17 Low Pavement, Nottingham City Centre", postcode: "NG1 1GH",
    lat: 52.9548, lng: -1.1581,
    legalAreas: ["Housing", "Debt", "Consumer Rights"],
    jurisdiction: "England and Wales",
    rating: 4.2, reviewCount: 44,
    phone: "0115 123 4567", email: "ben@xlsolicitors.co.uk", website: "https://www.lawsociety.org.uk", sraNumber: "445577",
    verified: false,
    description: "XL Solicitors is a Nottingham practice assisting local residents with housing disputes, debt matters, and consumer rights issues. Ben Cross provides clear, no-jargon advice and aims to resolve disputes at the earliest opportunity to keep costs down.",
    reviews: [
      { id: "r24a", reviewerName: "Steph N.", rating: 4, comment: "Ben helped with a difficult landlord dispute. Fair fees and good outcome.", date: "2026-01-29", verified_contact: true },
    ],
  },

];

/* ── Helpers ── */
export function getSolicitorById(id: string): Solicitor | undefined {
  return SOLICITORS.find((s) => s.id === id);
}

export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const LEGAL_AREAS: LegalArea[] = [
  "Housing", "Employment", "Debt", "Consumer Rights",
  "Family", "Immigration", "Criminal", "Business", "Other",
];

export const JURISDICTIONS: Jurisdiction[] = [
  "England and Wales", "Scotland", "Northern Ireland",
];
