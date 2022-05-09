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
    $.post("/transactions/cart",
    {
        sku: item
    })
}

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
    var sku = $(this).parent('div').next().find("form").attr('action').split('/')[3]
    var quantity = $(this).val()
    // var subtotal = $(this).parent('div').parent('div').parent('div').parent('div').parent('div').next().children().next().children().next().children().find('cart-total-price').text()
    $.getJSON('/transactions/update_cart', {
        sku: sku,
        quantity : quantity,
      })
    disc()
}) 

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


function wishList(element) {
    element.classList.toggle("bxs-heart")
}