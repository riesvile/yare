
function test_click(){
	client_object['attack'] = 'working';
}


var plate = document.getElementById("modules_plate");


var attack_button = document.createElement("div");
plate.appendChild(attack_button);
attack_button.innerHTML = "<div style='background-color: red; width: 80px; height: 80px; position: absolute; top: 200px; right: 200px;' onclick='test_click'>TEST</div>";

//attack_button.addEventListener("click", test_click, false);


//alert('really works!');