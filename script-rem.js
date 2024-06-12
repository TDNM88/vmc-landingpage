const API_KEY = '718e5a8e6c7d45cf821cfa2fbbf5e21b';
const APP_ID = '__k9sUFM';
const TEMPLATE_ID = '713433921135725669';
const ENDPOINT = 'https://ap-east-1.tensorart.cloud';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEpAIBAAKCAQEAufVBBTEHKYB4wHB/XqxTFZBJ+Qv2C1TYkaYR73nr37Zj5COW3M9ZzT8nKanx+cgQ60sqkn9qDILTlp82d2/BP/8FQmcG+wWi4fzfFmpzJUxauQKvhryohT6h7iDdVgRA9Rp/ogz4bpSM6Oiws7xzu5OmkKja4gpgqBwG1833T4Hqdhja5Ppl4ltj2ID3ZojuCTir6W6qD/bj2ohYakFpkc5IYgYRLOFaDd7gayvzkVHE5YSf
3bw5cGAILrZitaFvNYINQhdKd/Cfpyvavd33wDa1q01Q7v3SLkzkKH3Jszqc7YAUF7HETunuVljtRrfPjQjVuKgGzEK0iAJh2k8FqQIDAQABAoIBAGhusJ4+w3vuN2Izi4RamKpihviDXCFO+/UH48iumuXfI0grKH1HQXJ/xfmjBE63qbDKXNU7Ew6FplhPf6Ihs9DB4m1BOO1eY/QwNAT9sT7AG68NMBAmASobW4tFD6hP6T79K7KRQC+x41Sl4R5/ditgp0lUWuBY3aFrY/hsJjiSkyWACum/8DuyHWJYd1rtrYTHXk+fdMZGDk4/+G4xFkbBcq7/VCe4+HsxOLV7gEQ9WmkpzVtEluT75LRbX5bwFpW74AUj10GkKNXqKBn6RaeyRL4DQLAYVM7rsK+AHF+VOF+tJ1LbRHmoJV09/ok9J5IttdVfs4TLW6zy+PhTr6UCgYEA4iRe23rO9PuOGkrwPLkBylJcezYLqIMb8EuJPbsEkPtJgxkOZz2SB8oN6u/PiZIjlfKrYb433D13YDjbdesZXxO+bt0ph2Yg9gxViZ5v4KW8xj+q2Ez+REBKu+cJoQoLlhkzFtJNGXQjFx1Z4LLPdiHBDhuhjAsuhGMmbhRRzX8CgYEA0oKoYFldtYcgIndmIqWloTCR0EofZuw0GNTV5Qj3zT6YWPg9rXX/K7rZXm/HS5FlbxioWvJQKUygA6Pcv2kpoWZ9LmqT4RfsF/YkoS43Chb6amShY2NXoGiv+tdlguJABPrWgg9WW4NKx+kkzjgqa/B/o8/8L53bTx1ybgP8kNcCgYEAsy0KE3BMhgLCZsa1bgdQCdQT/nOl7RBklJHk3YpOZekUJ9E0fkxkZdOMD3eOwnuNwoMRk1I5xEDXUt/50oZCBfkIy6JkAynCN/Ex3OYx0pa+6X0MinEGjWE7VYILORNSdszkk9Jw0BgarXfN/KDwi7LW2ay+5Mz/QFmm21UyM1UCgYEAuhUdWe4lU+3ajh0Vf9MFknMosgKTt5tcggbB /O/sfNW0PhFSFB+WLMXCmCQe+8HO9GHLkHlaOuetGwqie+EuF6pNRdaYWgWXgabnwkLkDFs7iQjjUMPkFbv0s7vr08LD7KL/M4DzSXnJhOWmz1P+y+OQMPINbtoPnuPc3ztO64kCgYBJktd41VVvCj+zLnfSi/pru3dfcpqjKEBricWcHpqsqjyOFlqmdZx/mt5g9EZ0gEdpG5vZrPVLN8d9mNL8dJKbOhN4sMYcXAsNLTUqst9+TPnpNtGizU6PXi7C3KLS7Q7hDe2uiwRu7lIuPffeHm0ZkgNGzFRsL/Vrm/6eWCuFdA==
-----END PRIVATE KEY-----`;


async function generateSignature(method, url, appId, body) {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${method}${url}${timestamp}${appId}${body ? JSON.stringify(body) : ''}`;
    const rsa = new KJUR.crypto.Signature({ "alg": "SHA256withRSA" });
    rsa.init(PRIVATE_KEY);
    rsa.updateString(message);
    const signature = rsa.sign();
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
