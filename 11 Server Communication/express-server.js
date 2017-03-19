const express = require('express');
const cors = require('cors');

const app = express();
const data = ["aol.com", "att.net", "comcast.net", "facebook.com", "gmail.com", "gmx.com", "googlemail.com", "google.com", "hotmail.com", "hotmail.co.uk", "mac.com", "me.com", "mail.com", "msn.com", "live.com", "sbcglobal.net", "verizon.net", "yahoo.com", "yahoo.co.uk"];

app.post('/api/search', cors(), (req, res) => {
    res.json(data.filter(x => x.toUpperCase().includes(req.query.query.toUpperCase())));
});
app.use(express.static('static'))
app.listen(4200);