// Simple-DataTables
// https://github.com/fiduswriter/Simple-DataTables/wiki
window.addEventListener('DOMContentLoaded', event => {

    const archiveTable = document.getElementById('archive-table');
    if (archiveTable) {
        new simpleDatatables.DataTable(archiveTable);
    }

    const inventoryTable = document.getElementById('inventory-table');
    if (inventoryTable) {
        new simpleDatatables.DataTable(inventoryTable);
    }

});


