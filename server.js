const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to generate VCF content
app.post('/api/generate-vcf', (req, res) => {
    try {
        const { name, group, time, phone, email } = req.body;

        if (!name || !group || !time || !phone) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, group, time, phone' 
            });
        }

        const vcfContent = generateVCFContent({
            name: name.trim(),
            group: group.trim(),
            time: time.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : 'Not provided'
        });

        res.json({
            success: true,
            vcfContent: vcfContent,
            filename: `${name.replace(/\s+/g, '_')}.vcf`
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

        const vcfContent = generateVCFContent({
            name: name.trim(),
            group: group.trim(),
            time: time.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : 'Not provided'
        });

        const filename = `${name.replace(/\s+/g, '_')}.vcf`;

        res.setHeader('Content-Type', 'text/vcard');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
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
        service: 'VCF Website Generator'
    });
});

// Serve static files for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// VCF content generation function
function generateVCFContent(data) {
    return `BEGIN:VCARD
VERSION:3.0
FN:${escapeVCF(data.name)}
ORG:${escapeVCF(data.group)}
TEL:${data.phone.replace(/\D/g, '')}
EMAIL:${data.email !== 'Not provided' ? escapeVCF(data.email) : ''}
NOTE:Preferred contact time: ${escapeVCF(data.time)}
URL:${escapeVCF(req.headers.host)}
REV:${new Date().toISOString()}
END:VCARD`;
}

// Helper function to escape VCF special characters
function escapeVCF(text) {
    if (!text) return '';
    return text.replace(/([;,\\])/g, '\\$1');
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 VCF Website Generator running on port ${PORT}`);
    console.log(`📧 Visit: http://localhost:${PORT}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
