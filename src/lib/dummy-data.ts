export type UserRole =
  | "super_admin"
  | "dressage_judge"
  | "showjumping_judge"
  | "dressage_writer"
  | "showjumping_writer"
  | "examiner"
  | "rider"
  | "show_secretary";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Rider = {
  id: string;
  name: string;
  nf: string;
  competitorNo: string;
  horse: string;
  horseNo: string;
  userId?: string;
};

export type EventClass = {
  id: string;
  name: string;
  testId: string;
  type: "dressage" | "showjumping";
  judgeId?: string;
  writerId?: string;
  startTime: string;
};

export type ShowEvent = {
  id: string;
  name: string;
  date: string;
  location: string;
  classes: EventClass[];
  status: "upcoming" | "active" | "completed";
  secretaryId: string;
};

export type ScoringSession = {
  id: string;
  eventId: string;
  classId: string;
  riderId: string;
  testId: string;
  judgeId: string;
  writerId?: string;
  scores: Record<string, string>;
  corrections: Record<string, string>;
  collectiveScores: Record<string, string>;
  percentage: number;
  status: "draft" | "submitted" | "verified";
  createdAt: string;
  verifiedBy?: string;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  dressage_judge: "Dressage Judge",
  showjumping_judge: "Showjumping Judge",
  dressage_writer: "Dressage Writer",
  showjumping_writer: "Showjumping Writer",
  examiner: "Examiner",
  rider: "Rider",
  show_secretary: "Show Secretary",
};

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  super_admin: "/dashboard/admin",
  dressage_judge: "/dashboard/judge/dressage",
  showjumping_judge: "/dashboard/judge/showjumping",
  dressage_writer: "/dashboard/writer/dressage",
  showjumping_writer: "/dashboard/writer/showjumping",
  examiner: "/dashboard/examiner",
  rider: "/dashboard/rider",
  show_secretary: "/dashboard/secretary",
};

export const TEST_NAMES: Record<string, string> = {
  "young-rider": "Young Rider",
  "junior": "Junior",
  "children-i":         "Children I",
  "children-i-quality": "Children I – Quality",
  "children-ii":         "Children II",
  "children-ii-quality": "Children II – Quality",
  "pre-novice": "Pre Novice",
  "preliminary": "Preliminary",
  "introductory": "Introductory",
  "novice": "Novice",
  "lead-rein":          "Lead Rein",
  "follow-the-leader":  "Follow the Leader",
  "novice-quality":     "Novice – Quality",
  "intermediate-i":             "Intermediate I",
  "intermediate-i-freestyle":   "Intermediate I Freestyle",
  "prix-st-georges":            "Prix St. Georges",
  "prix-st-georges-freestyle":  "Prix St. Georges Freestyle",
  "advanced-senior-ii":         "Advanced / Senior II",
  "advanced-senior-ii-freestyle": "Advanced / Senior II Freestyle",
  "advanced-medium":            "Advanced Medium",
  "advanced-medium-freestyle":  "Advanced Medium Freestyle",
  "medium-senior-i":            "Medium / Senior I",
  "medium-senior-i-freestyle":  "Medium / Senior I Freestyle",
  "elementary":                 "Elementary",
  "elementary-freestyle":       "Elementary Freestyle",
  "preliminary-g":              "Preliminary (App. G)",
  "preliminary-g-quality":      "Preliminary – Quality",
  "young-riders":               "Young Riders",
  "young-riders-quality":       "Young Riders – Quality",
  "young-rider-freestyle":      "Young Rider Freestyle",
  "junior-riders":              "Junior Riders",
  "junior-riders-quality":      "Junior Riders – Quality",
  "junior-rider-freestyle":     "Junior Rider Freestyle",
  "children-i-new":             "Children I (New)",
  "children-i-new-quality":     "Children I (New) – Quality",
  "children-ii-new":            "Children II (New)",
  "children-ii-new-quality":    "Children II (New) – Quality",
  "jnec-eventing":              "JNEC Eventing",
  "prix-st-georges-fei":        "Prix St. Georges (FEI)",
  "wdc-advanced":               "FEI WDC Advanced",
  "epl-junior-riders":          "EPL Junior Riders",
  "epl-children-i":             "EPL Children I",
  "epl-children-ii":            "EPL Children II",
  "jumping-phase":              "Jumping Phase (Eventing)",
};

export const DUMMY_USERS: User[] = [
  { id: "u1", name: "Alex Morgan",     email: "admin@horsey.app",          role: "super_admin" },
  { id: "u2", name: "Dr. Sarah Chen",  email: "judge.dressage@horsey.app", role: "dressage_judge" },
  { id: "u3", name: "Mark Johnson",    email: "judge.sj@horsey.app",       role: "showjumping_judge" },
  { id: "u4", name: "Priya Sharma",    email: "writer.dressage@horsey.app",role: "dressage_writer" },
  { id: "u5", name: "Tom Wilson",      email: "writer.sj@horsey.app",      role: "showjumping_writer" },
  { id: "u6", name: "Emma Davis",      email: "examiner@horsey.app",       role: "examiner" },
  { id: "u7", name: "Sophia Patel",    email: "rider@horsey.app",          role: "rider" },
  { id: "u8", name: "James O'Brien",   email: "secretary@horsey.app",      role: "show_secretary" },
];

export const DUMMY_RIDERS: Rider[] = [
  { id: "r1", name: "Sophia Patel",    nf: "IND", competitorNo: "101", horse: "Black Beauty",  horseNo: "H01", userId: "u7" },
  { id: "r2", name: "Aisha Khan",      nf: "IND", competitorNo: "102", horse: "Thunder",       horseNo: "H02" },
  { id: "r3", name: "Lucas Müller",    nf: "GER", competitorNo: "103", horse: "Starlight",     horseNo: "H03" },
  { id: "r4", name: "Isabella Torres", nf: "ESP", competitorNo: "104", horse: "Apollo",        horseNo: "H04" },
  { id: "r5", name: "Ravi Nair",       nf: "IND", competitorNo: "105", horse: "Midnight",      horseNo: "H05" },
  { id: "r6", name: "Clara Dubois",    nf: "FRA", competitorNo: "106", horse: "Étoile",        horseNo: "H06" },
  { id: "r7", name: "Omar Khalil",     nf: "UAE", competitorNo: "107", horse: "Desert Wind",   horseNo: "H07" },
  { id: "r8", name: "Mei Lin",         nf: "CHN", competitorNo: "108", horse: "Golden River",  horseNo: "H08" },
];

export const DUMMY_EVENTS: ShowEvent[] = [
  {
    id: "e1",
    name: "KSEC Spring Classic 2025",
    date: "2025-06-15",
    location: "KSEC Main Arena, Bangalore",
    status: "active",
    secretaryId: "u8",
    classes: [
      { id: "c1",  name: "Young Rider Dressage",     testId: "young-rider",  type: "dressage", judgeId: "u2", writerId: "u4", startTime: "09:00" },
      { id: "c2",  name: "Junior Dressage",          testId: "junior",       type: "dressage", judgeId: "u2", writerId: "u4", startTime: "10:30" },
      { id: "c3",  name: "Pre Novice Dressage",      testId: "pre-novice",   type: "dressage", judgeId: "u2", writerId: "u4", startTime: "13:00" },
      { id: "c4",  name: "Lead Rein Dressage",       testId: "lead-rein",    type: "dressage", judgeId: "u2", writerId: "u4", startTime: "15:00" },
      { id: "c10", name: "Children I Dressage",      testId: "children-i",   type: "dressage", judgeId: "u2", writerId: "u4", startTime: "11:30" },
      { id: "c11", name: "Children II Dressage",     testId: "children-ii",  type: "dressage", judgeId: "u2", writerId: "u4", startTime: "14:30" },
      { id: "c12", name: "Follow the Leader",        testId: "follow-the-leader", type: "dressage", judgeId: "u2", writerId: "u4", startTime: "16:00" },
      { id: "c13", name: "Novice Jumping Phase",     testId: "jumping-phase", type: "showjumping", judgeId: "u3", writerId: "u5", startTime: "12:00" },
    ],
  },
  {
    id: "e2",
    name: "KSEC Summer Series 2025",
    date: "2025-08-20",
    location: "KSEC Cross Country Course",
    status: "upcoming",
    secretaryId: "u8",
    classes: [
      { id: "c5", name: "Novice Dressage",       testId: "novice",       type: "dressage", startTime: "08:00" },
      { id: "c6", name: "Introductory Dressage", testId: "introductory", type: "dressage", startTime: "11:00" },
      { id: "c7", name: "Preliminary Dressage",  testId: "preliminary",  type: "dressage", startTime: "14:00" },
    ],
  },
  {
    id: "e3",
    name: "KSEC Winter Invitational 2024",
    date: "2024-12-10",
    location: "KSEC Indoor Arena",
    status: "completed",
    secretaryId: "u8",
    classes: [
      { id: "c8",  name: "Children I Dressage",  testId: "children-i",  type: "dressage", judgeId: "u2", writerId: "u4", startTime: "09:00" },
      { id: "c9",  name: "Children II Dressage", testId: "children-ii", type: "dressage", judgeId: "u2", writerId: "u4", startTime: "11:00" },
    ],
  },
];

export const DUMMY_ENTRIES: Record<string, string[]> = {
  c1: ["r1", "r3", "r5"],
  c2: ["r2", "r4"],
  c3: ["r1", "r2", "r3", "r6"],
  c4: ["r7", "r8"],
  c5: ["r3", "r4", "r5"],
  c6: ["r1", "r6"],
  c7: ["r2", "r7"],
  c8: ["r1", "r2", "r3", "r4", "r5"],
  c9: ["r2", "r4", "r6", "r8"],
  c13: ["r1", "r2", "r3", "r4", "r5", "r6"],
};

export type TestCard = {
  slug: string;
  category: string;
  appendix: string;
  description: string;
  maxScore: number;
  kind?: "dressage" | "showjumping";
};

export const TEST_CARDS: TestCard[] = [
  { slug: "young-rider",  category: "Young Rider",  appendix: "Appendix A", description: "Time 6′30″ · Min age of horse: 6 years", maxScore: 280 },
  { slug: "junior",       category: "Junior",       appendix: "Appendix C", description: "Time 3′55″ · Min age of horse: 6 years", maxScore: 220 },
  { slug: "children-i",         category: "Children I",          appendix: "Appendix D", description: "Time 5 min · Min age horse: 8 yrs (ch) / 5 (adults)", maxScore: 280 },
  { slug: "children-i-quality", category: "Children I – Quality", appendix: "Appendix D", description: "Quality Marking Sheet · Combined with Technical score", maxScore: 40 },
  { slug: "children-ii",         category: "Children II",          appendix: "Appendix E", description: "Time 4 min · Min age horse: 6 yrs (ch) / 5 (adults)", maxScore: 210 },
  { slug: "children-ii-quality", category: "Children II – Quality", appendix: "Appendix E", description: "Quality Marking Sheet · Combined with Technical score", maxScore: 40 },
  { slug: "pre-novice",   category: "Pre Novice",   appendix: "Appendix G", description: "Time 4 min · Min age of horse: 4 years", maxScore: 150 },
  { slug: "preliminary",  category: "Preliminary",  appendix: "Appendix H", description: "Preliminary Dressage Test · EFI", maxScore: 160 },
  { slug: "novice",         category: "Novice",          appendix: "KSEC Show", description: "Time 3′55″ · Min age of horse: 6 years", maxScore: 250 },
  { slug: "novice-quality", category: "Novice – Quality", appendix: "KSEC Show", description: "Quality Marking Sheet · Combined with Technical score · −0.5% per technical fault", maxScore: 40 },
  { slug: "introductory", category: "Introductory", appendix: "KSEC Show",  description: "Time 3:30 · Arena 20×60 · Snaffle bridle", maxScore: 190 },
  { slug: "lead-rein",        category: "Lead Rein",         appendix: "KSEC Show",  description: "Lead Rein Dressage Test", maxScore: 130 },
  { slug: "follow-the-leader", category: "Follow the Leader", appendix: "KSEC Show",  description: "Follow the Leader Dressage · KSEC Show", maxScore: 190 },
  { slug: "intermediate-i",           category: "Intermediate I",           appendix: "Appendix 'A'", description: "Time 5′30″ · Min age of horse: 7 years", maxScore: 340 },
  { slug: "intermediate-i-freestyle", category: "Intermediate I Freestyle", appendix: "Appendix 'A'", description: "Performance: 4′30″–5′00″ · Technical + Artistic marks", maxScore: 400 },
  { slug: "prix-st-georges",           category: "Prix St. Georges",          appendix: "Appendix 'B'", description: "Time 5′50″ · Min age of horse: 7 years", maxScore: 340 },
  { slug: "prix-st-georges-freestyle", category: "Prix St. Georges Freestyle", appendix: "Appendix 'B'", description: "Performance: 4′30″–5′00″ · Technical + Artistic marks", maxScore: 400 },
  { slug: "advanced-senior-ii",           category: "Advanced / Senior II",           appendix: "Appendix 'C'", description: "Time 5.40 min · Min age of horse: 6 years", maxScore: 330 },
  { slug: "advanced-senior-ii-freestyle", category: "Advanced / Senior II Freestyle", appendix: "Appendix 'C'", description: "Time: 4:30–5:00 min · Technical + Artistic marks", maxScore: 400 },
  { slug: "advanced-medium",           category: "Advanced Medium",           appendix: "Appendix 'D'", description: "Time 6.30 min · Min age of horse: 6 years", maxScore: 290 },
  { slug: "advanced-medium-freestyle", category: "Advanced Medium Freestyle", appendix: "Appendix 'D'", description: "Time Allowed: 4:30–5:00 min · Technical + Artistic marks", maxScore: 400 },
  { slug: "medium-senior-i",           category: "Medium / Senior I",           appendix: "Appendix 'E'", description: "Time 6.30 min · Min age of horse: 6 years", maxScore: 290 },
  { slug: "medium-senior-i-freestyle", category: "Medium / Senior I Freestyle", appendix: "Appendix 'E'", description: "Time Allowed: 4:30–5:00 min · Technical + Artistic marks", maxScore: 400 },
  { slug: "elementary",           category: "Elementary",           appendix: "Appendix 'F'", description: "Time 5 min · Min age: 6 yrs (ch) / 5 yrs (adults)", maxScore: 290 },
  { slug: "elementary-freestyle", category: "Elementary Freestyle", appendix: "Appendix 'F'", description: "Time Allowed: 4:00–4:30 min · Technical + Artistic marks", maxScore: 260 },
  { slug: "preliminary-g",         category: "Preliminary (App. G)", appendix: "Appendix 'G'", description: "Time 4 min · Min age: 6 yrs (ch) / 5 yrs (adults)", maxScore: 190 },
  { slug: "preliminary-g-quality", category: "Preliminary – Quality", appendix: "Appendix 'G'", description: "Quality Marking Sheet · Combined with Technical score", maxScore: 40 },
  { slug: "young-riders",         category: "Young Riders",          appendix: "Appendix 'A'", description: "Time: 5.30 min · Min age of horse: 4 years", maxScore: 220 },
  { slug: "young-riders-quality", category: "Young Riders – Quality", appendix: "Appendix 'A'", description: "Quality Marking Sheet · Combined with Technical score", maxScore: 40 },
  { slug: "young-rider-freestyle", category: "Young Rider Freestyle", appendix: "Appendix 'A'", description: "Time: 5.30 min · Technical + Artistic marks", maxScore: 400 },
  { slug: "junior-riders",         category: "Junior Riders",          appendix: "Appendix 'B'", description: "Time: 4.45 min · Min age of horse: 4 years", maxScore: 230 },
  { slug: "junior-riders-quality", category: "Junior Riders – Quality", appendix: "Appendix 'B'", description: "Quality Marking Sheet · Combined with Technical score", maxScore: 40 },
  { slug: "junior-rider-freestyle", category: "Junior Rider Freestyle", appendix: "Appendix 'B'", description: "Time: 4.45 min · Technical + Artistic marks", maxScore: 400 },
  { slug: "children-i-new",         category: "Children I (New)",          appendix: "Appendix 'C'", description: "Time: 5.30 min · Min age of horse: 4 years", maxScore: 170 },
  { slug: "children-i-new-quality", category: "Children I (New) – Quality", appendix: "Appendix 'C'", description: "Quality Marking Sheet · Combined with Technical score", maxScore: 40 },
  { slug: "children-ii-new",         category: "Children II (New)",          appendix: "Appendix 'D'", description: "Time: 4 min · Min age of horse: 4 years", maxScore: 160 },
  { slug: "children-ii-new-quality", category: "Children II (New) – Quality", appendix: "Appendix 'D'", description: "Quality Marking Sheet · Combined with Technical score", maxScore: 40 },
  { slug: "jnec-eventing",       category: "JNEC Eventing",              appendix: "Appendix 'E'",          description: "Time: 4 min 30 sec · Dressage for JNEC Eventing", maxScore: 230 },
  { slug: "prix-st-georges-fei", category: "Prix St. Georges (FEI)",     appendix: "D-PSG09-2009/2022",     description: "Time 5′50″ · Official FEI test · Min age: 7 years", maxScore: 340 },
  { slug: "wdc-advanced",        category: "FEI WDC Advanced",           appendix: "WCHA-D-ADVANCED-2011",  description: "Time: 5.10 min · FEI World Dressage Challenge", maxScore: 370 },
  { slug: "epl-junior-riders",   category: "EPL Junior Riders",          appendix: "Appendix 'F'",          description: "Time: 4.45 min · EPL test · Min age: 4 years", maxScore: 230 },
  { slug: "epl-children-i",      category: "EPL Children I",             appendix: "Appendix 'G'",          description: "Time: 4 min · EPL test · Min age: 4 years", maxScore: 170 },
  { slug: "epl-children-ii",     category: "EPL Children II",            appendix: "Appendix 'H'",          description: "Snaffle bridle · Rising trot optional · Min age: 4 years", maxScore: 160 },
  { slug: "jumping-phase", category: "Jumping Phase", appendix: "Eventing", description: "Pony Club · Jumping Phase Score Sheet · Fault & time based", maxScore: 0, kind: "showjumping" },
];

export const DUMMY_SESSIONS: ScoringSession[] = [
  {
    id: "s1", eventId: "e3", classId: "c8", riderId: "r1", testId: "children-i",
    judgeId: "u2", writerId: "u4",
    scores: { "1": "7", "2": "6.5", "3": "7", "4": "6.5", "5": "14", "6": "7", "7": "7", "8": "6.5", "9": "14", "10": "7", "11": "6.5", "12": "7", "13": "7", "14": "6.5", "15": "14", "16": "7", "17": "7", "18": "6.5", "19": "7", "20": "14", "21": "7", "22": "7" },
    corrections: {}, collectiveScores: { "1": "7" },
    percentage: 66.67, status: "verified", createdAt: "2024-12-10T10:30:00Z", verifiedBy: "u6",
  },
  {
    id: "s2", eventId: "e3", classId: "c8", riderId: "r2", testId: "children-i",
    judgeId: "u2", writerId: "u4",
    scores: { "1": "7.5", "2": "7", "3": "7.5", "4": "7", "5": "15", "6": "7", "7": "7.5", "8": "7", "9": "14", "10": "7", "11": "7", "12": "7.5", "13": "7.5", "14": "7", "15": "14", "16": "7", "17": "7.5", "18": "7", "19": "7.5", "20": "15", "21": "7", "22": "7.5" },
    corrections: {}, collectiveScores: { "1": "7.5" },
    percentage: 70.83, status: "submitted", createdAt: "2024-12-10T11:30:00Z",
  },
  {
    id: "s3", eventId: "e3", classId: "c9", riderId: "r4", testId: "children-ii",
    judgeId: "u2", writerId: "u4",
    scores: { "1": "6.5", "2": "7", "3": "6.5", "4": "7", "5": "6.5", "6": "7", "7": "7", "8": "6.5", "9": "6.5", "10": "7", "11": "6.5", "12": "14", "13": "6.5", "14": "7", "15": "7", "16": "6.5", "17": "6.5", "18": "7" },
    corrections: {}, collectiveScores: { "1": "7" },
    percentage: 67.5, status: "verified", createdAt: "2024-12-10T12:00:00Z", verifiedBy: "u6",
  },
  {
    id: "s4", eventId: "e1", classId: "c1", riderId: "r1", testId: "young-rider",
    judgeId: "u2", writerId: "u4",
    scores: {}, corrections: {}, collectiveScores: {},
    percentage: 0, status: "draft", createdAt: "2025-06-15T08:00:00Z",
  },
  {
    id: "s5", eventId: "e1", classId: "c3", riderId: "r3", testId: "pre-novice",
    judgeId: "u2", writerId: "u4",
    scores: {}, corrections: {}, collectiveScores: {},
    percentage: 0, status: "draft", createdAt: "2025-06-15T13:00:00Z",
  },
];
