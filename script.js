const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    contents.forEach(c => c.classList.remove('active'));
    document.getElementById(tab.dataset.tab).classList.add('active');
    
    if (tab.dataset.tab === 'consulta') {
      renderList();
    }
  });
});

const form = document.getElementById('formCadastro');
const listEl = document.getElementById('birthday-list');
const emptyMsg = document.getElementById('empty-msg');
const successMessage = document.getElementById('success-message'); 

function loadData() {
  return JSON.parse(localStorage.getItem('aniversariantes')) || [];
}
function saveData(data) {
  localStorage.setItem('aniversariantes', JSON.stringify(data));
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function showError(inputId, message) {
  document.getElementById(`error-${inputId}`).textContent = message;
  document.getElementById(inputId).classList.add('invalid'); 
}
function clearError(inputId) {
  document.getElementById(`error-${inputId}`).textContent = '';
  document.getElementById(inputId).classList.remove('invalid'); 
}


function showSuccess() {
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000); 
}

const campos = ['name', 'email', 'password', 'confirm-password', 'birthdate'];
campos.forEach(campoId => {
  const campo = document.getElementById(campoId);
  campo.addEventListener('input', () => {
    if (campo.validity.valid) {
      clearError(campoId);
    } else {
      if (campo.validity.valueMissing) {
        showError(campoId, 'Este campo é obrigatório.');
      } else if (campo.validity.typeMismatch) {
        showError(campoId, 'Formato inválido.');
      } else if (campo.validity.tooShort) {
        showError(campoId, `Mínimo de ${campo.minLength} caracteres.`);
      }
    }
  
    if (campoId === 'password' || campoId === 'confirm-password') {
        validatePasswordMatch();
    }
  });
});


function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
    if (password && confirm && password !== confirm) {
        showError('confirm-password', 'As senhas não conferem.');
        return false;
    } else {
        clearError('confirm-password');
        return true;
    }
}


form.addEventListener('submit', e => {
  e.preventDefault();

  if (!validatePasswordMatch()) {
    return;
  }
  
  
  if (!form.checkValidity()) {
      return;
  }

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  
  const password = document.getElementById('password').value; 
  const birthdate = document.getElementById('birthdate').value;

  const data = loadData();
  
  
  data.push({ id: Date.now(), name, email, password, birthdate });
  saveData(data);

  form.reset();
  campos.forEach(c => clearError(c));
  showSuccess(); 
});

const searchInput = document.getElementById('search');
const filterMonth = document.getElementById('filter-month');

function renderList() {
  const data = loadData();
  const month = filterMonth.value;
  const query = searchInput.value.trim().toLowerCase();

  let filtered = data.sort((a, b) => {
    
    const dateA = new Date(a.birthdate);
    const dateB = new Date(b.birthdate);
    const monthA = dateA.getMonth();
    const monthB = dateB.getMonth();
    const dayA = dateA.getDate();
    const dayB = dateB.getDate();
    
    if (monthA !== monthB) {
        return monthA - monthB;
    }
    return dayA - dayB;
  });

  if (month !== 'all') {
    filtered = filtered.filter(item => new Date(item.birthdate).getMonth() + 1 == month);
  }

  if (query) {
    filtered = filtered.filter(item => item.name.toLowerCase().includes(query));
  }

  listEl.innerHTML = '';
  if (filtered.length === 0) {
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    
  
    filtered.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.name} - ${formatDate(item.birthdate)}`;
      
      const delBtn = document.createElement('button');
      delBtn.textContent = "Excluir";
      
      
      delBtn.addEventListener('click', () => {
        deleteBirthday(item.id); 
      });
      
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }
}


function deleteBirthday(id) {
    let data = loadData();
   
    const indexToDelete = data.findIndex(item => item.id === id); 

    if (indexToDelete > -1) {
        data.splice(indexToDelete, 1);
        saveData(data);
        renderList();
    }
}


searchInput.addEventListener('input', renderList);
filterMonth.addEventListener('change', renderList);
renderList(); 