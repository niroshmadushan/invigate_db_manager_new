async function run() {
  const url = "https://api.invgatesla.com/pending_req_view/get_requests.php";
  const auth = Buffer.from("sla:qeJWMcn2k0WOKdD5ZOHmDJR2").toString("base64");
  
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
    console.log(JSON.stringify(data).substring(0, 500) + "...");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
