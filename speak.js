function speaked(){
    document.getElementById("ok").setAttribute('style',"animation:sp 2s linear infinite;")
    let msg = document.getElementById("Text").value;
    let speech = new SpeechSynthesisUtterance();
    
    speech.lang = "en";
    speech.text = msg;
    speech.volume = document.getElementById("vol").value;
    speech.rate = document.getElementById("rate").value;
    speech.pitch = document.getElementById("pit").value;          
    
    window.speechSynthesis.speak(speech);
    }

    