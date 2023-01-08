var encrypted_access_token = "U2FsdGVkX185pfeCzffzl2JzP90j2+BxIpylx76e/xzWChGAxb+PLCQC435yz6y3POyobBOSTBluy/GZMQ2I8MsLOY9zmuTELRM/2QxCrzmf2f3BHNmUM2y56/O/Zz9hVwhMI3M5pO844rAX5YkdA0XXxm/U9sykpZZiH3w4zwP0z5zwREkZeEXc2TW3uHpgiSAEiF2ZbytYGWMomuM9a67VmRAE/ifXx3zv6aS/QVHasWDE6G3iYOTGNTxgeylDIHb74sdzszhsR5o8gFy3jw==";

var pageLoaded = false;
window.onload = function() {
    pageLoaded = true;
    callbackFunc();
}
callbackFunc = ()=>{};

function pageLoad() {
    if (pageLoaded) return;
    return new Promise(function(resolve) {
        callbackFunc = function() {
            resolve();
        }
    });
}

function passwordSubmit() {
    passwordInput.removeAttribute("hidden");
    password.value = "";
    password.focus();
    return new Promise(function(resolve) {
        password.onchange = function() {
            passwordInput.setAttribute("hidden", true);
            resolve(password.value);
        }
    })
}

function numberSubmit() {
    numberInput.removeAttribute("hidden");
    lightNumber.value = "";
    lightNumber.focus();
    return new Promise(function(resolve) {
        lightNumber.onchange = function() {
            numberInput.setAttribute("hidden", true);
            resolve(lightNumber.value);
        }
    })
}

var pin = "";
var access_token = "";
async function main() {
    await pageLoad();
    if (localStorage.getItem("dpin") == null) {
        pin = await passwordSubmit();
        localStorage.setItem("dpin", pin);
    } else {
        pin = localStorage.getItem("dpin");
    }
    access_token = CryptoJS.AES.decrypt(encrypted_access_token, pin).toString(CryptoJS.enc.Utf8);
    var lightNumber = +(await numberSubmit());
    while(true) {
        await syncLight(lightNumber);
    }
}
main();

function retrieveLight(entity_id) {
    return new Promise(function(resolve) {
        var url = `https://aidanjacobson.duckdns.org:8123/api/states/${entity_id}`;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            resolve(JSON.parse(xhr.responseText).attributes.rgb_color);
        }
        xhr.send();
    })
}

var color = [0, 0, 0];
async function syncLight(light_number) {
    var entity_id = `light.virtual_light_${light_number}`;
    color = await retrieveLight(entity_id);
    if (color) {
        [r, g, b] = color;
    } else {
        [r, g, b] = [0, 0, 0];
    }
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}