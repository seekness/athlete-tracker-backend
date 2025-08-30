const express = require('express');
const app = express();
const merenjeRoutes = require('./routes/merenjeRoutes');
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use('/api', merenjeRoutes);

//const PORT = process.env.PORT || 5001;
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});