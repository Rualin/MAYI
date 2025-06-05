// const express = require('express');
// const path = require('path');
// const multer = require('multer');
// const cors = require('cors'); // Добавляем CORS
// const app = express();
// const port = 3000;

// // Включаем CORS для всех запросов
// app.use(cors({
//   origin: 'http://localhost:3000' // Укажите конкретный домен
// }));

// // Увеличиваем лимит на размер загружаемых файлов (например, до 10MB)
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         // Добавляем timestamp к имени файла для уникальности
//         cb(null, Date.now() + '-' + file.originalname)
//     }
// });

// const upload = multer({ 
//     storage: storage,
//     // Добавляем фильтр для проверки типа файла
//     fileFilter: function (req, file, cb) {
//         const filetypes = /jpeg|jpg|png|webp/;
//         const mimetype = filetypes.test(file.mimetype);
//         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
//         if (mimetype && extname) {
//             return cb(null, true);
//         }
//         cb(new Error('Only image files are allowed!'));
//     },
//     // Устанавливаем лимит на размер файла
//     limits: { fileSize: 5 * 1024 * 1024 } // 5MB
// });

// app.use(express.static(path.join(__dirname, '../..')));
// app.use(express.static(path.join(__dirname)));

// // Роуты для страниц
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../start_page.html'));
// });

// app.get('/load_photo_page', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../load_photo_page.html'));
// });

// app.get('/ingredients_page', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../ingredients_page.html'));
// });

// // Эндпоинт для загрузки фото
// app.post('/upload', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
//     }
    
//     try {
//         // Здесь можно добавить обработку изображения (например, с помощью TensorFlow.js или другого инструмента)
        
//         // Имитация анализа изображения и поиска рецептов
//         const recipes = analyzeImage(req.file.path);
        
//         res.json({ 
//             success: true,
//             message: 'Photo uploaded and analyzed successfully!',
//             filePath: `/uploads/${req.file.filename}`,
//             recipes: recipes
//         });
//     } catch (error) {
//         console.error('Error processing image:', error);
//         res.status(500).json({ error: 'Error processing image' });
//     }
// });

// // Эндпоинт для приема данных (если нужно)
// app.post('/api/submit', (req, res) => {
//     const data = req.body;
//     console.log('Received data:', data);
//     res.json({ 
//         success: true,
//         message: 'Data received successfully!',
//         data: data
//     });
// });

// // Функция для имитации анализа изображения (замените на реальную логику)
// function analyzeImage(imagePath) {
//     // В реальном приложении здесь будет анализ изображения
//     // Это примерная реализация, возвращающая тестовые данные
//     return [
//         { 
//             name: 'Паста Карбонара', 
//             url: '/recipe1.html',
//             ingredients: [
//                 'Спагетти - 400 г',
//                 'Гуанчиале - 150 г',
//                 'Яичные желтки - 4 шт',
//                 'Пармезан - 50 г'
//             ],
//             confidence: 0.85
//         },
//         { 
//             name: 'Салат Цезарь', 
//             url: '/recipe2.html',
//             ingredients: [
//                 'Куриное филе - 300 г',
//                 'Листья салата',
//                 'Пармезан',
//                 'Сухарики'
//             ],
//             confidence: 0.78
//         }
//     ];
// }

// // Обработка ошибок загрузки файла
// app.use(function(err, req, res, next) {
//     if (err instanceof multer.MulterError) {
//         // Ошибка Multer при загрузке файла
//         res.status(400).json({ 
//             error: err.message,
//             details: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.code
//         });
//     } else if (err) {
//         // Другие ошибки
//         res.status(500).json({ error: err.message });
//     }
// });

// // Создаем папку uploads, если её нет
// const fs = require('fs');
// const uploadDir = 'uploads';
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
//     console.log(`Upload directory: ${path.join(__dirname, uploadDir)}`);
// });

// // const express = require('express');
// // const path = require('path');
// // const multer = require('multer');
// // const app = express();
// // const port = 3000;

// // app.use(express.json());

// // const storage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //         cb(null, 'uploads/')
// //     },
// //     filename: function (req, file, cb) {
// //         cb(null, file.originalname)
// //     }
// // });

// // const upload = multer({ storage: storage });

// // app.use(express.static(path.join(__dirname, 'public')));
// // app.use(express.static(path.join(__dirname)));

// // app.get('/', (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'start_page.html'));
// // });

// // app.get('/load_photo_page', (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'load_photo_page.html'));
// // });

// // app.get('/ingredients_page', (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'ingredients_page.html'));
// // });

// // app.post('/upload', upload.single('photo'), (req, res) => {
// //     if (!req.file) {
// //         return res.status(400).send('No file uploaded.');
// //     }
// //     res.json({ message: 'Photo uploaded successfully!', filePath: req.file.path });
// // });

// // app.post('/api/submit', (req, res) => {
// //     const data = req.body;
// //     console.log('Received data:', data);
// //     res.json({ message: 'Data received successfully!' });
// // });

// // app.listen(port, () => {
// //     console.log(`Server is running on http://localhost:${port}`);
// // });
