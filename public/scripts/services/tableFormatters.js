var $table = $('table')

function operateFormatter(value, row) {
  return [
    '<div class="d-flex justify-content-evenly">',
    `<button class="btn btn-primary edit" data-bs-toggle="modal" data-bs-target="#exampleModal" title="Edit">`,
    '<i class="bi bi-pencil-square"></i>',
    '</button>',
    '<button class="btn btn-primary delete" data-bs-toggle="modal" data-bs-target="#delModal" title="Delete">',
    '<i class="bi bi-trash"></i>',
    '</button>',
    '</div>'
  ].join('')
}

function nameFormatter(value, row) {
  // console.log(value)
  return value + ' ' + row.lName
}

function apptFormatter(value, row, index) {
  return `<button type="button" class="btn btn-secondary toggle-view" data-bs-index="${index}">Appointments</button>`
}

function apptDetailFormatter(value, row, index) {
  console.log(row.appointments)
  return value.date
}