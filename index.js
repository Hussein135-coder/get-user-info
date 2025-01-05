const express = require("express");
const requestIp = require("request-ip");
const useragent = require("useragent");
const geoip = require("geoip-lite");

const app = express();
const port = 3000;

// Middleware للحصول على عنوان IP
app.use(requestIp.mw());

// Route للصفحة الرئيسية
app.get("/", (req, res) => {
  // الحصول على عنوان IP
  const ip = req.clientIp;

  // تحليل معلومات المتصفح
  const agent = useragent.parse(req.headers["user-agent"]);

  // الحصول على معلومات الموقع الجغرافي
  const geo = geoip.lookup(ip);

  // تسجيل المعلومات
  const logEntry = {
    ip: ip,
    country: geo ? geo.country : "غير معروف",
    city: geo ? geo.city : "غير معروف",
    browser: agent.toAgent(), // اسم المتصفح
    os: agent.os.toString(), // نظام التشغيل
    device: agent.device.toString(), // نوع الجهاز
    timestamp: new Date().toISOString(), // الوقت الحالي
  };

  // عرض المعلومات في المتصفح
  res.send(`<pre>${JSON.stringify(logEntry, null, 2)}</pre>`);

  // طباعة المعلومات في سجل الخادم
  console.log("تم تسجيل الطلب:", logEntry);
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`الخادم يعمل على http://localhost:${port}`);
});
