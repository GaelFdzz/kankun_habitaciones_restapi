require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Habitaciones",
            version: "1.0.0",
            description: "Documentación de la API para la gestión de habitaciones en el sistema de reservas",
        },
        servers: [
            { url: "http://localhost:3000", description: "Servidor Local" }
        ],
    },
    apis: ["./habitaciones.js"],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /habitaciones:
 *   get:
 *     summary: Obtiene todas las habitaciones
 *     tags: [Habitaciones]
 *     responses:
 *       200:
 *         description: Lista de habitaciones obtenida exitosamente
 *       500:
 *         description: Error al obtener las habitaciones
 *       404:
 *         description: No hay habitaciones registradas
 */
app.get('/habitaciones', async (req, res) => {
    const { data, error } = await supabase.from('habitaciones').select('*');

    if (error) return res.status(500).json({ error: error.message });

    if (!data || data.length === 0) {
        return res.status(404).json({ error: "No hay habitaciones registradas" });
    }

    res.json(data);
});

/**
 * @swagger
 * /habitaciones/{id}:
 *   get:
 *     summary: Obtiene una habitación por ID
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habitación a obtener
 *     responses:
 *       200:
 *         description: Habitación encontrada
 *       404:
 *         description: Habitación no encontrada
 *       400:
 *         description: ID inválido
 */
app.get('/habitaciones/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido. Debe ser un número entero positivo." });
    }

    const { data, error } = await supabase.from('habitaciones').select('*').eq('habitacion_id', id).single();

    if (error || !data) {
        return res.status(404).json({ error: "Habitación no encontrada" });
    }

    res.json(data);
});

/**
 * @swagger
 * /habitaciones:
 *   post:
 *     summary: Crea una nueva habitación
 *     tags: [Habitaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               num_habi:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               precio:
 *                 type: integer
 *               estado:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Habitación creada exitosamente
 *       400:
 *         description: Datos de la habitación inválidos
 *       409:
 *         description: El número de habitación ya existe
 */
app.post('/habitaciones', async (req, res) => {
    const { num_habi, tipo, capacidad, precio, estado } = req.body;

    if (!num_habi || !tipo || !capacidad || !precio || estado === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const { data: existeHabitacion } = await supabase
        .from('habitaciones')
        .select('*')
        .eq('num_habi', num_habi)
        .single();

    if (existeHabitacion) {
        return res.status(409).json({ error: "El número de habitación ya existe." });
    }

    const { data, error } = await supabase
        .from('habitaciones')
        .insert([{ num_habi, tipo, capacidad, precio, estado }])
        .select('*')
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data);
});

/**
 * @swagger
 * /habitaciones/{id}:
 *   patch:
 *     summary: Actualiza una habitación
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               num_habi:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               precio:
 *                 type: integer
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Habitación actualizada exitosamente
 *       400:
 *         description: Datos inválidos o ID inválido
 *       404:
 *         description: Habitación no encontrada
 */
app.patch('/habitaciones/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { num_habi, tipo, capacidad, precio, estado } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido. Debe ser un número entero positivo." });
    }

    if (isNaN(num_habi) || num_habi <= 0) {
        return res.status(400).json({ error: "Numero de habitacion invalida! Debe ser un número entero positivo." });
    }

    // Validación de tipo
    if (tipo && typeof tipo !== 'string') {
        return res.status(400).json({ error: "El tipo debe ser una cadena de texto." });
    }

    // Validación de capacidad
    if (capacidad && (isNaN(capacidad) || capacidad <= 0)) {
        return res.status(400).json({ error: "Capacidad inválida. Debe ser un número entero positivo." });
    }

    // Validación de precio
    if (precio && (isNaN(precio) || precio <= 0)) {
        return res.status(400).json({ error: "Precio inválido. Debe ser un número entero positivo." });
    }

    // Validación de estado
    if (estado !== undefined && typeof estado !== 'boolean') {
        return res.status(400).json({ error: "El estado debe ser un valor booleano (true o false)." });
    }

    const { data: habitacionExistente } = await supabase.from('habitaciones').select('*').eq('habitacion_id', id).single();

    if (!habitacionExistente) {
        return res.status(404).json({ error: "Habitación no encontrada" });
    }

    const { data, error } = await supabase
        .from('habitaciones')
        .update({ num_habi, tipo, capacidad, precio, estado })
        .eq('habitacion_id', id)
        .select('*')
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
});

/**
 * @swagger
 * /habitaciones/{id}:
 *   delete:
 *     summary: Elimina una habitación
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Habitación eliminada exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Habitación no encontrada
 */
app.delete('/habitaciones/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido. Debe ser un número entero positivo." });
    }

    const { data: habitacionExistente } = await supabase.from('habitaciones').select('*').eq('habitacion_id', id).single();

    if (!habitacionExistente) {
        return res.status(404).json({ error: "Habitación no encontrada" });
    }

    const { error } = await supabase.from('habitaciones').delete().eq('habitacion_id', id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
