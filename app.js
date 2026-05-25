async function readCV(){

try{

let file =
document
.getElementById("cv")
.files[0]

if(!file){

alert("Choose file first")
return

}

document
.getElementById("skills")
.innerHTML=
"Reading CV..."


let text=""

if(file.name.endsWith(".docx")){

document
.getElementById("skills")
.innerHTML=
"Parsing DOCX..."

const arrayBuffer=
await file.arrayBuffer()

const result=
await mammoth.extractRawText({
arrayBuffer:arrayBuffer
})

text=result.value

}

else if(
file.name.endsWith(".txt")
){

text=
await file.text()

}

else{

alert(
"Only .docx or .txt supported"
)

return

}

console.log(
"EXTRACTED:"
)

console.log(
text
)

extractSkills(text)

}

catch(error){

console.log(error)

document
.getElementById(
"skills"
)
.innerHTML=

"ERROR: "
+error.message

}

}



function extractSkills(cv){

const skills=[

"english",
"german",
"warehouse",
"logistics",
"airport",
"customer",
"python",
"javascript"

]

const found=

skills.filter(skill=>

cv.toLowerCase()
.includes(
skill.toLowerCase()
)

)

document
.getElementById(
"skills"
)
.innerHTML=

"Detected: "
+
found.join(", ")

if(found.length===0){

document
.getElementById(
"results"
)
.innerHTML=

"No skills found"

return

}

searchJobs(
found[0]
)

}



async function searchJobs(skill){

document
.getElementById(
"results"
)
.innerHTML=

"Searching jobs..."


try{

const response=
await fetch(
"https://arbeitnow.com/api/job-board-api"
)

const data=
await response.json()

showJobs(
data.data,
skill
)

}

catch(error){

document
.getElementById(
"results"
)
.innerHTML=

"API ERROR"

console.log(error)

}

}



function showJobs(
jobs,
skill
){

let html=""

jobs
.filter(job=>

job.title
.toLowerCase()
.includes(
skill.toLowerCase()
)

)

.slice(0,5)

.forEach(job=>{

html+=`

<div class='result'>

<h3>${job.title}</h3>

<p>${job.company_name}</p>

<a
href="${job.url}"
target="_blank">

Apply

</a>

</div>

`

})

if(html===""){

html=
"No matching jobs"

}

document
.getElementById(
"results"
)
.innerHTML=
html

}
