document.querySelector('.card-number-input').oninput = () => {
    document.querySelector('.card-number-box').innerText = document.querySelector('.card-number-input').value;
    value = document.querySelector('.card-number-input').value
    var card_type = document.querySelectorAll('.card_type')
    if (value != '') {
        document.querySelector('.card-number-input').innerText = document.querySelector('.card-number-input').value;
    }
    else {
        document.querySelector('.card-number-input').innerText = '################'
    }
    if (value[0] == '4') {
        card_type.forEach(element => {
            element.src = '/images/visa.png'
        });
    }
    else if (value[0] == '5') {
        card_type.forEach(element => {
            element.src = 'images/mastercard.png'
        });
    }
    else if (value[0] == '3' && value[1] == '4' || value[0] == '3' && value[1] == '7') {
        card_type.forEach(element => {
            element.src = 'images/amex.png'
        });
    }
    else {
        card_type.forEach(element => {
            element.src = 'images/all3.png'

        });
        // document.querySelector('.card-number-box').innerText = '################'
    }
}

document.querySelector('.card-holder-input').oninput = () => {
    value = document.querySelector('.card-holder-input').value
    if (value != '') {
        document.querySelector('.card-holder-name').innerText = document.querySelector('.card-holder-input').value;
    }
    else {
        document.querySelector('.card-holder-name').innerText = 'full name'
    }
}

document.querySelector('.month-input').oninput = () => {
    document.querySelector('.exp-month').innerText = document.querySelector('.month-input').value;
}

document.querySelector('.year-input').oninput = () => {
    document.querySelector('.exp-year').innerText = document.querySelector('.year-input').value;
}

document.querySelector('.cvv-input').onmouseenter = () => {
    document.querySelector('.front').style.transform = 'perspective(1000px) rotateY(-180deg)';
    document.querySelector('.back').style.transform = 'perspective(1000px) rotateY(0deg)';
}

document.querySelector('.cvv-input').onmouseleave = () => {
    document.querySelector('.front').style.transform = 'perspective(1000px) rotateY(0deg)';
    document.querySelector('.back').style.transform = 'perspective(1000px) rotateY(180deg)';
}

document.querySelector('.cvv-input').oninput = () => {
    document.querySelector('.cvv-box').innerText = document.querySelector('.cvv-input').value;
}

var total = parseFloat(localStorage.getItem('total'))
document.getElementsByClassName('cart-total-price')[0].innerText = 'S$' + total
// var shipping = parseFloat(document.getElementsByClassName('shipping-fee')[0].innerText.replace('S$', ''))
if (total <= 75) {
    shipping = 15
    grandtotal = total + shipping
    grandtotal = (Math.round(grandtotal * 100) / 100).toFixed(2);
    document.getElementsByClassName('shipping-fee')[0].innerText = 'S$' + shipping
    document.getElementsByClassName('cart-grandtotal-price')[0].innerText = 'S$' + grandtotal
} else if (total <= 150) {
    shipping = 7.50
    grandtotal = total + shipping
    grandtotal = (Math.round(grandtotal * 100) / 100).toFixed(2);
    document.getElementsByClassName('shipping-fee')[0].innerText = 'S$' + shipping
    document.getElementsByClassName('cart-grandtotal-price')[0].innerText = 'S$' + grandtotal
} else {
    shipping = 0
    total = (Math.round(total * 100) / 100).toFixed(2);
    document.getElementsByClassName('shipping-fee')[0].innerText = 'FREE'
    document.getElementsByClassName('cart-grandtotal-price')[0].innerText = 'S$' + total
}


function checkoutcheck() {
    var fname = document.getElementById('fname').value
    var email = document.getElementById('email').value
    var phone = document.getElementById('phone').value
    var address = document.getElementById('address').value
    var unit_number = document.getElementById('unit_number').value
    var postalcode = document.getElementById('postalcode').value

    $.ajax({
        url: "/checkout",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({
            fname : fname,
            email : email,
            phone : phone,
            address : address,
            unit_number : unit_number,
            postal_code : postalcode
        })

    })
}