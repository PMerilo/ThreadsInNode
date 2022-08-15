function operateFormatter(value, row) {
  return [
      '<div class="d-flex justify-content-evenly">',
      `<button class="btn btn-primary edit" data-bs-toggle="modal" data-bs-target="#exampleModal" title="Edit">`,
      '<i class="bi bi-check-square"></i>',
      '</button>',
      '</div>'
    ].join('') 
}
