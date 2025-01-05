const express = require("express");
const UAParser = require("ua-parser-js");
const requestIp = require("request-ip");

const app = express();

app.get("/", async (req, res) => {
  try {
    // الحصول على IP العميل
    const clientIp = requestIp.getClientIp(req);

    // تحليل User-Agent
    const ua = new UAParser(req.headers["user-agent"]);
    const userAgent = ua.getResult();

    // الحصول على معلومات الموقع الجغرافي باستخدام ipapi.co
    let geoData = null;
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}`);
      geoData = await geoResponse.json();
    } catch (error) {
      console.error("Error fetching geo data:", error);
    }

    const visitorInfo = {
      ip: clientIp,
      datetime: new Date().toISOString(),

      // معلومات المتصفح والنظام
      browser: {
        name: userAgent.browser.name,
        version: userAgent.browser.version,
      },
      operatingSystem: {
        name: userAgent.os.name,
        version: userAgent.os.version,
      },
      device: {
        type: userAgent.device.type || "desktop",
        model: userAgent.device.model,
        vendor: userAgent.device.vendor,
      },

      // معلومات جغرافية
      location: geoData
        ? {
            country: geoData.country,
            region: geoData.regionName,
            city: geoData.city,
            timezone: geoData.timezone,
            isp: geoData.isp,
          }
        : null,

      // معلومات إضافية من الطلب
      headers: {
        language: req.headers["accept-language"],
        referer: req.headers["referer"],
        host: req.headers["host"],
      },
    };

    res.json(visitorInfo);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
