const url = "http://localhost:8080";

// function that fetches a URL, and converts it to json.
async function fetchAny(url) {
    console.log(url);
    return await fetch(url).then((response) => response.json());
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
        //window.location.reload();
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


