const PROJECT_ID = 'happy-fd1bc';

async function checkPaths() {
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=5`);
  const data = await res.json();

  if (data.documents) {
    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      console.log(`\nID: ${docId}`);
      console.log(`image:`, doc.fields?.image?.stringValue);
      console.log(`imageObjectPath:`, doc.fields?.imageObjectPath?.stringValue);
    }
  }
}

checkPaths();
