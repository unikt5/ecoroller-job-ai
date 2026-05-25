async function readCV(){

let file =
document
.getElementById("cv")
.files[0]

if(!file) return

let text=""

if(file.name.endsWith(".docx")){

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
"Only DOCX or TXT for now"
)

return

}

console.log(text)

extractSkills(text)

}


function extractSkills(cv){

const skills=[

"warehouse",
"logistics",
"english",
"german",
"python",
"javascript",
"forklift",
"customer service",
"sales",
"airport"

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

if(found.length>0){

searchJobs(
found[0]
)

}

}


async function searchJobs(skill){

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

.slice(0,10)

.forEach(job=>{

html+=`

<div class='result'>

<h3>
${job.title}
</h3>

<p>
${job.company_name}
</p>

<a
href="${job.url}"
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
.innerHTML=html

}
