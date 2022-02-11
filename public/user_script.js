
function test_click(){
	client['a'] = 500;
	client['b'] = 600;
	//alert('w');
	update_code();
}

function test_click2(){
	client['a'] = 600;
	client['b'] = 500;
	//alert('w');
	store_script();
}


var plate = document.getElementById("modules_plate");


var button1 = document.createElement("div");
plate.appendChild(button1);
var button2 = document.createElement("div");
plate.appendChild(button2);
button1.innerHTML = "<div style='background-color: red; width: 80px; height: 80px; position: absolute; top: 200px; right: 200px;' onclick='test_click()'>TEST 1</div>";
button2.innerHTML = "<div style='background-color: green; width: 80px; height: 80px; position: absolute; top: 200px; right: 300px;' onclick='test_click2()'>TEST 2</div>";

//attack_button.addEventListener("click", test_click, false);


//alert('really works!');