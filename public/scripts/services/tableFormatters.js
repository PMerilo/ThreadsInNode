

function operateFormatter(value, row) {
  return [
    `<div class="d-flex justify-content-evenly">`,
    `<button type="button" class="btn btn-primary" title="Edit Appointment"><i class="bi bi-pencil-square"></i></button>`,
    `<button class="btn btn-danger" title="Cancel Appointment"><i class="bi bi-trash"></i></button>`,
    `</div>`,
  ].join('')
}

function rowStyle(row, index) {
  if (row.confirmed){
    return {
      classes: 'table-success'
    }
  }
  return {classes: 'table-primary'}


}