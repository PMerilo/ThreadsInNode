var $table = $('#reqTable')
var exampleModal = document.getElementById('exampleModal')
var inputTitle = $('input', exampleModal)
var textarea = $('textarea', exampleModal)
var conBtn = $('.confirm')
var delBtn = document.querySelector('.del')

window.operateEvents = {
  'click .edit': function (e, value, row, index) {
    inputTitle.val(row.title)
    textarea.text(row.description)
    conBtn.attr('data-bs-id', row.id)
  },
  'click .delete': function (e, value, row, index) {
    delBtn.setAttribute('data-bs-id', row.id)
  }
}

window.apptEvents = {
  'click .toggle-view': function (e, value, row, index) {
    $table.bootstrapTable('toggleDetailView', index)
  }

};