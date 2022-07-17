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
