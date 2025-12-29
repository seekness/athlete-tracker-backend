const { fetchTrainingsForUser } = require('./models/trainingModel');
const pool = require('./db/pool');

async function test() {
  try {
    console.log("--- Testing for Trener (ID 6) ---");
    const trenerTrainings = await fetchTrainingsForUser('trener', 6);
    console.log(JSON.stringify(trenerTrainings, null, 2));

    console.log("\n--- Testing for Sportista (ID 7) ---");
    const sportistaTrainings = await fetchTrainingsForUser('sportista', 7);
    console.log(JSON.stringify(sportistaTrainings, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

test();
