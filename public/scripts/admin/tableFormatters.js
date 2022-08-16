

function operateFormatter(value, row) {
  if (row.confirmed == "Pending") {
    btnOptions = ['secondary', 'dash','title="Approve Appointment"' ]
  } else if (row.confirmed == "Confirmed") {
    btnOptions = ['success pe-none', 'check', 'onclick="return false;"']
  } else {
    btnOptions = ['danger pe-none', 'x', 'onclick="return false;"']
  }
  return [
    `<div class="d-flex justify-content-evenly">`,
    `<button type="button" class="btn btn-${btnOptions[0]} flex-fill" ${btnOptions[2]}><i class="bi bi-${btnOptions[1]}-square"></i></button>`,
    `</div>`,
  ].join('')
}


function itemoperateFormatter(value, row) {
  return [
    `<div class="d-flex justify-content-evenly">`,
    `<button type="button" class="btn btn-primary" title="Edit Item"><i class="bi bi-pencil-square"></i></button>`,
    `</div>`,
  ].join('')
}

function qtyFormatter(value, row) {
  return `<input class="form-control" type="number" min="1" value="${value}" name="qty"></input>`
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