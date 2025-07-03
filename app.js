let db = firebase.firestore();
let auth = firebase.auth();

// ------- PUBLIC VIEW -------
if (document.getElementById('gear-list')) {
  const gearList = document.getElementById('gear-list');
  const searchInput = document.getElementById('search');

  function renderGear(items) {
    gearList.innerHTML = '';
    items.forEach(doc => {
      const gear = doc.data();
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${gear.name}</strong> - 
        Status: <b>${gear.status}</b> 
        ${gear.status === 'available' ? `(in ${gear.bucket})` : ''}
      `;
      gearList.appendChild(div);
    });
  }

  db.collection('equipment').onSnapshot(snapshot => {
    renderGear(snapshot.docs);
  });

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    db.collection('equipment').get().then(snapshot => {
      const filtered = snapshot.docs.filter(doc =>
        doc.data().name.toLowerCase().includes(searchTerm)
      );
      renderGear(filtered);
    });
  });
}

// ------- ADMIN PANEL -------
function signIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(() => {
    document.getElementById('admin-area').style.display = 'block';
    loadAdminGear();
  });
}

function addItem(e) {
  e.preventDefault();
  const name = document.getElementById('item-name').value;
  const bucket = document.getElementById('item-bucket').value;

  db.collection('equipment').add({
    name,
    status: 'available',
    bucket,
    lastUpdated: new Date()
  });

  e.target.reset();
}

function loadAdminGear() {
  const container = document.getElementById('admin-gear-list');
  db.collection('equipment').onSnapshot(snapshot => {
    container.innerHTML = '';
    snapshot.docs.forEach(doc => {
      const gear = doc.data();
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${gear.name}</strong> - Status: <b>${gear.status}</b> - Bucket: ${gear.bucket || 'N/A'}
        <button onclick="updateStatus('${doc.id}', 'available')">Available</button>
        <button onclick="updateStatus('${doc.id}', 'taken')">Taken</button>
      `;
      container.appendChild(div);
    });
  });
}

function updateStatus(id, status) {
  let bucket = '';
  if (status === 'available') {
    bucket = prompt("Enter bucket:");
  }

  db.collection('equipment').doc(id).update({
    status,
    bucket,
    lastUpdated: new Date()
  });
}
