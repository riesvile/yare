function play_background_music(){
	if (music_playing == 0){
		if (audio_context.state === 'suspended') {
		    audio_context.resume();
		}
		
		music_playing = 1;
		audio_el.play().catch(function(error) {
		    music_playing = 0;
		});
		
		console.log('sdfosifj oifsdjg oi jgiodfj giodfj gij dfigj diofjg iodfj igoj dfiogj diofgj iodfgj ioj');
	}
	
}

setTimeout(function(){ au_enemy_incoming.play() }, 5000);


var music_playing = 0;

const Audio_context = window.AudioContext || window.webkitAudioContext;
const audio_context = new Audio_context();

const audio_el = document.getElementById('audio_test');
const au_enemy_incoming = document.getElementById('au_enemy_incoming');
const track = audio_context.createMediaElementSource(audio_el);
const track2 = audio_context.createMediaElementSource(au_enemy_incoming);

track.connect(audio_context.destination);
track2.connect(audio_context.destination);


const playButton = document.querySelector('button');

play_background_music();


playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audio_context.state === 'suspended') {
        audio_context.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audio_el.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audio_el.pause();
        this.dataset.playing = 'false';
    }

}, false);

document.body.addEventListener('click', play_background_music, false); 

audio_el.addEventListener('ended', () => {
    playButton.dataset.playing = 'false';
}, false);