// WhatsApp Channel URL - Replace with your actual WhatsApp channel link
const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/your-channel-link';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // WhatsApp Join Button
    document.getElementById('whatsappBtn').addEventListener('click', function() {
        window.open(WHATSAPP_CHANNEL_URL, '_blank');
    });

    // VCF Form Submission
    document.getElementById('vcfForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateVCF();
    });

    // Download VCF Button
    document.getElementById('downloadVcf').addEventListener('click', downloadVCF);

    // View Website Button
    document.getElementById('viewWebsite').addEventListener('click', showPersonalWebsite);

    // Back to Generator Button
    document.getElementById('backToGenerator').addEventListener('click', function() {
        document.getElementById('websiteSection').style.display = 'none';
        document.getElementById('previewSection').style.display = 'block';
    });
});

async function generateVCF() {
    const formData = new FormData(document.getElementById('vcfForm'));
    const data = {
        name: formData.get('name'),
        group: formData.get('group'),
        time: formData.get('time'),
        phone: formData.get('phone'),
        email: formData.get('email') || 'Not provided'
    };

    try {
        // Show loading state
        const submitBtn = document.querySelector('.generate-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        submitBtn.disabled = true;

        // Store data for later use
        sessionStorage.setItem('vcfData', JSON.stringify(data));

        // Generate VCF via API
        const response = await fetch('/api/generate-vcf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Store VCF content for download
            sessionStorage.setItem('vcfContent', result.vcfContent);
            sessionStorage.setItem('vcfFilename', result.filename);
            
            // Show preview
            showPreview(data);
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('Error generating VCF:', error);
        alert('Error generating VCF: ' + error.message);
    } finally {
        // Restore button state
        const submitBtn = document.querySelector('.generate-btn');
        submitBtn.innerHTML = '<i class="fas fa-download"></i> Generate VCF & Create Website';
        submitBtn.disabled = false;
    }
}

function showPreview(data) {
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('vcfPreview');

    previewContent.innerHTML = `
        <div class="contact-info">
            <div class="info-item">
                <i class="fas fa-user"></i>
                <strong>Name:</strong> ${escapeHtml(data.name)}
            </div>
            <div class="info-item">
                <i class="fas fa-users"></i>
                <strong>Group:</strong> ${escapeHtml(data.group)}
            </div>
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <strong>Contact Time:</strong> ${escapeHtml(data.time)}
            </div>
            <div class="info-item">
                <i class="fas fa-phone"></i>
                <strong>Phone:</strong> ${escapeHtml(data.phone)}
            </div>
            <div class="info-item">
                <i class="fas fa-envelope"></i>
                <strong>Email:</strong> ${escapeHtml(data.email)}
            </div>
        </div>
    `;

    previewSection.style.display = 'block';
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

function downloadVCF() {
    const data = JSON.parse(sessionStorage.getItem('vcfData'));
    const vcfContent = sessionStorage.getItem('vcfContent');
    const filename = sessionStorage.getItem('vcfFilename');

    if (!vcfContent || !data) {
        alert('Please generate VCF first');
        return;
    }

    // Method 1: Using server download endpoint
    const params = new URLSearchParams({
        name: data.name,
        group: data.group,
        time: data.time,
        phone: data.phone,
        email: data.email
    });

    window.open(`/api/download-vcf?${params.toString()}`, '_blank');

    // Method 2: Client-side download (fallback)
    /*
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    */
}

function showPersonalWebsite() {
    const data = JSON.parse(sessionStorage.getItem('vcfData'));
    if (!data) return;

    const websiteSection = document.getElementById('websiteSection');
    const personalWebsite = document.getElementById('personalWebsite');

    personalWebsite.innerHTML = `
        <div class="contact-info">
            <h3 style="color: #333; margin-bottom: 20px; text-align: center;">${escapeHtml(data.name)}'s Contact Information</h3>
            
            <div class="info-item">
                <i class="fas fa-users"></i>
                <div>
                    <strong>Group/Organization:</strong><br>
                    ${escapeHtml(data.group)}
                </div>
            </div>
            
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <div>
                    <strong>Best Time to Contact:</strong><br>
                    ${escapeHtml(data.time)}
                </div>
            </div>
            
            <div class="info-item">
                <i class="fas fa-phone"></i>
                <div>
                    <strong>Phone Number:</strong><br>
                    <a href="tel:${escapeHtml(data.phone)}" style="color: #25D366; text-decoration: none;">${escapeHtml(data.phone)}</a>
                </div>
            </div>
            
            <div class="info-item">
                <i class="fas fa-envelope"></i>
                <div>
                    <strong>Email:</strong><br>
                    ${data.email !== 'Not provided' ? 
                        `<a href="mailto:${escapeHtml(data.email)}" style="color: #007bff; text-decoration: none;">${escapeHtml(data.email)}</a>` : 
                        'Not provided'
                    }
                </div>
            </div>

            <div style="margin-top: 30px; text-align: center;">
                <button onclick="window.open('${WHATSAPP_CHANNEL_URL}', '_blank')" class="whatsapp-btn" style="width: auto;">
                    <i class="fab fa-whatsapp"></i> Join My WhatsApp Channel
                </button>
            </div>

            <div style="margin-top: 20px; text-align: center;">
                <button onclick="downloadVCF()" class="download-btn" style="width: auto;">
                    <i class="fas fa-download"></i> Download VCF File
                </button>
            </div>
        </div>
    `;

    document.getElementById('previewSection').style.display = 'none';
    websiteSection.style.display = 'block';
    websiteSection.scrollIntoView({ behavior: 'smooth' });
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}        email: formData.get('email') || 'Not provided'
    };

    // Store data for later use
    sessionStorage.setItem('vcfData', JSON.stringify(data));

    // Show preview
    showPreview(data);
}

function showPreview(data) {
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('vcfPreview');

    previewContent.innerHTML = `
        <div class="contact-info">
            <div class="info-item">
                <i class="fas fa-user"></i>
                <strong>Name:</strong> ${data.name}
            </div>
            <div class="info-item">
                <i class="fas fa-users"></i>
                <strong>Group:</strong> ${data.group}
            </div>
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <strong>Contact Time:</strong> ${data.time}
            </div>
            <div class="info-item">
                <i class="fas fa-phone"></i>
                <strong>Phone:</strong> ${data.phone}
            </div>
            <div class="info-item">
                <i class="fas fa-envelope"></i>
                <strong>Email:</strong> ${data.email}
            </div>
        </div>
    `;

    previewSection.style.display = 'block';
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

function downloadVCF() {
    const data = JSON.parse(sessionStorage.getItem('vcfData'));
    if (!data) return;

    const vcfContent = generateVCFContent(data);
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateVCFContent(data) {
    return `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
ORG:${data.group}
TEL:${data.phone}
EMAIL:${data.email}
NOTE:Preferred contact time: ${data.time}
END:VCARD`;
}

function showPersonalWebsite() {
    const data = JSON.parse(sessionStorage.getItem('vcfData'));
    if (!data) return;

    const websiteSection = document.getElementById('websiteSection');
    const personalWebsite = document.getElementById('personalWebsite');

    personalWebsite.innerHTML = `
        <div class="contact-info">
            <h3 style="color: #333; margin-bottom: 20px; text-align: center;">${data.name}'s Contact Information</h3>
            
            <div class="info-item">
                <i class="fas fa-users"></i>
                <div>
                    <strong>Group/Organization:</strong><br>
                    ${data.group}
                </div>
            </div>
            
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <div>
                    <strong>Best Time to Contact:</strong><br>
                    ${data.time}
                </div>
            </div>
            
            <div class="info-item">
                <i class="fas fa-phone"></i>
                <div>
                    <strong>Phone Number:</strong><br>
                    <a href="tel:${data.phone}" style="color: #25D366; text-decoration: none;">${data.phone}</a>
                </div>
            </div>
            
            <div class="info-item">
                <i class="fas fa-envelope"></i>
                <div>
                    <strong>Email:</strong><br>
                    <a href="mailto:${data.email}" style="color: #007bff; text-decoration: none;">${data.email}</a>
                </div>
            </div>

            <div style="margin-top: 30px; text-align: center;">
                <button onclick="window.open('${WHATSAPP_CHANNEL_URL}', '_blank')" class="whatsapp-btn" style="width: auto;">
                    <i class="fab fa-whatsapp"></i> Join My WhatsApp Channel
                </button>
            </div>
        </div>
    `;

    document.getElementById('previewSection').style.display = 'none';
    websiteSection.style.display = 'block';
    websiteSection.scrollIntoView({ behavior: 'smooth' });
}
