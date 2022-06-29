var $table = $('#reqTable')
var exampleModal = document.getElementById('exampleModal')
var modalTitle = exampleModal.querySelector('.modal-title')
var statusbtns = exampleModal.querySelectorAll('.statusbtn')
var delBtn = document.querySelector('.del')

window.operateEvents = {
    'click .edit': function (e, value, row, index) {
      
      modalTitle.textContent = 'Change status of Request ' + row.id
      statusbtns.forEach(element => {
        element.setAttribute('data-bs-id', row.id)
        if (element.innerText == row.status) {
          element.classList.remove('btn-primary')
          element.classList.add('btn-success')
        }
      });
    },
    'click .delete': function (e, value, row, index) {
      delBtn.setAttribute('data-bs-id', row.id)
    }
  }