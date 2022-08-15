

function operateFormatter(value, row) {
  return [
    `<div class="d-flex justify-content-evenly">`,
    `<button type="button" class="btn btn-primary" title="Edit Appointment"><i class="bi bi-pencil-square"></i></button>`,
    `<button class="btn btn-danger" title="Cancel Appointment"><i class="fa-solid fa-ban"></i></button>`,
    `</div>`,
  ].join('')
}

function itemoperateFormatter(value, row) {
  return [
    `<div class="d-flex justify-content-evenly">`,
    `<button type="button" class="btn btn-primary" title="Edit Item"><i class="bi bi-pencil-square"></i></button>`,
    `<button class="btn btn-danger" title="Remove Item"><i class="fa-solid fa-ban"></i></button>`,
    `</div>`,
  ].join('')
}

function colorFormatter(value, row) {
  if (value.startsWith('#') && value.length == 7) {
    return `<span class="" style="width: 20px; background-color: ${value}" aria-hidden="true">${value}</span>`
  } else {
    return value
  }
}


function rowStyle(row, index) {
  if (row.confirmed == "Pending") {
    return {
      classes: 'table-secondary'
    }
  }
  return { classes: 'table-primary' }


}