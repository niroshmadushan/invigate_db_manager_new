async function run() {
  const url = "https://itsm.srilankan.com/api/v1/groups";
  const auth = Buffer.from("SLA_API:zsuxo5Y5tt0p4bW1ndaoenOh").toString("base64");
  
  try {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });
    
    if (!res.ok) {
      console.error("HTTP error!", res.status);
      process.exit(1);
    }
    
    const data = await res.json();
    console.log(JSON.stringify(data).substring(0, 1000) + "...");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
