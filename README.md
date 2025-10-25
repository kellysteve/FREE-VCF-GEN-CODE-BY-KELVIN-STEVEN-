# VCF Website Generator

A web application that allows users to create personalized VCF (Virtual Contact File) websites with WhatsApp channel integration.

## Features

- WhatsApp channel integration
- VCF file generation and download
- Personal contact website creation
- Responsive design
- Easy deployment on Render

## Deployment on Render

### Method 1: Static Site (Recommended)
1. Fork this repository or create a new one with these files
2. Go to [Render.com](https://render.com)
3. Click "New +" and select "Static Site"
4. Connect your GitHub repository
5. Set build command: `echo "No build required"`
6. Set publish directory: `.` (dot)
7. Click "Create Static Site"

### Method 2: Web Service
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Click "Create Web Service"

## Configuration

Update the WhatsApp channel URL in `script.js`:
```javascript
const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/your-actual-channel-link';
