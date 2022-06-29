const dlBtn = document.getElementById('dlBtn')
const updateName=(e)=>{
	alert('gjcgcjg')
	document.getElementById('fname').innerText=e.files[0].name
}
const submit =async (e) => {
	e.innerText="converting..."
	const to = document.getElementById("to")
	const img = document.getElementById("img").files[0]

	var data = new FormData()
	data.append('img', img)
	data.append('to',to.value)

	fetch('/convert-image',{
		method:"post",
		headers: {
			'Accept': 'application/json, text/plain, */*',
		},

		body:data
	})
	.then(res=>res.json())
		.then((res)=>{
			if(res.result){
				e.innerText="Convert"
				e.style.display='none'
				dlBtn.style.display='initial'
				dlBtn.onclick=()=>{
					const a = document.createElement("a")
					a.setAttribute('Download',`${res.fname}`)
					a.href=`/downloads/${res.fname}`,"_blank"
					a.click()
				}
			}else{
				alert('error')
			}
		})
}
