function msg_from_main(msg){
	console.log(msg);
	self.postMessage('got it');
}



self.addEventListener('message', msg_from_main);