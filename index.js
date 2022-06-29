const express = require('express')
const app = express()
const http = require('http').Server(app)
const port = process.env.PORT || 3000
const thread = require('child_process')
const multer = require('multer')

const whitelist = [
	'image/png',
	'image/jpeg',
	'image/jpg',
	'image/webp'
]
const validTo = ['jpg','png','jpeg','webp']
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/images')
	},
	filename: function (req, file, cb) {
//		let extArray = file.mimetype.split("/");
//		let extension = extArray[extArray.length - 1];
		cb(null, file.originalname)
	//	cb(null, file.originalname + '-' + Date.now()+ '-.' +extension)
	},
})

const upload = multer({ storage: storage })

app.use('/downloads',express.static(__dirname+"/uploads/converted"))
app.use('/static',express.static(__dirname + "/static"))
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

app.get('/',async (req,res)=>{
	res.status(200).sendFile(__dirname+'/index.html')
})

app.post('/convert-image',upload.single('img'),async (req,res)=>{
	const fname = req.file.filename
	const quality = req.body.quality || 100
	const name = fname.substring(0,fname.lastIndexOf("."))
	const to = req.body.to
	if(!whitelist.includes(req.file.mimetype)||!validTo.includes(to)){
		res.json({result:false})
		return
	}
	await convert(`./uploads/images/${fname}`,to,quality,name,res)
//	res.sendFile(`./images/converted/${name}.${to}`)
//	console.log('done')
})

const convert =async (img,to,quality,name,res) => {

	let cmd = `convert ${img} -quality ${quality} -set filename:new "%t_converted" "./%[filename:new].${to}"
`
	const cnv = thread.spawn('convert', [
		`${img}`,
		"-quality",
		`${quality}`,
		"-set",
		"filename:new",
		"%t",
		`./uploads/converted/%[filename:new].${to}`
	])

	cnv.on('close', (code, signal) => {
		console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
		if(code==0){

	res.json({result:true,fname:name+'.'+to})
		}else{

	res.json({result:false})
		}
	});

	cnv.stdin.on('error', (e) => {
		console.log('FFmpeg STDIN Error', e);
	});

	cnv.stderr.on('data', (data) => {
		console.log('FFmpeg STDERR:', data.toString());
	});}


http.listen(port , (req,res) => {
	console.log(`listening on ${port}`)
})
