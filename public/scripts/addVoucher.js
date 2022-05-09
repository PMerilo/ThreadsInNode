let vouchersInCustomer = []
const vouchers = document.querySelectorAll(".voucher");


const updateMyVouchersHTML = function() {
    if(vouchersInCustomer.length > 0) {
        let result = vouchersInCustomer.map(vouchers => {
            return `
            <div class="col-6 mx-3">
                <p class="fs-5 mb-0 d-none voucher_id" style="font-weight: 600;">${vouchers.id}</p>       
                <p class="fs-5 mb-0" style="font-weight: 600;">${vouchers.vname}</p>
                <p class="text-start mb-1">${vouchers.vdescription}</p>
                <p class="fs-6 my-0" style="font-weight: 600;">${vouchers.vcode}</p>
                <p class="fs-6 my-0" style="font-weight: 600;">${vouchers.spools_needed}</p>
                <p class="fs-6 my-0" style="font-weight: 600;">${vouchers.vamount}</p>
                <p class="fs-6 my-0" style="font-weight: 600;">${vouchers.vexpirydate}</p>
            </div>
            `
        });
        parentElement.innerHTML = result.join('');
    } 
}




function updateVouchersInCustomer(voucher) {
    for(let i=0; i < vouchersInCustomer; i++){
        if(vouchersInCustomer[i].id == voucher.id) {
            vouchersInCustomer[i].count += 1;
        }
    }
}






vouchers.forEach(voucher => {
    vouchers.addEventListener('click', (e) => {
        if (e.target.classList.contains('collect')) {
            const id = voucher.querySelector('.voucher_id').innerHTML;
            const vname = voucher.querySelector('.vname').innerHTML;
            const vdescription = voucher.querySelector('.vdescription').innerHTML;
            const vcode = voucher.querySelector('.vcode').innerHTML;
            const spools_needed = voucher.querySelector('.spools_needed').innerHTML;
            const vamount = voucher.querySelector('.vamount').innerHTML;
            const vexpirydate = voucher.querySelector('.vexpirydate').innerHTML;
            let vouchersToCustomer = {
                voucher_id = id,
                name = vname, 
                description = vdescription,
                code = vcode,
                spools_needed = +spools_needed,
                amount = +vamount,
                expirydate = vexpirydate
            }
            updateVouchersInCustomer(vouchersToCustomer);
            updateMyVouchersHTML();
            console.log('collected')
        }

    }
    
    )

}
    
    )

















// $(function(){
//     var voucher_total = $("#voucher_total");
//     var voucher_items_count = $("#voucher_items_count");

//     $(".add_to_myvoucher_button").click(function(){
//         var el = $(this);
//         var voucher_id = el.data("voucher_id");
//         var url = "/customer/rewards/add";
//         $.ajax(url, {
//             method: 'POST',
//             data: {voucher: voucher_id, quantity: 1},
//             success: function(result){
//                 console.log(result);
//                 voucher_total.text(result.total / 100);
//                 voucher_items_count.text(result.items.length);
//             }
//         });
//         return false;
//     });
// });


