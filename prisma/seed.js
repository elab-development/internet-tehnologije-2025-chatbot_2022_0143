const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

function getSeedPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL nije definisan (seed).");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = getSeedPrisma();

/** mini slugify (bez dodatnih paketa) */
function slugify(city, country) {
  const s = `${city}-${country}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return s;
}

async function seedRoles() {
  const roles = ["GOST", "REGISTROVANI_KORISNIK", "ADMIN"];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedDestinations() {
  const destinations = [
    { nameCity: "Pariz", country: "Francuska", description: "Grad svetlosti, Ajfelov toranj.", rating: 5 },
    { nameCity: "Barselona", country: "Španija", description: "Gaudijeva arhitektura, nezaboravan noćni život.", rating: 5 },
    { nameCity: "Rim", country: "Italija", description: "Istorijski grad sa Koloseumom, Vatikanom i bogatom gastronomijom. Idealan za ljubitelje kulture.", rating: 5 },
    { nameCity: "Prag", country: "Češka", description: "Jedan od najlepših gradova srednje Evrope, poznat po starom gradu, mostovima i pristupačnim cenama.", rating: 4 },
    { nameCity: "Amsterdam", country: "Holandija", description: "Grad kanala, muzeja i opuštene atmosfere. Idealan za kraći city break.", rating: 4 },
    { nameCity: "Lisabon", country: "Portugal", description: "Sunčan grad na obali Atlantika, poznat po vidikovcima, tramvajima i autentičnom šarmu.", rating: 4 },
    { nameCity: "Sofija", country: "Bugarska", description: "Pristupačan grad sa bogatom istorijom, planinama u blizini i niskim cenama smeštaja i hrane.", rating: 3 },
    { nameCity: "Bukurešt", country: "Rumunija", description: "Grad kontrasta, zanimljive arhitekture i povoljnog noćnog života, ali ne uvek najbolje uređen.", rating: 3 },
    { nameCity: "Skoplje", country: "Severna Makedonija", description: "Mali grad sa zanimljivim centrom i istorijskim spomenicima, ali ograničenim turističkim sadržajem.", rating: 2 },
    { nameCity: "Stokholm", country: "Švedska", description: "Moderan i čist grad na vodi, sa odličnim muzejima i visokim standardom života.", rating: 4 },
    { nameCity: "Helsinki", country: "Finska", description: "Mirna atmosfera, lep dizajn i priroda, ali skuplja destinacija.", rating: 3 },
    { nameCity: "Oslo", country: "Norveška", description: "Mirna atmosfera, lep dizajn i priroda, ali vrlo visoke cene.", rating: 3 },

    { nameCity: "Beč", country: "Austrija", description: "Grad muzike i kulture, poznat po dvorcima, operi i bogatoj istoriji.", rating: 5 },
    { nameCity: "Budimpešta", country: "Mađarska", description: "Grad na Dunavu, poznat po termalnim kupatilima, mostovima i živahnom noćnom životu.", rating: 4 },
    { nameCity: "Berlin", country: "Nemačka", description: "Moderan grad sa bogatom istorijom, umetničkom scenom i raznovrsnim kulturnim sadržajem.", rating: 4 },
    { nameCity: "Milano", country: "Italija", description: "Svetska prestonica mode, poznata po katedrali Duomo i vrhunskoj kupovini.", rating: 4 },
    { nameCity: "Atina", country: "Grčka", description: "Kolevka zapadne civilizacije, sa Akropoljem i bogatom antičkom istorijom.", rating: 4 },
    { nameCity: "Kopenhagen", country: "Danska", description: "Moderan i ekološki grad, poznat po biciklima, dizajnu i opuštenom načinu života.", rating: 4 },
  ];

  for (const d of destinations) {
    const slug = slugify(d.nameCity, d.country);

    await prisma.destination.upsert({
      where: {
        nameCity_country: { nameCity: d.nameCity, country: d.country }, // zbog @@unique([nameCity, country])
      },
      update: {
        description: d.description,
        rating: d.rating,
        slug, 
      },
      create: {
        ...d,
        slug,
      },
    });
  }
}

async function seedFAQ() {
  const qa = [
    {
      q: "Koje su povoljne destinacije za putovanje u Evropi?",
      a: "Ako putuješ sa manjim budžetom, dobre opcije su Bugarska, Rumunija, Mađarska, Portugal i južna Italija. Ove destinacije nude dobar odnos cene i kvaliteta.",
    },
    {
      q: "Koje destinacije u Evropi su zanimljive za putovanje zimi?",
      a: "Za zimska putovanja popularne su severne zemlje poput Norveške, Švedske i Finske, ali i gradovi kao što su Prag, Beč i Budimpešta tokom božićnih praznika.",
    },
    {
      q: "Koji evropski grad je dobar izbor za vikend putovanje?",
      a: "Za vikend putovanja odlični izbori su Rim, Barselona, Beč, Prag i Budimpešta. Ovi gradovi nude bogatu kulturu, dobru hranu i lako se obilaze za kratko vreme.",
    },
    {
      q: "Šta je najvažnije poneti na putovanje u Evropi?",
      a: "Preporučuje se da poneseš lična dokumenta, punjače, udobnu obuću, osnovne lekove i prilagođenu garderobu u zavisnosti od destinacije i godišnjeg doba.",
    },
    {
      q: "Koja je dobra destinacija za prvo putovanje u Evropu?",
      a: "Za prvo putovanje u Evropu često se preporučuju gradovi poput Beča, Praga, Pariza i Rima jer su turistički prilagođeni i bogati znamenitostima.",
    },

    {
      q: "Koje su najbolje destinacije u Evropi za letovanje?",
      a: "Za letovanje u Evropi popularne su destinacije poput Grčke, Španije, Italije, Portugala i Hrvatske zbog lepih plaža, tople klime i bogate turističke ponude.",
    },
    {
      q: "Koje evropske zemlje su najjeftinije za putovanje?",
      a: "Među najjeftinijim zemljama za putovanje u Evropi izdvajaju se Bugarska, Rumunija, Severna Makedonija, Albanija i Poljska.",
    },
    {
      q: "Koje su romantične destinacije u Evropi za parove?",
      a: "Romantične destinacije u Evropi uključuju Pariz, Veneciju, Santorini, Prag i Rim, koji su poznati po posebnoj atmosferi i prelepim pejzažima.",
    },
    {
      q: "Gde u Evropi putovati sa decom?",
      a: "Za porodična putovanja preporučuju se destinacije poput Pariza (Disneyland), Barselone, Rima i Beča jer nude atrakcije prilagođene deci.",
    },
    {
      q: "Koji su najlepši evropski gradovi koje treba posetiti makar jednom?",
      a: "Među najlepšim evropskim gradovima često se navode Pariz, Rim, Barselona, Prag i Amsterdam zbog svoje arhitekture i kulture.",
    },
    {
      q: "Koje destinacije u Evropi su idealne za solo putovanje?",
      a: "Za solo putnike dobre opcije su Amsterdam, Berlin, Lisabon i Kopenhagen jer su bezbedni, dobro povezani i puni aktivnosti.",
    },
    {
      q: "Gde u Evropi može da se putuje bez velike gužve turista?",
      a: "Manje gužve mogu se pronaći u zemljama poput Slovenije, Slovačke, Letonije i Estonije, kao i u manjim gradovima van glavne sezone.",
    },
    {
      q: "Koje evropske destinacije su poznate po dobroj hrani?",
      a: "Italija, Francuska, Španija i Portugal poznati su po bogatoj gastronomskoj ponudi i autentičnim lokalnim specijalitetima.",
    },
    {
      q: "Koje zemlje u Evropi su najbezbednije za turiste?",
      a: "Među najbezbednijim zemljama za turiste u Evropi često se navode Švajcarska, Norveška, Island, Austrija i Slovenija.",
    },
    {
      q: "Koje su najbolje destinacije u Evropi za ljubitelje prirode i planinarenja?",
      a: "Za ljubitelje prirode preporučuju se Alpi u Švajcarskoj i Austriji, Dolomiti u Italiji, kao i nacionalni parkovi u Sloveniji i Norveškoj.",
    },
  ];

  for (const item of qa) {
    const question = await prisma.question.upsert({
      where: { text: item.q },
      update: {
        category: "PUTOVANJA",
      },
      create: {
        text: item.q,
        category: "PUTOVANJA",
      },
    });

    await prisma.answer.upsert({
      where: { questionId: question.id },
      update: { text: item.a },
      create: {
        text: item.a,
        questionId: question.id,
      },
    });
  }
}

async function seedUsers() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const regRole = await prisma.role.upsert({
    where: { name: "REGISTROVANI_KORISNIK" },
    update: {},
    create: { name: "REGISTROVANI_KORISNIK" },
  });

  const adminEmail = "admin@gmail.com";
  const adminPass = "iteh";

  const anaEmail = "ana@gmail.com";
  const anaPass = "ana";

  const adminHash = await bcrypt.hash(adminPass, 10);
  const anaHash = await bcrypt.hash(anaPass, 10);

  // Admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin",
      roleId: adminRole.id,
      password: adminHash,
    },
    create: {
      email: adminEmail,
      password: adminHash,
      name: "Admin",
      roleId: adminRole.id,
    },
  });

  // Ana (registrovani)
  await prisma.user.upsert({
    where: { email: anaEmail },
    update: {
      name: "Ana",
      roleId: regRole.id,
      password: anaHash,
    },
    create: {
      email: anaEmail,
      password: anaHash,
      name: "Ana",
      roleId: regRole.id,
    },
  });

  console.log("✅ Seed useri kreirani/azurirani:");
  console.log(`   ADMIN: ${adminEmail} / ${adminPass}`);
  console.log(`   USER : ${anaEmail} / ${anaPass}`);
}

async function main() {
  await seedRoles();
  await seedDestinations();
  await seedFAQ();
  await seedUsers();
  console.log("✅ Seed završen.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Seed error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
