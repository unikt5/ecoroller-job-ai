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

console.log(cv)

const cvText =
cv.toLowerCase()

const skills=[

"english",
"german",
"customer service",
"sales",
"airport",
"vienna",
"logistics",
"teamwork",
"support",
"technical",
"python",
"javascript",
"ai",
"warehouse",
"operations",
"communication"

]

const found=

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
?found.join(", ")
:"No skills found")

if(found.length>0){

searchJobs(
found[0]
)

}

}
