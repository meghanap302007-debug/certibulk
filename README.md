# CertiBulk

A lightweight certificate operations workspace inspired by the Certificate Bulker and CertiBulk workflows.

## Included

- Campaign dashboard and issuance wizard
- Six certificate template directions
- Recipient search, manual entry, and CSV import
- Email composer with mobile preview
- Certificate dispatch tracker with delivery progress
- Responsive desktop and mobile layouts
- Server-side PDF generation and Resend email delivery endpoint

## Run locally

Open `index.html` directly, or serve the folder with any static web server.

```powershell
npx serve .
```

## Enable real delivery

The Vercel function at `/api/send-certificate` generates a PDF and sends it to the exact recipient email. Add these environment variables in the Vercel project:

- `RESEND_API_KEY`: your Resend API key
- `CERTIFICATE_FROM_EMAIL`: a verified sender, such as `CertiBulk <certificates@yourdomain.com>`

Without those variables, the app reports that delivery is not configured instead of pretending an email was sent.
