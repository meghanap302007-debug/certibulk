# CertiBulk

A lightweight certificate operations workspace inspired by the Certificate Bulker and CertiBulk workflows.

## Included

- Campaign dashboard and issuance wizard
- Six certificate template directions
- Recipient search, manual entry, and CSV import
- Email composer with mobile preview
- Certificate dispatch tracker with delivery progress
- Responsive desktop and mobile layouts

## Run locally

Open `index.html` directly, or serve the folder with any static web server.

```powershell
npx serve .
```

The current browser implementation simulates dispatch. Production email delivery requires a server-side provider such as Resend, SendGrid, or SMTP so credentials are not exposed in the browser.
