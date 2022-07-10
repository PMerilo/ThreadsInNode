$(document).ready (function() {
    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    updateCartTotal()

})

function addtocartClicked(element) {
    var item = element.value;
    console.log(item)
    $.post("/addtoCart",
    {
        sku: item
    })
}

// function addtocartClicked(element) {
//     var item = element.value;
//     console.log(item)

//     $.ajax({
//         url: '/addtoCart',
//         method: 'POST',
//         contentType: 'application/json',
//         data: JSON.stringify({sku: item})
//     })
// }

function disc(){
    var discountamount = $('.cart-discount').text().replace('%', '')
    var subtotal = $('.cart-total-price').text().replace('S$', '')
    subtotal = (subtotal/100) * (100- discountamount)
    document.getElementsByClassName('cart-grandtotal-price')[0].innerText = 'S$' + subtotal
    localStorage.setItem('discountcode',discountcode)
}


function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
    disc()
}


function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var subtotal = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('S$', ''))
        var quantity = quantityElement.value
        total = price * quantity
        subtotal = subtotal + (price * quantity)
        var points = document.getElementsByClassName('vouchers-points').innerText

        cartRow.getElementsByClassName('cart-total')[0].innerText = 'S$' + total
    }
    subtotal = Math.round(subtotal * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = 'S$' + subtotal
    document.getElementsByClassName('cart-grandtotal-price')[0].innerText = 'S$' + subtotal
    // if(subtotal == 0) {
    //     var checkout = document.getElementsById('checkout').disabled = true;
    // }
    
}

$('.cart-quantity-input').change(function() {
    var sku = $(this).next().val()
    var quantity = $(this).val()
    console.log(quantity)
    console.log(sku)
    // var subtotal = $(this).parent('div').parent('div').parent('div').parent('div').parent('div').next().children().next().children().next().children().find('cart-total-price').text()
    $.post('updateCart', {
        sku: sku,
        quantity : quantity,
      })
    disc()
})

// $('.delete-button').click(function() {
//     var sku = $(this).val()
//     console.log(sku)
//     $.post('deleteitem',{
//         sku: sku
//     })
// })

$('.apply-discount-button').click(function() {
    var discountcode = document.getElementsByClassName('discount-input')[0].value
    if (discountcode != localStorage.getItem('discountcode')) {
        console.log(discountcode)
        $.getJSON('/transactions/discount', {
            discount_code: discountcode
        }, function(data) {
            console.log(data)
            $('.cart-discount').text(data.discountcode + "%")
            $('.flash').text(data.flash)
            disc()
        })
    }
    
})

$('.checkout').click(function() {
    var subtotal = $('.cart-grandtotal-price').text().replace('S$', '')
    localStorage.setItem('total',subtotal)
    console.log(subtotal)

    $.getJSON('/transactions/update_total', {
        subtotal : subtotal,
    })
})

$('.show-item').click(function() {
    var sku = this.value
    var ele = $(this).parent("div").next().find(".wishlist")
    console.log(sku)
    $.ajax({
        url: "/wishlist",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({sku : sku, status : "check"}),
        success: function(res){
            if (res.response == 'add' && res.status == "check") {
                ele.addClass("bxs-bookmark-heart")
                // console.log("added")
            } else if (res.response == 'remove' && res.status == "check") {
                ele.removeClass("bxs-bookmark-heart")
                // console.log("removed")
            }
        }
    })
})

$(".delete-item-button").mouseover(function() {
    new SnackBar({
        message: "Clicking this will delete this item",
        status: "info",
        fixed: true
    })
})

$(".delete-cart").mouseover(function() {
    new SnackBar({
        message: "Clicking this will delete the cart",
        status: "error",
        fixed: true
    })
})

function wishList(element) {
    // element.classList.toggle("bxs-bookmark-heart")
    element.classList.add("bx-tada")
    var sku = element.value

    // $.post('wishlist', {
    //     sku: sku
    //   })
    $.ajax({
        url: "/wishlist",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({sku : sku, status : "add/remove"}),
        success: function(res){
            if (res.response == 'add' && res.status == "add/remove") {
                element.classList.add("bxs-bookmark-heart")
                new SnackBar({
                    message:"Item has been added to your wishlist!",
                    status: "info",
                    fixed : true
                })
            } else if (res.response == 'remove' && res.status == "add/remove"){
                element.classList.remove("bxs-bookmark-heart")
                new SnackBar({
                    message:"Item has been removed from your wishlist!",
                    status: "info",
                    fixed : true
                })
            }
        }
    })
    
    if (element.classList.contains("bx-tada")) {
        setTimeout(() => element.classList.remove('bx-tada'), 1100);
    }
    // if (element.classList.contains("bxs-bookmark-heart")) {
    //     new SnackBar({
    //         message:"Item has been added to your wishlist!",
    //         status: "info",
    //         fixed : true
    //     })
    // } else {
    //     new SnackBar({
    //         message:"Item has been removed from your wishlist!",
    //         status: "info",
    //         fixed : true
    //     })
    // }
}