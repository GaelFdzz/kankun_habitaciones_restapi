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
 */
app.get('/habitaciones', async (req, res) => {
    const { data, error } = await supabase.from('habitaciones').select('*');
    if (error) return res.status(500).json({ error: error.message });
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
 */
app.get('/habitaciones/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('habitaciones').select('*').eq('habitacion_id', id).single();
    if (error) return res.status(404).json({ error: "Habitación no encontrada" });
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
 */
app.post('/habitaciones', async (req, res) => {
    const { num_habi, tipo, capacidad, precio, estado } = req.body;
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
 *   put:
 *     summary: Actualiza una habitación
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habitación a actualizar
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
 */
app.put('/habitaciones/:id', async (req, res) => {
    const { id } = req.params;
    const { num_habi, tipo, capacidad, precio, estado } = req.body;

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
 *         description: ID de la habitación a eliminar
 *     responses:
 *       204:
 *         description: Habitación eliminada exitosamente
 */
app.delete('/habitaciones/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('habitaciones').delete().eq('habitacion_id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send(); // No Content
});


app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});