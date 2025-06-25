const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/UserRoutes');
const condominioRoutes = require('./routes/CondominioRoutes');
const UsuarioCondominioRoutes = require('./routes/UsuarioCondominioRoutes');
const AvisoRoutes = require('./routes/AvisoRoutes');
const ReservaRoutes = require('./routes/ReservaRoutes');
const AssembleiaRoutes = require('./routes/AssembleiaRoutes');
const GaleriaRoutes = require('./routes/GaleriaRoutes');
const FotoRoutes = require('./routes/FotoRoutes');
const EventoRoutes = require('./routes/EventoRoutes');


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/condominios', condominioRoutes);
app.use('/api/usuariocondominio', UsuarioCondominioRoutes);
app.use('/api/avisos', AvisoRoutes);
app.use('/api/reservas', ReservaRoutes);
app.use('/api/assembleias', AssembleiaRoutes);
app.use('/api/galerias', GaleriaRoutes);
app.use('/api/fotos', FotoRoutes);
app.use('/api/eventos', EventoRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));