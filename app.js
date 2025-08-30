const express = require('express');
const app = express();
const merenjeRoutes = require('./routes/merenjeRoutes');

app.use(express.json());
app.use('/api', merenjeRoutes);

//const PORT = process.env.PORT || 5001;
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});