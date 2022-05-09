// https://github.com/fiduswriter/Simple-DataTables/wiki
window.addEventListener('DOMContentLoaded', event => {

    const customerTable = document.getElementById('customer-table');
    if (customerTable) {
        new simpleDatatables.DataTable(customerTable);
    }

})
