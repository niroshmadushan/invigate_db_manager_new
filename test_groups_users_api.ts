import https from "https";

async function run() {
  const url = "https://itsm.srilankan.com/api/v1/groups.users?id=846";
  const auth = Buffer.from("SLA_API:zsuxo5Y5tt0p4bW1ndaoenOh").toString("base64");
  
  const req = https.request(
    url,
    {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "User-Agent": "NodeScript",
        "Accept": "application/json"
      }
    },
    (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(body.substring(0, 500));
      });
    }
  );
  req.end();
}
run();
