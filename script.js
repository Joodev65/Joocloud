function closeOverlay() {
  document.getElementById('introOverlay').style.display = 'none';
}

function extractChannelID() {
  const input = document.getElementById('channelInput').value.trim();
  const resultBox = document.getElementById('resultBox');
  const channelIDEl = document.getElementById('channelID');

  // Regex untuk menangkap ID WhatsApp
  const match = input.match(/(?:\/channel\/)([a-zA-Z0-9@]+)/);

  if (match && match[1]) {
    const channelID = match[1].endsWith('@newsletter') ? match[1] : `${match[1]}@newsletter`;
    channelIDEl.textContent = channelID;
    resultBox.classList.remove('hidden');
  } else {
    channelIDEl.textContent = "Link tidak valid!";
    resultBox.classList.remove('hidden');
  }
}

function copyToClipboard() {
  const text = document.getElementById('channelID').textContent;
  navigator.clipboard.writeText(text)
    .then(() => alert("ID berhasil disalin!"))
    .catch(err => alert("Gagal menyalin"));
}
