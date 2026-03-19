const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const tanzaniaLocations = {
  "Arusha": ["Arusha City", "Arusha Rural", "Karatu", "Longido", "Meru", "Monduli", "Ngorongoro"],
  "Dar es Salaam": ["Ilala", "Kinondoni", "Kigamboni", "Temeke", "Ubungo"],
  "Dodoma": ["Bahi", "Chamwino", "Chemba", "Dodoma Urban", "Kondoa", "Kongwa", "Mpwapwa"],
  "Geita": ["Bukombe", "Chato", "Geita", "Mbogwe", "Nyang'hwale"],
  "Iringa": ["Iringa Urban", "Iringa Rural", "Kilolo", "Mufindi"],
  "Kagera": ["Biharamulo", "Bukoba Urban", "Bukoba Rural", "Karagwe", "Kyerwa", "Missenyi", "Muleba", "Ngara"],
  "Katavi": ["Mlele", "Mpanda", "Mpanda Urban"],
  "Kigoma": ["Buhigwe", "Kakonko", "Kasulu", "Kasulu Urban", "Kigoma Urban", "Kigoma Rural", "Uvinza"],
  "Kilimanjaro": ["Hai", "Moshi Urban", "Moshi Rural", "Mwanga", "Rombo", "Same", "Siha"],
  "Lindi": ["Kilwa", "Lindi Urban", "Lindi Rural", "Liwale", "Nachingwea", "Ruangwa"],
  "Manyara": ["Babati Urban", "Babati Rural", "Hanang", "Kiteto", "Mbulu", "Simanjiro"],
  "Mara": ["Bunda", "Butiama", "Musoma Urban", "Musoma Rural", "Rorya", "Serengeti", "Tarime"],
  "Mbeya": ["Busokelo", "Chunya", "Kyela", "Mbarali", "Mbeya Urban", "Mbeya Rural", "Rungwe"],
  "Mjini Magharibi": ["Magharibi 'A'", "Magharibi 'B'", "Mjini", "Zanzibar"],
  "Morogoro": ["Gairo", "Kilombero", "Kilosa", "Morogoro Urban", "Morogoro Rural", "Mvomero", "Ulanga"],
  "Mtwara": ["Masasi", "Mtwara Urban", "Mtwara Rural", "Nanyumbu", "Newala", "Tandahimba"],
  "Mwanza": ["Ilemela", "Kwimba", "Magu", "Misungwi", "Nyamagana", "Sengerema", "Ukerewe"],
  "Njombe": ["Ludewa", "Makambako", "Makete", "Njombe Urban", "Njombe Rural", "Wanging'ombe"],
  "Pemba North": ["Micheweni", "Wete"],
  "Pemba South": ["Chake Chake", "Mkoani"],
  "Pwani": ["Bagamoyo", "Kibaha", "Kibaha Urban", "Kisarawe", "Mafia", "Mkuranga", "Rufiji"],
  "Rukwa": ["Kalambo", "Nkasi", "Sumbawanga Urban", "Sumbawanga Rural"],
  "Ruvuma": ["Mbinga", "Namtumbo", "Nyasa", "Songea Urban", "Songea Rural", "Tunduru"],
  "Shinyanga": ["Kahama Urban", "Kahama Rural", "Kishapu", "Shinyanga Urban", "Shinyanga Rural"],
  "Simiyu": ["Bariadi", "Busega", "Itilima", "Maswa", "Meatu"],
  "Singida": ["Ikungi", "Iramba", "Manyoni", "Mkalama", "Singida Urban", "Singida Rural"],
  "Songwe": ["Ileje", "Mbozi", "Momba", "Songwe"],
  "Tabora": ["Igunga", "Kaliua", "Nzega", "Sikonge", "Tabora Urban", "Urambo", "Uyui"],
  "Tanga": ["Handeni", "Handeni Urban", "Kilindi", "Korogwe", "Korogwe Urban", "Lushoto", "Mkinga", "Muheza", "Pangani", "Tanga"],
  "Unguja North": ["Kaskazini 'A'", "Kaskazini 'B'"],
  "Unguja South": ["Kati", "Kusini"]
};

const seedLocations = async () => {
  console.log('Starting to seed locations...');

  for (const regionName of Object.keys(tanzaniaLocations)) {
    try {
      // Add the region
      const regionRef = await db.collection('regions').add({ name: regionName });
      console.log(`Added region: ${regionName} (${regionRef.id})`);

      // Add the districts for this region
      const districts = tanzaniaLocations[regionName];
      for (const districtName of districts) {
        await db.collection('districts').add({
          name: districtName,
          regionId: regionRef.id
        });
        console.log(`  - Added district: ${districtName}`);
      }
    } catch (error) {
      console.error(`Error seeding ${regionName}:`, error);
    }
  }

  console.log('Finished seeding locations.');
};

seedLocations().then(() => console.log('Seeding complete'));
