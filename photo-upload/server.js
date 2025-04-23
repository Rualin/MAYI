const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'start_page.html'));
});

app.get('/load_photo_page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'load_photo_page.html'));
});

app.get('/ingredients_page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ingredients_page.html'));
});

app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({ message: 'Photo uploaded successfully!', filePath: req.file.path });
});

app.post('/api/submit', (req, res) => {
    const data = req.body;
    console.log('Received data:', data);
    res.json({ message: 'Data received successfully!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
