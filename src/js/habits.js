

// TODO: timer habits, such as: study russian for 2 hours, workout for 4 hours


const fs = require('fs');


const MONDAY 		= 0;
const TUESDAY		= 1;
const WEDNESDAY = 2;
const THURSDAY 	= 3;
const FRIDAY 		= 4;
const SUNDAY 		= 5;
const ALL				= 6;

const HABIT_TYPE_GOOD 	= 0;
const HABIT_TYPE_BAD 		= 1;

class Habit {
	constructor(type, name, times, schedule, index=0) {
		this.type = type;
		this.name = name;
		this.index = index;
		this.times = times;
		this.schedule = schedule;
	}
}

let habits = new Map();
let lastItem = undefined;


const createHabitDocument = (name, index, times) => {
	let div0 = document.createElement("div");
	div0.className = "habit";
	let div1 = document.createElement("div");
	div1.className = "info";
	let span0 = document.createElement("span");
	span0.id = "title";
	span0.innerHTML = name;
	let span1 = document.createElement("span");
	span1.id = "counter";
	span1.innerHTML = index + " / " + times;

	let div2 = document.createElement("div");
	div2.className = "progress-container";
	let div3 = document.createElement("div");
	div3.className = "progress-bar";
	div3.id = "progressBar";
	div3.style.width = ((index / times) * 100) + "%";

	let div4 = document.createElement("div");
	div4.className = "buttons";
	
	let button0 = document.createElement("button");
	button0.innerHTML = "✓";
	button0.id = "habit-button-checkmark";
	button0.dataset.index = index;
	button0.onclick = habitCheck;

	let button1 = document.createElement("button");
	button1.innerHTML = "-";
	button1.onclick = habitUncheck;

	let button2 = document.createElement("button");
	button2.innerHTML = "✗";
	button2.id = "habit-button-edit";
	button2.onclick = habitEdit;

	// title/counter to info
	div1.append(span0);
	div1.append(span1);

	// progress-bar to progress-container
	div2.append(div3);

	// buttons to buttons
	div4.append(button0);
	div4.append(button1);
	div4.append(button2);

	div0.append(div1);
	div0.append(div2);
	div0.append(div4);

	if (index == times) {
		document.getElementById("habit-list-done").append(div0);
	} else {
		document.getElementById("habit-list-todo").append(div0);
	}
}

const update = () => {
	console.log('updated');
	const div = document.getElementById("habit-list-todo");
	while (div.firstChild) {
		div.removeChild(div.firstChild);
	}

	for (const [key, value] of habits) {
		createHabitDocument(value.name, value.index, value.times);
	}
}

// checkmark
const habitCheck = (e) => {
	var div0 = e.target.closest(".habit");
	var title0 = div0.querySelector("#title").innerHTML;

	let currentHabit = habits.get(title0);
	currentHabit.index += 1 * (currentHabit.index < currentHabit.times);

	update();
	saveHabits();
}

const habitUncheck = (e) => {
	var div0 = e.target.closest(".habit");
	var title0 = div0.querySelector("#title").innerHTML;

	let currentHabit = habits.get(title0);

	if (currentHabit.index == currentHabit.times) {
		// delete itself from done 

		div0.remove();
	}

	currentHabit.index -= 1 * (currentHabit.index > 0);

	update();
	saveHabits();
}


// edit
const habitEdit = (e) => {
	var edit = document.getElementById("panel-edit-habit");

	edit.classList.toggle("panel-edit-habit-active");
	edit.classList.toggle("panel-edit-habit-inactive");
	lastItem = e;
}

document.getElementById("edit-cancel-habit-button").onclick = habitEdit;

document.getElementById("edit-habit-button").onclick = () => {
	if (lastItem == undefined) return;

	const div = lastItem.target.closest(".habit");
	var title = div.querySelector("#title").innerHTML;

	let currentHabit = habits.get(title);
	let newTitle = document.getElementById("panel-edit-habit-title").value;
	let newTimes = document.getElementById("panel-edit-habit-times").value;

	let lastIndex = currentHabit.index;

	habits.delete(title);
	add(HABIT_TYPE_GOOD, newTitle, newTimes, [ALL], lastIndex);
}


// delete
document.getElementById("edit-delete-habit-button").onclick = () => {
	if (lastItem == undefined) return;

	const div = lastItem.target.closest(".habit");
	var title = div.querySelector("#title").innerHTML;

	habits.delete(title);
	update();
	habitEdit();
	saveHabits();
}


// creating new habits
const add = (type, name, times, schedule, index=0) => {
	let h = new Habit(type, name, times, schedule);
	h.index = index;
	habits.set(name, h);
	update();
	saveHabits();
}


// Confirmation add habit button
document.getElementById("add-habit-button").onclick = () => {
	var title = document.getElementById("panel-add-habit-title").value;
	var times = document.getElementById("panel-add-habit-times").value;

	add(HABIT_TYPE_GOOD, title, times, [ALL]);


	// close
	panelAddHabit.classList.toggle("panel-add-habit-active");
	panelAddHabit.classList.toggle("panel-add-habit-inactive");
}


document.getElementById("cancel-habit-button").onclick = () => {
	panelAddHabit.classList.toggle("panel-add-habit-active");
	panelAddHabit.classList.toggle("panel-add-habit-inactive");
}


const panelAddHabit = document.getElementById("panel-add-habit");

document.getElementById("action-add-habit").onclick = () => {
	panelAddHabit.classList.toggle("panel-add-habit-active");
	panelAddHabit.classList.toggle("panel-add-habit-inactive");

	actionsOptions.classList.toggle("actions-options-active");
	actionsOptions.classList.toggle("actions-options-inactive");
}

saveHabits = () => {
	const array = [...habits.entries()].map(([key, habit]) => [key, { ...habit }]);
	fs.writeFileSync('habits.json', JSON.stringify(array, null, 2));
	console.log("saved habits");
}

loadHabits = () => {
	if (!fs.existsSync("habits.json")) return;

	const fileData = fs.readFileSync('habits.json', 'utf-8');
	const loadedArray = JSON.parse(fileData);

	const loadedMap = new Map(
		loadedArray.map(([key, data]) => [
			key,
			new Habit(
				data.type,
				data.name,
				data.times,
				data.schedule,
				data.index
			)
		])
	);

	habits = loadedMap;

	update();
}

loadHabits();



