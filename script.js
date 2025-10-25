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

function generateVCF() {
    const formData = new FormData(document.getElementById('vcfForm'));
    const data = {
        name: formData.get('name'),
        group: formData.get('group'),
        time: formData.get('time'),
        phone: formData.get('phone'),
        email: formData.get('email') || 'Not provided'
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
