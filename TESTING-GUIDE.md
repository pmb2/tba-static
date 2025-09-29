# Testing n8n SSL and Form Submissions

After deploying n8n with SSL, follow this guide to test your setup and ensure everything is working properly.

## Step 1: Verify SSL Certificate

1. Open your browser and navigate to:
   ```
   https://n8n.backus.agency
   ```

2. Check the certificate details:
   - Click the padlock icon in the address bar
   - Select "Certificate" or similar option
   - Verify the certificate is issued by "Let's Encrypt" or "R3"
   - Check that it's valid for n8n.backus.agency

3. Alternative verification using SSL Labs:
   - Visit https://www.ssllabs.com/ssltest/
   - Enter your domain: n8n.backus.agency
   - Wait for the test to complete (about 2-3 minutes)
   - Verify grade is A or B

## Step 2: Test Form Submission

### Create a Test Workflow in n8n

1. Log in to your n8n instance
2. Go to "Workflows" and click "Import from File"
3. Upload the `n8n-workflow.json` file
4. Activate the workflow

### Test Contact Form

1. Open your website contact form
2. Fill in test data:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Message: This is a test submission
3. Submit the form
4. Check for any console errors in your browser's developer tools (F12)

### Verify Data in n8n

1. In your n8n instance, go to "Executions"
2. You should see a recent execution from the webhook trigger
3. Click on it to view details
4. Verify all form fields were received correctly

## Step 3: Test NocoDB Integration

1. In n8n, configure the NocoDB node with your actual credentials:
   - Edit the "NocoDB - Create Form Submission" node
   - Update the Project ID, Table ID, and credentials
   - Set the field mappings as needed

2. Submit another test form

3. Check your NocoDB database to verify the data was saved

## Step 4: Advanced Testing

### Test CORS Settings

1. Create a simple HTML file to test cross-origin requests:

```html
<!DOCTYPE html>
<html>
<head>
    <title>CORS Test</title>
</head>
<body>
    <h1>CORS Test</h1>
    <button id="testButton">Test Webhook</button>
    
    <script>
        document.getElementById('testButton').addEventListener('click', function() {
            fetch('https://n8n.backus.agency/webhook/form_filled', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: 'CORS',
                    lastName: 'Test',
                    email: 'cors@test.com',
                    message: 'Testing CORS settings',
                    form_type: 'test'
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Success: ' + JSON.stringify(data));
            })
            .catch(error => {
                alert('Error: ' + error);
            });
        });
    </script>
</body>
</html>
```

2. Open this file in your browser and click the test button
3. Check for any CORS errors in the console

### Test SSL Renewal

SSL certificates from Let's Encrypt expire after 90 days and should auto-renew. To test the renewal process:

1. SSH into your server
2. Run a dry-run renewal:
   ```bash
   sudo certbot renew --dry-run
   ```
3. Verify there are no errors in the output

## Step 5: Performance Testing

1. Test form submission with multiple concurrent users:
   - Use a tool like Apache Benchmark:
   ```bash
   ab -n 100 -c 10 -p post-data.json -T 'application/json' https://n8n.backus.agency/webhook/form_filled
   ```
   
   (Create post-data.json with your test form data)

2. Check n8n logs for any performance issues:
   ```bash
   cd /opt/n8n
   docker-compose logs -f n8n
   ```

## Step 6: Security Testing

1. Test SSL security settings:
   - Visit https://www.ssllabs.com/ssltest/
   - Check for any security recommendations

2. Verify proper HTTP to HTTPS redirection:
   ```bash
   curl -I http://n8n.backus.agency
   ```
   Should redirect to HTTPS (Status code 301)

3. Check for information disclosure in headers:
   ```bash
   curl -I https://n8n.backus.agency
   ```
   Verify no sensitive information is exposed in headers

## Troubleshooting Common Issues

### Form Submissions Not Working

1. Check browser console for errors
2. Verify the webhook URL is correct
3. Check n8n logs for any errors:
   ```bash
   cd /opt/n8n
   docker-compose logs -f n8n
   ```

### SSL Certificate Issues

1. Check if certificate is correctly issued:
   ```bash
   sudo certbot certificates
   ```

2. Check Traefik logs:
   ```bash
   docker logs traefik
   ```

3. Verify DNS is correctly configured:
   ```bash
   dig n8n.backus.agency
   ```

### n8n Connection Issues

1. Check if all containers are running:
   ```bash
   docker ps
   ```

2. Restart all services:
   ```bash
   cd /opt/n8n
   docker-compose restart
   ```

3. Check firewall settings:
   ```bash
   ufw status
   ```