let recipients = [
  { name: 'Ankitha R', email: 'ankitha@gmail.com', id: 'CERT-2026-00001', initials: 'AR' },
  { name: 'Rahul Kumar', email: 'rahul@gmail.com', id: 'CERT-2026-00002', initials: 'RK' },
  { name: 'Priya Sharma', email: 'priya@gmail.com', id: 'CERT-2026-00003', initials: 'PS' },
  { name: 'Karthik Nair', email: 'karthik.nair@example.com', id: 'CERT-2026-00004', initials: 'KN' },
  { name: 'Sneha Patel', email: 'sneha.patel@example.com', id: 'CERT-2026-00005', initials: 'SP' },
  { name: 'Mohammad Zaid', email: 'm.zaid@example.com', id: 'CERT-2026-00006', initials: 'MZ' },
  { name: 'Divya Menon', email: 'divya.menon@example.com', id: 'CERT-2026-00007', initials: 'DM' }
];
let currentView = 'dashboard';
let dispatchStarted = false;
let toastTimer;

const views = [...document.querySelectorAll('.view')];
const navItems = [...document.querySelectorAll('.nav-item')];
const pageContext = document.querySelector('#page-context');
const toast = document.querySelector('#toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function navigate(viewName) {
  if (viewName === 'help') {
    showToast('Documentation is coming soon. Your dispatch guide will live here.');
    return;
  }
  currentView = viewName;
  views.forEach(view => view.classList.toggle('active-view', view.id === viewName));
  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
  const label = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  pageContext.textContent = label ? label.textContent.trim().replace(/\d+$/, '') : viewName;
  window.location.hash = viewName;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-view]');
  if (trigger) {
    event.preventDefault();
    navigate(trigger.dataset.view);
  }
});

function renderRecipients(filter = '') {
  const rows = document.querySelector('#recipient-rows');
  const query = filter.toLowerCase();
  const filtered = recipients.filter(recipient => `${recipient.name} ${recipient.email}`.toLowerCase().includes(query));
  rows.innerHTML = filtered.map(recipient => `
    <div class="table-row">
      <span class="recipient-cell"><i class="row-avatar">${recipient.initials}</i><span><strong>${recipient.name}</strong><small>${recipient.email}</small></span></span>
      <span>${recipient.id}</span><span class="status">Verified</span><button class="row-action" data-email="${recipient.email}">View ↗</button>
    </div>`).join('');
  document.querySelector('#recipient-total').textContent = recipients.length;
}

function renderDispatch() {
  const rows = document.querySelector('#dispatch-rows');
  rows.innerHTML = recipients.map(recipient => `
    <div class="table-row">
      <span class="recipient-cell"><i class="row-avatar">${recipient.initials}</i><span><strong>${recipient.name}</strong><small>${recipient.email}</small></span></span>
      <span>${recipient.id}</span><span class="status ${dispatchStarted ? 'sent' : ''}">${dispatchStarted ? 'Delivered' : 'Queued'}</span><button class="row-action" data-send-to="${recipient.email}" data-recipient="${recipient.name}">${dispatchStarted ? 'Email ↗' : 'Send email ↗'}</button>
    </div>`).join('');
}

function sendToRecipient(email, name) {
  const subject = encodeURIComponent('Your certificate from JAIVA Creative Labs');
  const body = encodeURIComponent(`Hi ${name},\n\nCongratulations on completing your internship with JAIVA Creative Labs. Your certificate is ready.\n\nKeep building,\nArjun`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  showToast(`Opening a message addressed to ${email}.`);
}

function startDispatch() {
  if (dispatchStarted) {
    showToast('All 7 certificates are already delivered.');
    return;
  }
  dispatchStarted = true;
  const button = document.querySelector('#send-certificates');
  button.disabled = true;
  button.textContent = 'Sending...';
  const bar = document.querySelector('#dispatch-progress-bar');
  const label = document.querySelector('#progress-label');
  const queue = document.querySelector('#queue-status');
  let complete = 0;
  const timer = setInterval(() => {
    complete += 1;
    bar.style.width = `${Math.round((complete / recipients.length) * 100)}%`;
    label.textContent = `${Math.round((complete / recipients.length) * 100)}% · ${complete} of ${recipients.length} completed`;
    queue.textContent = complete === recipients.length ? '7 delivered' : `${recipients.length - complete} queued`;
    if (complete === recipients.length) {
      clearInterval(timer);
      button.textContent = '✓ Certificates sent';
      button.classList.add('sent');
      renderDispatch();
      showToast('Dispatch complete. 7 certificates delivered successfully.');
    }
  }, 280);
}

document.querySelector('#recipient-search').addEventListener('input', event => renderRecipients(event.target.value));
document.querySelector('#send-certificates').addEventListener('click', startDispatch);
document.querySelector('#save-email').addEventListener('click', () => showToast('Email template saved successfully.'));
document.querySelector('#import-roster').addEventListener('click', () => document.querySelector('#csv-input').click());
document.querySelector('#csv-input').addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lines = String(reader.result).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const imported = lines.slice(lines[0].toLowerCase().includes('email') ? 1 : 0).map(line => {
      const [name, email] = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
      return { name, email };
    }).filter(item => item.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email));
    const existingEmails = new Set(recipients.map(item => item.email.toLowerCase()));
    const nextRecipients = imported.filter(item => !existingEmails.has(item.email.toLowerCase())).map((item, index) => ({
      ...item,
      id: `CERT-2026-${String(recipients.length + index + 1).padStart(5, '0')}`,
      initials: item.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
    }));
    recipients = [...recipients, ...nextRecipients];
    renderRecipients(document.querySelector('#recipient-search').value);
    renderDispatch();
    showToast(nextRecipients.length ? `${nextRecipients.length} recipient${nextRecipients.length > 1 ? 's' : ''} imported.` : 'No new valid recipients found.');
    event.target.value = '';
  };
  reader.readAsText(file);
});
const recipientModal = document.querySelector('#recipient-modal');
function closeRecipientModal() {
  recipientModal.hidden = true;
}
document.querySelector('#add-recipient').addEventListener('click', () => {
  recipientModal.hidden = false;
  document.querySelector('#new-recipient-name').focus();
});
document.querySelector('#close-recipient-modal').addEventListener('click', closeRecipientModal);
document.querySelector('#cancel-recipient').addEventListener('click', closeRecipientModal);
document.querySelector('#recipient-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#new-recipient-name').value.trim();
  const email = document.querySelector('#new-recipient-email').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    return;
  }
  if (recipients.some(item => item.email.toLowerCase() === email.toLowerCase())) {
    showToast('That email is already in the roster.');
    return;
  }
  recipients.push({ name, email, id: `CERT-2026-${String(recipients.length + 1).padStart(5, '0')}`, initials: name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() });
  renderRecipients(document.querySelector('#recipient-search').value);
  renderDispatch();
  document.querySelector('#recipient-form').reset();
  closeRecipientModal();
  showToast(`${name} added to the roster.`);
});
document.querySelector('#recipient-rows').addEventListener('click', event => {
  const button = event.target.closest('[data-email]');
  if (button) showToast(`Certificate recipient: ${button.dataset.email}`);
});
document.querySelector('#dispatch-rows').addEventListener('click', event => {
  const button = event.target.closest('[data-send-to]');
  if (button) sendToRecipient(button.dataset.sendTo, button.dataset.recipient);
});
document.querySelectorAll('.template-option').forEach(option => option.addEventListener('click', () => {
  document.querySelectorAll('.template-option').forEach(item => item.classList.remove('selected'));
  option.classList.add('selected');
  const selected = option.dataset.template || option.querySelector('strong')?.textContent || 'Aurora';
  const target = document.querySelector('#selected-template');
  if (target) target.textContent = selected;
  showToast(`${selected} template selected.`);
}));

const designFields = [
  ['design-title', 'preview-title'],
  ['design-org', 'preview-org'],
  ['design-signer', 'preview-signer']
];
designFields.forEach(([fieldId, previewId]) => {
  document.querySelector(`#${fieldId}`).addEventListener('input', event => {
    document.querySelector(`#${previewId}`).textContent = event.target.value;
  });
});
document.querySelector('#design-color').addEventListener('input', event => {
  document.querySelector('#certificate-preview').style.setProperty('--certificate-accent', event.target.value);
});
document.querySelector('#save-design').addEventListener('click', () => showToast('Certificate design saved to this campaign.'));
document.querySelector('#add-qr').addEventListener('click', () => {
  document.querySelector('#qr-placeholder').classList.toggle('visible');
  showToast('Verification QR toggled on the certificate.');
});
document.querySelector('#add-signature').addEventListener('click', () => {
  document.querySelector('#preview-signer').classList.toggle('signature-style');
  showToast('Signature style toggled.');
});
document.querySelectorAll('[data-design-style]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-design-style]').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  document.querySelector('#certificate-preview').dataset.style = button.dataset.designStyle;
}));

renderRecipients();
renderDispatch();
const startingView = window.location.hash.replace('#', '');
if (startingView && document.querySelector(`#${startingView}.view`)) navigate(startingView);
