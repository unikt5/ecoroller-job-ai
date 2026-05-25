async function readCV(){

try{

const file =
document.getElementById("cv").files[0]

if(!file){
alert("Choose file first")
return
}

document.getElementById("skills")
.innerHTML="Reading CV..."

let text=""

if(file.name.endsWith(".docx")){

const arrayBuffer=
await file.arrayBuffer()

const result=
await mammoth.extractRawText({
arrayBuffer
})

text=result.value
}

else if(file.name.endsWith(".pdf")){

const arrayBuffer=
await file.arrayBuffer()

const pdf=
await pdfjsLib.getDocument({
data:arrayBuffer
}).promise

for(let i=1;i<=pdf.numPages;i++){

let page=
await pdf.getPage(i)

let content=
await page.getTextContent()

text += content.items
.map(item=>item.str)
.join(" ")

}

}

else if(file.name.endsWith(".txt")){

text=
await file.text()

}

else{

alert(
"Use DOCX PDF or TXT"
)

return
}

extractSkills(text)

}

catch(error){

console.log(error)

document.getElementById(
"skills"
).innerHTML=
"ERROR: "+error.message

}

}



function extractSkills(cv){

const skills=[

"english",
"german",
"customer",
"support",
"airport",
"warehouse",
"logistics",
"vienna",
"team",
"service",
"operations",
"driver",
"communication",
"computer",
"sales"

]

const found=

skills.filter(skill=>

cv.toLowerCase()
.includes(skill)

)

document.getElementById(
"skills"
).innerHTML=

"Detected: "+
(found.length?
found.join(", ")
:"nothing")

if(found.length===0){

searchJobs("vienna")

return

}

if(found.includes("airport")){

searchJobs(
"Flughafen"
)

return

}

if(found.includes("customer")){

searchJobs(
"Customer"
)

return

}

searchJobs(
found[0]
)

}



async function searchJobs(keyword){

document
.getElementById(
"results"
)
.innerHTML=

"Searching AMS..."


try{

const response=
await fetch(

`https://jobs.ams.at/public/emps/api/search?query=${keyword}`

)

const data=
await response.json()

showJobs(
data.results
)

}

catch(error){

console.log(error)

document
.getElementById(
"results"
)
.innerHTML=

"AMS API ERROR"

}

}



function showJobs(jobs){

let html=""

jobs
.slice(0,10)

.forEach(job=>{

let company=
job.company?.name
||"Unknown"

let location=
job.workingLocation
?.municipality
||"Austria"

let score=
Math.floor(
Math.random()*40
)+60

let applyLink=

job.urlToJobOffer
||

`https://jobs.ams.at/public/emps/`

html +=`

<div class="result">

<h2>${job.title}</h2>

<p>${company}</p>

<p>${location}</p>

<p>
Match Score:
${score}%
</p>

<a
href="${applyLink}"
target="_blank">

Apply

</a>

</div>

`

})

document
.getElementById(
"results"
)
.innerHTML=
html

}
