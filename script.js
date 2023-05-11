const container = document.querySelector(".container");
const dialog = document.querySelector("dialog");
const dropZone = document.querySelector(".drop-zone");
const codeWrapper = document.querySelector(".code-shower-wrapper")
const codeShower = codeWrapper.querySelector("div")
const codeWrapperResetBtn = document.querySelector(".container > button")
const code = document.querySelector("code")
const reviewBoxes = document.querySelectorAll(".review-box")
const message = document.querySelector(".message")

const approved = localStorage.getItem("approved");

if (!approved) {
  dialog.querySelector("button").addEventListener("click", (e) => {
    localStorage.setItem("approved", true);
    dialog.close();
  });
  dialog.showModal();
}

dropZone.addEventListener("dragover", () => dropZone.classList.add("drop-zone-hover"))
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drop-zone-hover"))

codeWrapperResetBtn.addEventListener("click", () => {
    code.innerText = "";
    codeShower.classList.remove("code-shower")
    message.innerText = ""
    reviewBoxes[0].querySelector("p").innerText = ""
    reviewBoxes[1].querySelector("ul").innerHTML = ""
    reviewBoxes[2].querySelector("p").innerText = ""

})

const constructCodeDiv = (text, review) => {
    codeShower.classList.add("code-shower")
    code.innerText = text;
    const {description, codeScore, suggestedChanges} = review;

    reviewBoxes[0].querySelector("p").innerText = description;
    reviewBoxes[2].querySelector("p").innerText = codeScore;

    const ul = reviewBoxes[1].querySelector("ul");
    ul.innerHTML = ""
    suggestedChanges.forEach(x => {
        const li = document.createElement("li")
        li.innerText = x;
        ul.appendChild(li)
    })

    message.innerText = "Nu har jag tänkt klart!"
}

const setLoadingState = (state, errorMsg) => {
    dropZone.style.display = state ? "none" : "flex"

    if(state)
    {
        message.innerText = "Tänker lite, vänta...."
    }
    else if(!state && errorMsg)
    {
        message.innerText = errorMsg
    }

}

const sendToBackend = async (text) => {
    try{
        if(!text || text.length > 10000)
        {
          throw "Filen får inte vara tom eller över 10000 tecken"
        }
        setLoadingState(true);
        const response = await fetch("https://agreat-code-reviewer.azurewebsites.net/review", {
            method: "POST",
            body: JSON.stringify({"code": text}),
            headers:{
                "content-type":"application/json"
            }
        })
        
        if(response.ok)
        {
            const review = await response.json();
            console.log(review)
            constructCodeDiv(text, review)
        }
        else {

            throw await error.text()
        }
    }
    catch(error){
        setLoadingState(false, error);
        return
    }

}

const handleFile = (item) => {
  if (item.kind === "file") {
    const file = item.getAsFile();
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        sendToBackend(reader.result)
    });
    reader.readAsText(file);
  }
};

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drop-zone-hover")
  if (e.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...e.dataTransfer.items].forEach((item, i) => handleFile(item));
  }
});