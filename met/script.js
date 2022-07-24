
function createNode(element) {
    return document.createElement(element);
}
  
  function append(parent, element) {
    return parent.appendChild(element);
}

function fetchObjects(url) {
    return fetch(url);
  }

function fetchById(objectId){
    return fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
    );
}

function fetchDepartments(){
    return fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/departments`
    );
}

var defaultUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=sunflowers`;
var isHighlightUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true&q=hasImages=true`;
var departmentUrl =``;
var modal = document.querySelector("#modal");
var modalContent = document.querySelector(".modal-content");
var departments = [];

function addArtworksToGallery(response)
{
    let img = createNode("img");
    let div = createNode("div");
    div.className = "gallery-image";
    img.src = response.primaryImage;
    let title = createNode("h2");
    let medium = createNode("p");
    let artistDisplayName = createNode("p");
    let artistDisplayBio = createNode("p");
    title.innerHTML = response.title;
    medium.innerHTML = response.medium;
    artistDisplayName.innerHTML = response.artistDisplayName;
    artistDisplayBio.innerHTML = response.artistDisplayBio;
    div.addEventListener("click", event => {
        modal.style.display = "block";
        let modalImg = createNode("img");
        let modalTitle = createNode("h2");
        let modalMedium = createNode("p");
        let modalArtistDisplayName = createNode("p");
        let modalArtistDisplayBio = createNode("p");
        let target = event.target.closest("div");
        modalImg.src = target.children[0].src;
        modalTitle.innerHTML = target.children[1].innerHTML;
        modalMedium.innerHTML = target.children[2].innerHTML;
        modalArtistDisplayName.innerHTML = target.children[3].innerHTML;
        modalArtistDisplayBio.innerHTML = target.children[4].innerHTML;

        append(modalContent, modalImg);
        append(modalContent, modalTitle);
        append(modalContent, modalMedium);
        append(modalContent, modalArtistDisplayName);
        append(modalContent, modalArtistDisplayBio);

    });
    append(div, img);
    append(div, title);
    append(div, medium);
    append(div, artistDisplayName);
    append(div, artistDisplayBio);
    append(document.querySelector("#gallery"), div);
}

function handleFetchArtworks(url) {
    document.querySelector("#gallery").innerHTML ='';
    fetchObjects(url)
        .then((response) =>{
            if(!response.ok){
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(response => {
            console.log(response);
            var imgCounter = 0;
            for(let i = 0; i < response.total ; i++){
                fetchById(response.objectIDs[i])
                //response by ID
                .then(response => {
                    if(!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.json();
                })
                //do stuff
                .then(response =>{
                    if(response.primaryImage !=="" && response.title !== "" 
                    && response.medium !== ""&& response.artistDisplayName !== "" 
                    && response.artistDisplayBio != "" && imgCounter !==10){

                        addArtworksToGallery(response);
                        imgCounter++;
                    }
                    
                })
                .catch(error => {
                    console.log(error);
                })
            }
           
        })
        .catch(error => {
            console.log(error);
        });
}

window.onload = handleFetchArtworks(defaultUrl);
document.querySelector("#checkbox").addEventListener("change", function(event){
    if(document.querySelector("#checkbox").checked == true){
        handleFetchArtworks(isHighlightUrl);
    }

    else if(document.querySelector("#checkbox").checked == false){
        if(departmentUrl == ``)
        handleFetchArtworks(defaultUrl);
        else if(departmentUrl !== ``)
        {
            handleFetchArtworks(departmentUrl);
            departmentUrl = ``;
        }
        

        // when is highlight is unchecked look for a checked department and load them again
    }
})

function displayDepartments(){
    fetchDepartments()
    .then(response =>{
        if(!response.ok){
            throw new Error(response.statusText);
        }
        return response.json();

    })
    .then(response =>{
        for(let i = 0; i < response.departments.length; i++){
            departments.push(response.departments[i]);
            let label = createNode("label");
            label.className = "isHighlight";
            let docuCheckBox = createNode("input");
            docuCheckBox.type="checkbox";
            let span = createNode("span");
            span.className = "checkmark";
            label.innerHTML = response.departments[i].displayName;
            
            label.addEventListener("change", event =>{
                console.log(event.target);
                let targetLabel = event.target.closest("label");
                console.log(targetLabel);
                let displayName = targetLabel.innerHTML.match(/^.*?(?=<)/g);
                let target = event.target.closest("input");
                console.log(displayName);
                if(event.target.checked == true){
                    var id=0;
                    departments.forEach(department =>{
                        if(displayName[0] == department.displayName){
                            id = department.departmentId;
                        }
                    })
                    console.log(id);
                    if(document.querySelector("#checkbox").checked == false){
                        let url = `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${id}`;
                        console.log(url);
                        console.log("Hi sir please wait a while since loading between departments takes forever (no highlights)");
                        handleFetchArtworks(url);
                    }
                    else if(document.querySelector("#checkbox").checked == true){
                        let url = `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${id}&isHighlight=true`;
                        departmentUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${id}`;
                        console.log(url);
                        console.log("Hi sir please wait a while since loading between departments takes forever (has highlights)");
                        handleFetchArtworks(url);
                    }
                }
                else if(event.target.checked == false){
                    document.querySelector("#gallery").innerHTML ='';
                    handleFetchArtworks(defaultUrl);
                    console.log("Hi sir please wait a while since loading between departments takes forever");
                    console.log("loading sunflowers");
                }
            })
            append(label, docuCheckBox);
            append(label, span);
            append(document.querySelector(".sidenav"),label);

           
        }
    })
    .catch(error => {
        console.log(error);
    });
}

window.onload = displayDepartments();
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    
    //console.log("outside modal clicked");
    if (event.target == modal) {
        document.querySelector('.modal-content').innerHTML = '';
        modal.style.display = "none";
    }
}