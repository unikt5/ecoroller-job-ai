async function readCV() {

try {

const file =
document
.getElementById("cv")
.files[0]

if (!file){

alert("Choose CV first")
return

}

document
.getElementById("skills")
.innerHTML =
"Reading CV..."


let text = ""


if(file.name.endsWith(".docx")){

document
.getElementById("skills")
.innerHTML =
"Parsing DOCX..."

const arrayBuffer =
await file.arrayBuffer()

const result =
await mammoth.extractRawText({
arrayBuffer:arrayBuffer
})

text = result.value

}

else if(
file.name.endsWith(".txt")
){

text =
await file.text()

}

else{

alert(
"Only .docx and .txt currently supported"
)

return

}

console.log(
"RAW CV:"
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
.innerHTML =

"ERROR: "
+error.message

}

}



function extractSkills(cv){

const cvText =
cv.toLowerCase()


const skills=[

"english",
"german",
"customer",
"customer service",
"sales",
"airport",
"vienna",
"logistics",
"warehouse",
"operations",
"teamwork",
"support",
"python",
"javascript",
"technical",
"communication",
"ai"

]


const found =

skills.filter(skill=>

cvText.includes(
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

(found.length

? found.join(", ")

: "No skills found")


console.log(
"FOUND:"
)

console.log(
found
)


if(found.length>0){

searchJobs(
found[0]
)

}
else{

document
.getElementById(
"results"
)
.innerHTML=

"No matching skills"

}

}




async function searchJobs(skill){

document
.getElementById(
"results"
)
.innerHTML=

"Searching jobs..."


try{


const jobs=[

{
title:
"Customer Service Agent - Vienna",

company_name:
"Airport Services",

url:
"https://jobs.example.com/1"
},

{
title:
"Warehouse Assistant",

company_name:
"Logistics Austria",

url:
"https://jobs.example.com/2"
},

{
title:
"German Customer Support",

company_name:
"Tech Europe",

url:
"https://jobs.example.com/3"
},

{
title:
"Airport Operations Assistant",

company_name:
"Vienna Airport",

url:
"https://jobs.example.com/4"
},

{
title:
"Sales Assistant",

company_name:
"Retail Group",

url:
"https://jobs.example.com/5"
}

]


showJobs(
jobs,
skill
)

}

catch(error){

console.log(error)

document
.getElementById(
"results"
)
.innerHTML=

"Job search error"

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

.forEach(job=>{

html += `

<div class='result'>

<h3>
${job.title}
</h3>

<p>
${job.company_name}
</p>

<a
target="_blank"
href="${job.url}">

Apply

</a>

</div>

`

})


if(html===""){

html=

"No matching jobs found"

}


document
.getElementById(
"results"
)
.innerHTML=
html

}
