import Task from "./task";
import {createTaskContainer} from "./ui";

export let allTasks = [];


const createTask = (task, description, dueDate, list) => {
    let key = generateTaskKey();
    let newTask = new Task(task, description, dueDate, list, key);
    allTasks.push(newTask);
    createTaskContainer(task, description, dueDate, key);
    console.log(allTasks)
}

const generateTaskKey = () => {
    let key = 0
    if (allTasks.length > 0) {
        for (let i = 0; i < allTasks.length; i++) {
            if (allTasks[i].key == key) {
                key++;
            }
        }
    }
    return key
}


export const exampleTasks = () => {
    createTask("Dinner at Olive Garden", "Pick up sister on the way", "today", '');
    createTask("Make boiled denim", "Magnets and ghouls", "today", '');
    createTask("PHYS231 homework assignment", "Chapter 14, questions 1-13", "today", '');
    createTask("Exercise", "Workout out for 45 minutes", "today", '');
    createTask("Coffee with friend", "Starbucks", "today", '');
    createTask("Baking class", "Bring homemade pie", "today", '');
    
    

    createTask("Read Animal Farm", "Read two chapter", "tomorrow", '');
    createTask("Learn sign language", "Practice english alphabet", "tomorrow", '');
}


export default createTask;

