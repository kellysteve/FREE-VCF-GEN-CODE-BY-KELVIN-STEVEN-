const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname)); // Serve all static files from root
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Error loading application');
    }
});

// API endpoint to generate VCF content
app.post('/api/generate-vcf', (req, res) => {
    try {
        const { name, group, time, phone, email } = req.body;

        // Validation
        if (!name || !group || !time || !phone) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, group, time, phone' 
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            name: String(name).trim().substring(0, 100),
            group: String(group).trim().substring(0, 100),
            time: String(time).trim().substring(0, 50),
            phone: String(phone).trim().replace(/\D/g, '').substring(0, 20),
            email: email ? String(email).trim().substring(0, 100) : 'Not provided'
        };

        const vcfContent = generateVCFContent(sanitizedData);

        res.json({
            success: true,
            vcfContent: vcfContent,
            filename: `${sanitizedData.name.replace(/\s+/g, '_')}.vcf`,
            data: sanitizedData
        });

    } catch (error) {
        console.error('Error generating VCF:', error);
        res.status(500).json({ 
            error: 'Internal server error while generating VCF' 
        });
    }
});

// API endpoint to download VCF file
app.get('/api/download-vcf', (req, res) => {
    try {
        const { name, group, time, phone, email } = req.query;

        if (!name || !group || !time || !phone) {
            return res.status(400).send('Missing required fields');
        }

        const sanitizedData = {
            name: String(name).trim().substring(0, 100),
            group: String(group).trim().substring(0, 100),
            time: String(time).trim().substring(0, 50),
            phone: String(phone).trim().replace(/\D/g, '').substring(0, 20),
            email: email ? String(email).trim().substring(0, 100) : 'Not provided'
        };

        const vcfContent = generateVCFContent(sanitizedData);
        const filename = `${sanitizedData.name.replace(/\s+/g, '_')}.vcf`;

        res.setHeader('Content-Type', 'text/vcard');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', vcfContent.length);
        res.send(vcfContent);

    } catch (error) {
        console.error('Error downloading VCF:', error);
        res.status(500).send('Error generating VCF file');
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'VCF Website Generator',
        nodeVersion: process.version,
        platform: process.platform
    });
});

// Serve other static files explicitly
app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// VCF content generation function
function generateVCFContent(data) {
    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:${escapeVCF(data.name)}
ORG:${escapeVCF(data.group)}
TEL:${data.phone}
EMAIL:${data.email !== 'Not provided' ? escapeVCF(data.email) : ''}
NOTE:Preferred contact time: ${escapeVCF(data.time)}
REV:${new Date().toISOString()}
END:VCARD`;

    return vcf;
}

// Helper function to escape VCF special characters
function escapeVCF(text) {
    if (!text || text === 'Not provided') return '';
    return String(text).replace(/([;,\\])/g, '\\$1').replace(/\n/g, '\\n');
}

// Serve static files for all other routes (SPA support)
app.get('*', (req, res) => {
    // If it's an API route, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Otherwise serve the main HTML file
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 VCF Website Generator Server Started!
📧 Port: ${PORT}
❤️  Health: http://localhost:${PORT}/health
🌐 Main App: http://localhost:${PORT}
    `);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
