const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/UserRoutes');
const condominioRoutes = require('./routes/CondominioRoutes');
const UsuarioCondominioRoutes = require('./routes/UsuarioCondominioRoutes');
const AvisoRoutes = require('./routes/AvisoRoutes');
const ReservaRoutes = require('./routes/ReservaRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/condominios', condominioRoutes);
app.use('/api/usuariocondominio', UsuarioCondominioRoutes);
app.use('/api/avisos', AvisoRoutes);
app.use('/api/reservas', ReservaRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));