async function readCV() {

try {

const file =
document.getElementById("cv").files[0];

if(!file){
alert("Choose CV first");
return;
}

document.getElementById("skills").innerHTML =
"Reading CV...";

let text="";

if(file.name.endsWith(".docx")){

document.getElementById("skills").innerHTML =
"Parsing DOCX...";

const arrayBuffer =
await file.arrayBuffer();

const result =
await mammoth.extractRawText({
arrayBuffer: arrayBuffer
});

text = result.value;

}

else if(file.name.endsWith(".txt")){

text = await file.text();

}

else{

alert("Only DOCX or TXT supported");
return;

}

console.log(text);

extractSkills(text);

}

catch(error){

console.log(error);

document.getElementById("skills").innerHTML =
"ERROR: " + error.message;

}

}



function extractSkills(cv){

const cvText = cv.toLowerCase();

const skills=[

"english",
"german",
"customer",
"airport",
"sales",
"logistics",
"warehouse",
"support",
"teamwork",
"operations",
"vienna"

];

const found = skills.filter(skill =>
cvText.includes(skill)
);

document.getElementById("skills").innerHTML =
"Detected: " +
(found.length ?
found.join(", ")
:
"No skills found");

searchJobs(found);

}



function searchJobs(foundSkills){

const jobs=[

{
title:"Customer Service Agent",
company:"Vienna Airport",
link:"https://www.viennaairport.com"
},

{
title:"Airport Operations Assistant",
company:"Vienna Airport",
link:"https://www.viennaairport.com"
},

{
title:"Warehouse Worker",
company:"Logistics Austria",
link:"https://www.google.com/search?q=warehouse+jobs+vienna"
},

{
title:"German Customer Support",
company:"Support Europe",
link:"https://www.google.com/search?q=customer+support+vienna"
},

{
title:"Sales Assistant",
company:"Retail Austria",
link:"https://www.google.com/search?q=sales+jobs+vienna"
}

];

showJobs(
jobs,
foundSkills
);

}



function showJobs(jobs,skills){

let html="";

jobs.forEach(job=>{

let score=0;

skills.forEach(skill=>{

if(
job.title.toLowerCase()
.includes(skill)
){

score+=20;

}

});

if(score>0){

html += `

<div class='result'>

<h3>${job.title}</h3>

<p>${job.company}</p>

<p>Match Score: ${score}%</p>

<a href="${job.link}"
target="_blank">

Apply

</a>

</div>

`;

}

});

if(html===""){

html="No matching jobs";

}

document.getElementById("results")
.innerHTML=html;

}
