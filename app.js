async function readCV(){

let file=
document.getElementById(
"cv"
).files[0]

if(!file)return

let text=
await file.text()

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
"forklift"

]

const found=

skills.filter(skill=>

cv.toLowerCase()
.includes(skill)

)

document
.getElementById(
"skills"
)
.innerHTML=

"Detected: "
+found.join(",")

searchJobs(
found[0]
)

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
.includes(skill)

)

.slice(0,10)

.forEach(job=>{

html+=`

<div class='result'>

<h3>${job.title}</h3>

<p>${job.company_name}</p>

<a target='_blank'
href='${job.url}'>

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
