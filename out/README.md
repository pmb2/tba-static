# The Backus Agency Static Website

This repository contains the static build of The Backus Agency website. It is built using Next.js with static export and hosted on GitHub Pages.

## Features

- Fully static website that can be hosted on any static hosting service
- Seamless form submissions handled through Google Forms
- Responsive design for all device sizes
- Blog with pre-rendered static pages

## Form Integration

All forms on the website use Google Forms for data collection, with the form submissions happening in the background using hidden iframes so users never leave the website:

### Current Form URLs:
- Contact Page Form: https://forms.gle/eLEB9o8dZDUpJN2M9
- Modal Contact Form: https://forms.gle/RXDE6bTiC7Hr6sRG9
- Newsletter Form: https://forms.gle/Tqk6uPCTb5nhzCRj7

### Form Field IDs

The forms have been set up with the correct field IDs:

#### Contact Page Form:
- Full Name: entry.166753821
- Email Address: entry.954130076
- Phone Number: entry.567915182
- Subject: entry.1610345589
- Message: entry.1399234245

#### Modal Contact Form:
- Full Name: entry.1276624459
- Email Address: entry.1518968024
- Company: entry.1124255865
- Phone Number: entry.1190224258
- Message: entry.576384222

#### Newsletter Form:
- Email Address: entry.456327236

## About The Backus Agency

The Backus Agency is a full-stack product team for rapidly growing companies, specializing in taking products from concept to MVP in record time.

## GitHub Pages Setup

This repository is configured to be deployed to GitHub Pages. When changes are pushed to the main branch, GitHub Actions will automatically deploy the website to GitHub Pages.

To connect your custom domain:
1. Go to the repository settings
2. Navigate to the "Pages" section
3. Enter your custom domain name
4. Update your DNS settings to point to GitHub Pages servers