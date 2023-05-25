const url = "http://localhost:8080";

// function that fetches a URL, and converts it to json.
async function fetchAny(url) {
    console.log(url);
    return await fetch(url).then((response) => response.json());
}
// Dette er en metode til at skabe et request object, som bruges af de andre metoder

function createRequest(method, objekt) {
    const request = {
        method: method,
        headers: {
            "content-type": "application/json"
        }
    }
    if (objekt !== null) {
        request.body = JSON.stringify(objekt) // Dvs hvis vi giver et objekt med i vores request (fx ved en put eller post), så bliver request body'en sat til at indeholde objektet.
        // Hvis ikke så bliver body ikke sat (til fx delete eller get)
    }
    return request
}

async function fetchAnything(url, fetchMethod, objektToFetch){
    const request = createRequest(fetchMethod, objektToFetch)
    const response = await fetch(url, request)
    const responseData = await response.json()

    if(!responseData.ok) {
        throw new Error(responseData.message)
    }
    return responseData
}



// Den tager data og mapper det ind i en tabel.
function showAllCyclists(data) {
    // map er en function, der gør at man kan manipulere en liste, manipulere den og giver dig en ny liste.
    const tableRowArray = data.map(cyclist => `
    <tr>
        <td>${cyclist.id}</td>
        <td>${cyclist.age}</td>
        <td>${cyclist.name}</td>
        <td>${cyclist.samletTid}</td>
        <td>${cyclist.bjergpoint}</td>
        <td>${cyclist.spurtpoint}</td>
        <td>${cyclist.team.name}</td>
        <td><button class="btn btn-primary" id="${cyclist.id}-deleteCyclist">Delete</button></td>
    </tr>
    `)
    // Vi laver en knap, med et unikt id, vi sætter til at være det samme som cyclistens id + "-deleteCyclist", dvs "1-deleteCyclist" fx.

    console.log(tableRowArray)
    // Vi fjerne lige kommaerne bag hver af værdierne der er i vores json. Fx bag navn står der "Børge, "
    // ser sådan her ud i console log: '\n    <tr>\n        <td>1</td>\n        <td>24</td>\n …
    // join metoden laver et array om til en string, som vi så injecter ind i vores table med innerHTML.

    const tableRowsStringUdenKomma = tableRowArray.join("\n");
    console.log(tableRowsStringUdenKomma)
    /*
    efter vi har lavet den til en String:
    <tr>
        <td>1</td>
        <td>24</td>
        <td>Lars</td>
        <td>3544</td>
        <td>12</td>
        <td>32</td>
        <td>Team Easy On</td>
    </tr>
    */

    // join metoden fjerner alt mellem 2 strings og joiner dem.
    document.querySelector("#tableBodyOfCyclists").innerHTML = tableRowsStringUdenKomma;
}

async function getAllCyclists() {
    const cyclists = await fetchAny(url + "/cyclists");
    console.log(cyclists);
    // Vi kalder metoden der indsætter cyclister i vores tabel i HTML'en
    showAllCyclists(cyclists);
}

document.querySelector("#dropDownButton").addEventListener("click", dropDown)

function createCyclist() {
    const cyclistForm = document.querySelector("#modalFormCreateCyclist")
    const cyclistObjekt = preparePlainFormData(cyclistForm) // vi laver alt input fra formen om til et javascript objekt.
    cyclistObjekt.team = team // vi siger at cyclistObjekt også skal indeholde et team, og at værdien er team. Den laver en variabel hvis den ikke eksistere.

    // url + fetchmetode + objekt vi gerne vil fetche
    fetchAnything(url + "/cyclist", "POST", cyclistObjekt).then(cyclist => {
        console.log("Saved cyclist: ", cyclist) // hvis det lykkedes log'er vi cyclisten.
    }).catch(error => {
        console.error(error) // hvis det fejler log'er vi error.
    })

}

document.querySelector("#createCyclistModalBtn").addEventListener("click", createCyclist)

async function dropDown(){
    const dropDownMenu = document.querySelector("#dropDownMenu");
    dropDownMenu.innerHTML=''; // vi sletter lige alt i listen først
    try{
        const teams = await fetchAny(url + "/teams");
        console.log(teams)
        teams.forEach(team => {
            const dropDownListElement = document.createElement("li");
            dropDownListElement.team = team // Vi laver et team for dropDownListElement og sætter det til at være == team fra vores fetch kald
            dropDownListElement.className ="dropdown-item"
            dropDownListElement.textContent = team.name
            dropDownMenu.appendChild(dropDownListElement)
            dropDownListElement.addEventListener("click", teamPicker)
        })
    }
    catch (error){
        console.error(error);
    }
}


// Når du trykker på et element i dropdown menuen, dvs vælger et team, så sker det der er i den her metode
function teamPicker(event) {
    const listeElement = event.target //elementet er li elementet, og inde i listen er der et team.
    console.log(listeElement.team)
    const dropDownButton = document.querySelector("#dropDownButton")
    dropDownButton.textContent = listeElement.team.name // Vi sætter dropDownMenuens text til at være vores valg af team.
    // vi gemmer vores valgte team i vores team constant ude for metoden.
    team = listeElement.team

}

let team = null;


// Denne metode laver et form element om til et javascript objekt vi kalder plainFormData.
function preparePlainFormData(form) {
    console.log("Received the Form:", form)
    const formData = new FormData(form)  // indbygget metode, behøves ikke forstås.
    console.log("Made the form in to FormData:", formData)
    const plainFormData = Object.fromEntries(formData.entries())
    console.log("Changes and returns the FormData as PlainFormData:", plainFormData)
    return plainFormData
}

async function deleteCyclistButtonEvent(event) {
    // Vi sender en event, som er any "click" på hjemmesiden.
    // Target er det vi klikker på.
    const target = event.target;
    // Vores console.log af const target, bliver så den knap vi klikker på. <button class="btn btn-primary" id="1-deleteCyclist">Delete</button>
    // Dvs target er vores delete knap, hvis vi trykker på den.
    console.log(target)
    if (!target.classList.contains("btn"))
        // Vi siger så at hvis target ikke indeholder "btn" i class tag, så gør vi ikke noget.
        return;
    else {
        // Ellers tager vi knappens id, finder "-deleteCyclist" delen af id'et og sletter.
        // Vi har givet hver knap et id der hedder "id + -deleteCylist", hvor id er det samme id som hver cyclist har.
        // Dvs for at få fat i cyclistens id som vi kan lave et fetch delete kald på til vores backend, så fjerner vi "-deleteCyclist" fra knapnavnet.
        const id = target.id.replace("-deleteCyclist", "");
        console.log(id);
        deleteCyclistById(id);
        // Vi refresher vores tabel
        window.location.reload();
    }
}

/*
function deleteCyclistById(id) {
    // Vi laver et fetch kald, med vores id, og specifier metoden til at være DELETE
    fetch(url + "/cyclist/" + id, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                // Vi laver vores response om til json.
                const responseAsJson = response.json()
                // Vi tager så dataen i den json, og console logger vores deleted cyclist og statuscoden, og returner det.
                const responseJsonData = responseAsJson.then(data => {
                    console.log("Deleted cyclist:", data);
                    console.log("Status code:", response.status);
                    //console.log("Status:", response.statusText);
                })
                return responseJsonData
                    .catch(error => {
                        console.log("An error occured: " + error)
                    });
            }
        })
}
*/


//Samme metode bare kortere fra chatGPT:
function deleteCyclistById(id) {
    // Vi laver et fetch kald, med vores id, og specifier metoden til at være DELETE
    fetch(url + "/cyclist/" + id, {
        method: 'DELETE',
    })
        // Her siger vi at responset vi får fra vores backend
        // (hvor vi jo har lavet et responseEntity der returner det vi sletter og statuskoden)
        // det printer vi. Vi håndtere ligesom svaret fra vores backend server.
        .then(response => {
            if (response.ok) {
                // Vi laver vores response om til json.
                // Vi tager så dataen i den json (.then(data => {...
                // og console logger vores deleted cyclist og statuscoden, og returner det.
                return response.json().then(data => {
                    console.log("Deleted cyclist:", data);
                    console.log("Status code:", response.status);
                });
            } else {
                throw new Error("HTTP status code: " + response.status);
            }
        })
        .catch(error => {
            console.log("An error occurred:", error);
        });
}


document.querySelector("#tableBodyOfCyclists").addEventListener("click", deleteCyclistButtonEvent);

getAllCyclists();


