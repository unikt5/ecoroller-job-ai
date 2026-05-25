async function searchJobs(keyword){

document.getElementById(
"results"
).innerHTML=
"Searching AMS: "+keyword

try{

const url =
`https://jobs.ams.at/public/emps/api/search?query=${encodeURIComponent(keyword)}`

console.log(
"REQUEST URL:"
)

console.log(
url
)

const response=
await fetch(url)

console.log(
"STATUS:"
)

console.log(
response.status
)

const text=
await response.text()

console.log(
"RAW RESPONSE:"
)

console.log(
text)

const data=
JSON.parse(text)

showJobs(
data.results || []
)

}

catch(error){

console.log(
"FULL ERROR:"
)

console.log(
error
)

document.getElementById(
"results"
).innerHTML=

"AMS API ERROR: "+
error.message

}

}
