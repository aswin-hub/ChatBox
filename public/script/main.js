var messages = [];
var users = [];
window.onload = () => {

    db('messages', 'get').then(res => {
        if (res != null) {
            messages = res
            messages.forEach(msg => UI(msg))
        }
    }).catch(err => {
        console.log('ERROR OCCURED: ' + err)
    })

    db('users', 'get').then(res => {
        if (res != null) {
            users = res
        }
    }).catch(err => {
        console.log('ERROR OCCURED: ' + err)
    })

    jQuery('#clear-button').on('click', clear);

}
const send = () => {
    const username = jQuery('#username-input').val()
    const message = jQuery('#message-input').val()
    if (username.trim() == "") {
        alert("Enter Valid Username")
        return false;
    }
    if (message.trim() == "") {
        alert("Message box should not be empty")
        return false;
    }
    store(username, message);
}
const store = (usr, msg) => {
    let isClient = true
    if (messages.length == 0) {
        users.push(usr)
        db('users', 'set', users).catch(err => {
            console.log('ERROR OCCURED: ' + err)
        })
        isClient = false
    } else {
        if (users.includes(usr)) {
            users.push(usr)
            db('users', 'set', users).catch(err => {
                console.log('ERROR OCCURED: ' + err)
            })
        }
        isClient = users.indexOf(usr) != 0;
    }
    const message = { message: msg, username: usr, isClient: isClient, time: new Date().getTime() }
    messages.push(message)
    db('messages', 'set', messages).then(res => {
        if (res == 'SUCCESS') {
            UI(message)
        }
    }).catch(err => {
        console.log('ERROR OCCURED: ' + err)
    })
}


const UI = (message) => {
    jQuery('#message-window').append(`<div class="mb-3">
        <div style="max-width:35rem;min-width:10rem;${message.isClient ? '' : 'margin-left:auto;'}" class="card ${message.isClient ? 'client' : 'bg-primary text-white text-right user'}">
            <div class="card-body p-0 px-2" style="">
                <p class="card-text m-0 my-1">${message.message}</p>
                <p class="m-0 my-1"><strong>${message.username}</strong>, <small>${duration(message.time)}</small></p>
            </div>
        </div>
    <div>`)
}

const duration = time => {
    const diffTimeInSeconds = ((new Date().getTime() - time) / 1000) + 1
    let prettyTime = diffTimeInSeconds < 60 ? (Math.ceil(diffTimeInSeconds) + ' s') : (diffTimeInSeconds / 60 < 60 ? (Math.ceil(diffTimeInSeconds / 60) + ' min') : (diffTimeInSeconds / 60 / 60 < 24 ? Math.ceil(diffTimeInSeconds / 60 / 60) + ' hours' : Math.ceil(diffTimeInSeconds / 60 / 60 / 24) + ' days'))
    prettyTime = diffTimeInSeconds < 5 ? 'just now' : prettyTime + ' ago'
    return prettyTime
}
const clear = () => {
    db('users', 'remove').then(res => {
        if (res == 'SUCCESS') {
            users = []
        }
    }).catch(err => {
        console.log('ERROR OCCURED: ' + err)
    })


    db('messages', 'remove').then(res => {
        if (res == 'SUCCESS') {
            messages = []
            jQuery('#message-window').html('')
        }
    }).catch(err => {
        console.log('ERROR OCCURED: ' + err)
    })
}


const db = (table, operation, value) => {
    return new Promise((resolve, reject) => {
        switch (operation) {
            case 'get': resolve(JSON.parse(localStorage.getItem(table))); break;
            case 'set': localStorage.setItem(table, JSON.stringify(value)); resolve('SUCCESS'); break;
            case 'remove': localStorage.removeItem(table); resolve('SUCCESS'); break;
            default: reject('ERROR');
        }
    })
}