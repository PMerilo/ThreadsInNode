function operateFormatter(value, row) {
  if (row.confirmed === null) {
    btnOptions = ['secondary', 'dash','title="Approve Appointment"' ]
  } else if (row.confirmed) {
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
