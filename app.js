const express = require('express');
const multer = require('multer');
const fs = require('fs');
//const { v4: uuidv4 } = require('uuid');
const path = require('path');

function generateThreeDigitRandom() {
    return Math.floor(Math.random() * 900) + 100;
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'uploads')));


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    // Get uploaded file details
    const { file } = req;
    const {
        user_name,
        surname,
        role,
        image

    } = req.body

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read existing file data
    let filesData = [];
    try {
        const filesDataRaw = fs.readFileSync('uploads/files.json');
        filesData = JSON.parse(filesDataRaw);
    } catch (err) {
        console.error('Error reading file:', err);
    }

    // Add new file data
    filesData.push({
        // main_id: ,
        filename: file.filename,
        name: user_name,
        surname: surname, // originalname: file.originalname,
        role: role,
        // mimetype: file.mimetype,
        // size: file.size,
        main_id: JSON.stringify(generateThreeDigitRandom())

    });

    // Write updated file data to JSON file
    fs.writeFile('uploads/files.json', JSON.stringify(filesData, null, 2), err => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Failed to upload file' });
        }

        res.status(200).json({ message: 'File uploaded successfully' });
    });
});

app.get('/users', (req, res) => {
    // Read data from JSON file
    fs.readFile('uploads/files.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Could not retrieve data.' });
        }
        // Parse JSON data
        const userData = JSON.parse(data);
        res.json(userData);
    });
});



app.put('/update', (req, res) => {
    const { main_id, time } = req.body;
    // const { status } = req.body.time;
    console.log("request", req.body)

    // Read existing file data
    let filesData = [];
    try {
        const filesDataRaw = fs.readFileSync('uploads/files.json');
        filesData = JSON.parse(filesDataRaw);
    } catch (err) {
        console.error('Error reading file:', err);
        return res.status(500).json({ error: 'Failed to update file' });
    }

    // Find the file by filename
    const fileIndex = filesData.findIndex(file => file.main_id === main_id);

    if (fileIndex === -1) {
        return res.status(404).json({ error: 'File not found' });
    }

    if (!filesData[fileIndex].created_at) {
        filesData[fileIndex].created_at = time
    }


    // Write updated file data to JSON file
    fs.writeFile('uploads/files.json', JSON.stringify(filesData, null, 2), err => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Failed to update file' });
        }

        res.status(200).json({ message: 'File updated successfully' });
    });
});

// Endpoint for deleting a file by filename
app.delete('/delete/:main_id', (req, res) => {
    const main_id = req.params.main_id;

    // Read existing file data
    let filesData = [];
    try {
        const filesDataRaw = fs.readFileSync('uploads/files.json');
        filesData = JSON.parse(filesDataRaw);
    } catch (err) {
        console.error('Error reading file:', err);
        return res.status(500).json({ error: 'Failed to delete file' });
    }

    // Find the index of the file by filename
    const fileIndex = filesData.findIndex(file => file.main_id === main_id);

    if (fileIndex === -1) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Remove the file entry from the array
    filesData.splice(fileIndex, 1);

    // Write updated file data to JSON file
    fs.writeFile('uploads/files.json', JSON.stringify(filesData, null, 2), err => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Failed to delete file' });
        }

        res.status(200).json({ message: 'File deleted successfully' });
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});