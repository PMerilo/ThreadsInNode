$(document).ready(function () {
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
function disc() {
    var discountamount = $('.cart-discount').text().replace('%', '')
    var subtotal = $('.cart-total-price').text().replace('S$', '')
    subtotal = ((subtotal / 100) * (100 - discountamount)).toFixed(2)
    document.getElementsByClassName('cart-grandtotal-price')[0].innerText = 'S$' + subtotal
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
    var cartDisplay = $(".cart-display").val()
    console.log(cartDisplay)
    if (cartDisplay == 1) {
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
    } else if (cartDisplay == 0) {
        var checkout = document.getElementById('checkout')
        var discButton = document.getElementById('apply-discount-button')
        checkout.disabled = true;
        discButton.disabled = true;
        new SnackBar({
            message: "You need atleast one product in your cart to checkout",
            status: "info",
            fixed: true,
            dismissible: false,
            timeout: false
        })
    }

}

$('.cart-quantity-input').change(function () {
    var sku = $(this).next().val()
    var quantity = $(this).val()
    console.log(quantity)
    console.log(sku)
    // var subtotal = $(this).parent('div').parent('div').parent('div').parent('div').parent('div').next().children().next().children().next().children().find('cart-total-price').text()
    $.post('updateCart', {
        sku: sku,
        quantity: quantity,
    })
    disc()
    setTimeout(() => checkoutsave(), 50);
})

$('.apply-discount-button').click(function () {
    var discountcode = document.getElementsByClassName('discount-input')[0].value
    var discount_card = document.getElementById('discount-card')
    console.log(discountcode)
    $.ajax({
        url: "/discount",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({ code: discountcode, status: "check" }),
        success: function (res) {
            if (res.status == "success") {
                new SnackBar({
                    message: "Discount has been applied!",
                    status: "success",
                    fixed: true
                })
                discount_card.style.display = "";
                $('.cart-discount').text(res.discount_amount + "%")
                console.log(discountcode)
                $('#discount_code_entered').val(discountcode)
                localStorage.setItem("discount_amount", res.discount_amount)
                disc()
            } else if (res.status == "spools_shortage") {
                new SnackBar({
                    message: "You do not have enough spools to use this voucher!",
                    status: "error",
                    fixed: true
                })
                discount_card.style.cssText = "display:none !important;";
                $('.cart-discount').text(0 + "%")
                $('#discount_code_entered').val("")
                localStorage.setItem("discount_amount", "")
                disc()
            } else if (res.status == "voucher_expired") {
                new SnackBar({
                    message: "This voucher has expired!",
                    status: "error",
                    fixed: true
                })
                discount_card.style.cssText = "display:none !important;";
                $('.cart-discount').text(0 + "%")
                $('#discount_code_entered').val("")
                localStorage.setItem("discount_amount", "")
                disc()
            } else if (res.status == "voucher_ran_out") {
                new SnackBar({
                    message: "Be faster next time! Voucher has been used up",
                    status: "error",
                    fixed: true
                })
                discount_card.style.cssText = "display:none !important;";
                $('.cart-discount').text(0 + "%")
                $('#discount_code_entered').val("")
                localStorage.setItem("discount_amount", "")
                disc()
            } else if (res.status == "no_such_voucher") {
                new SnackBar({
                    message: "There is no such voucher!",
                    status: "error",
                    fixed: true
                })
                discount_card.style.cssText = "display:none !important;";
                $('.cart-discount').text(0 + "%")
                $('#discount_code_entered').val("")
                localStorage.setItem("discount_amount", "")
                disc()
            } else {
                new SnackBar({
                    message: "Please contact an admin to fix the issue!",
                    status: "error",
                    fixed: true
                })
                discount_card.style.cssText = "display:none !important;";
                $('.cart-discount').text(0 + "%")
                $('#discount_code_entered').val("")
                localStorage.setItem("discount_amount", "")
                disc()
            }
            setTimeout(() => checkoutsave(), 50);
        }
    })
})

$('.checkout').click(function () {
    checkoutsave()
    // var subtotal = $('.cart-grandtotal-price').text().replace('S$', '')
    // var discount_code = $('#discount_code_entered').val()
    // // localStorage.setItem('total',subtotal)
    // console.log(subtotal)
    // console.log(discount_code)

    // $.post('/checkoutsave', {
    //     subtotal : subtotal,
    //     discount_code : discount_code
    // })
})
function checkoutsave() {
    var subtotal = $('.cart-grandtotal-price').text().replace('S$', '')
    var discount_code = $('#discount_code_entered').val()
    localStorage.setItem('total',subtotal)
    console.log(subtotal)
    console.log(discount_code)

    $.post('/checkoutsave', {
        subtotal: subtotal,
        discount_code: discount_code
    })
}

$('.modal-opener').click(function () {
    var sku = this.value
    var ele = $(this).parent("div").next().find(".wishlist")
    console.log(ele)
    $.ajax({
        url: "/wishlist",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({ sku: sku, status: "check" }),
        success: function (res) {
            if (res.response == 'add' && res.status == "check") {
                ele.addClass("bxs-bookmark-heart")
                // console.log("added")
            } else if (res.response == 'remove' && res.status == "check") {
                ele.removeClass("bxs-bookmark-heart")
                // console.log("removed")
            }
        }
    })

    $.ajax({
        url: "/reviewUpdate",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({ sku: sku , status:"modal"}),
        success: function (res) {
            var avgrating = res.starAvg
            var roundedrating = res.roundedAvg
            var reviewContainer = document.getElementById('review_'+sku)
            var int = Math.floor(roundedrating)
            console.log(roundedrating)
            console.log(avgrating)
            var stars = reviewContainer.getElementsByClassName('review-star')
            var n = 0
            for (var i = 0; i < int; i++) {
                var star = stars[i]
                star.classList.add('bxs-star')
                n++
            }
            if (roundedrating > int && int <= 5) {
                var star = stars[n]
                star.classList.add("bxs-star-half")
            }
        }
    })
})

$(".delete-item-button").one("mouseenter", function () {
    new SnackBar({
        message: "Clicking this will delete this item",
        status: "info",
        fixed: true
    })
})

$(".delete-cart").one("mouseenter", function () {
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
    console.log(sku)

    // $.post('wishlist', {
    //     sku: sku
    //   })
    $.ajax({
        url: "/wishlist",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({ sku: sku, status: "add/remove" }),
        success: function (res) {
            if (res.response == 'add' && res.status == "add/remove") {
                element.classList.add("bxs-bookmark-heart")
                new SnackBar({
                    message: "Item has been added to your wishlist!",
                    status: "info",
                    fixed: true
                })
            } else if (res.response == 'remove' && res.status == "add/remove") {
                element.classList.remove("bxs-bookmark-heart")
                new SnackBar({
                    message: "Item has been removed from your wishlist!",
                    status: "info",
                    fixed: true
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
