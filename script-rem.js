const API_KEY = '718e5a8e6c7d45cf821cfa2fbbf5e21b';
const APP_ID = '__k9sUFM';
const TEMPLATE_ID = '713433921135725669';
const ENDPOINT = 'https://ap-east-1.tensorart.cloud';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----`;

async function generateSignature(method, url, appId, body) {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${method}${url}${timestamp}${appId}${body ? JSON.stringify(body) : ''}`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(message);
    sign.end();
    const signature = sign.sign(PRIVATE_KEY, 'base64');
    return `TAMS-HMAC-SHA256 ${timestamp}:${signature}`;
}

document.getElementById('uploadButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    const errorDiv = document.getElementById('error');
    const processedImage = document.getElementById('processedImage');

    // Reset error message and processed image
    errorDiv.textContent = '';
    processedImage.style.display = 'none';

    if (!file) {
        errorDiv.textContent = 'Please select an image to upload.';
        return;
    }

    try {
        const signature = await generateSignature('POST', '/v1/resource/image', APP_ID, { expireSec: 3600 });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('app_id', APP_ID);
        formData.append('template_id', TEMPLATE_ID);
        formData.append('signature', signature);

        const response = await fetch(`${ENDPOINT}/v1/resource/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const result = await response.json();
        const processedImageUrl = result.data.output_url;

        processedImage.src = processedImageUrl;
        processedImage.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'An error occurred while processing the image: ' + error.message;
    }
});
