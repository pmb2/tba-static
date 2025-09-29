# DNS Setup for n8n.backus.agency

## Step 1: Add DNS Record

Log into your domain registrar (where backus.agency is registered) and add the following DNS record:

- Type: A
- Host: n8n
- Value: [YOUR_SERVER_IP]
- TTL: 3600 (or default)

Replace [YOUR_SERVER_IP] with the public IP address of the server where n8n will run.

## Step 2: Verify DNS Propagation

After adding the DNS record, wait for propagation (can take up to 24 hours, but usually much faster).

You can check if it's propagated using:
```
dig n8n.backus.agency
```

or by using an online DNS checker like https://www.whatsmydns.net/