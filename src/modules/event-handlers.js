import { createTask, updateLocalData } from "./create-task";
import { createTaskView, createTasksContainer, clearContent, updateCounter, updateCreateListButton, decreaseFontSize, createCalendarMonth} from "./ui";
import { allTasks, allLists } from "./create-task";
import checkTaskAnimation, { removeSubGroup } from "./animations";
import { deleteTask, removeTaskView } from "./animations";
import { addMonths, format, getMonth, isBefore, isSameMonth, startOfMonth, startOfToday,startOfTomorrow, subMonths } from "date-fns";
import { makeCalendar, resetCalendar, selectedDate, setSelectedDate, stringToDate } from "./calendar";

const inputTaskName = document.querySelector('#inputTaskName');
const inputTaskDescription = document.querySelector('#inputTaskDescription');
const inputDueDate = document.querySelectorAll('.inputDueDate');
const inputCalendarContainer = document.querySelector('#inputCalendarContainer');
const inputCalendarOptions = document.querySelector('#inputCalendarOptions');
const listSelectionName = document.querySelector('#listSelectionName')
const calendarMonth = document.querySelector('#calendarMonth');
const dateSelection = document.querySelector('#dateSelection');
const formContainer = document.querySelector("#taskFormContainer");
const form = document.querySelector("#taskForm");
const navbar = document.querySelector('#navbar');
const contentContainer = document.querySelector("#contentContainer")
const sidebar = document.querySelector('#sidebar');
const sidebarShortcuts = document.querySelector('#sidebarShortcuts');
const sidebarLists = document.querySelector('#sidebarLists');

//CLICK EVENT LISTENERS
const navbarClick = () => {
    navbar.addEventListener('click', (e)=>{
        if (e.target.id == 'pageTitle') {
            navLogo();
        } else if (e.target.id == 'addButton') {
            formButtonClicked();
        } else if (e.target.className == 'searchResultItem') {
            navSearchResultClick(e);
        }
    })
}

const sideBarClick = () => {
    sidebar.addEventListener('click', (e)=>{
        if (e.target.className.includes('sidebarArrow')) {
            sidebarArrowClick(e);
        } else {
            sidebarTabClick(e);
        }
    })
}

const contentContainerClick = () => {
    contentContainer.addEventListener('click', (e)=>{
        if (e.target.className == "taskContainer" || e.target.className == "taskContainer completed") {
            taskSelection(e.target);
        } else if (e.target == document.querySelector('#contentContainer')) {
            removeTaskView();
        } else if (e.target.parentNode.className.includes('checkContainer') || e.target.parentNode.className.includes("taskViewCheckContainer")) {
            checkClick(e);
        } else if (e.target.parentNode.className == 'deleteContainer' || e.target.parentNode.className == 'deleteContainer completed') {
            deleteClick(e);
        }
    })
}

const formContainerClick = () => {
    formContainer.addEventListener('click', (e)=>{
        if (e.target.id == 'taskFormAddButton') {
            formAddButtonClicked();
        } else if (e.target.className == 'inputDueDate') {
            formDueDateClick(e);
        } else if (e.target.id == 'inputCalendar') {
            formCalendarButtonClick();
        } else if (e.target.className == 'calendarDay') {
            calendarDayClick(e);
        } else if (e.target.id == 'inputList') {
            formListClick();
        } else if (e.target.className == 'inputListItem') {
            formListOptionsClick(e);
        } else if (e.target.id == 'createListButton') {
            createListClick();
        } else if (e.target.id == 'forwardMonthIcon' || e.target.id == 'backMonthIcon') {
            calendarArrowClick(e);
        } else if (e.target.id == 'taskFormContainer') {
            formCancel();
        }
    })
}


//FORM
const formAddButtonClicked = () => {
    if (inputTaskName.value) {
        let dueDate;
        let list;
        inputDueDate.forEach((e) =>{
            if (e.className.includes('selected')) {
                if (e.id == 'inputToday') {
                    dueDate = startOfToday();
                } else if (e.id == 'inputTomorrow') {
                    dueDate = startOfTomorrow();
                }
            }         
        })
        if (dateSelection.innerText != 'Pick Date') {
            dueDate = stringToDate(dateSelection.innerText);
        }
        if (document.querySelector('#listSelectionName').innerText != 'Add to list') {
            list = listSelectionName.innerText;
        }
        createTask(inputTaskName.value, inputTaskDescription.value, dueDate, list);
        formCancel();
        updateCounter();
    }
}

const formDueDateClick = (e) => {
    inputDueDate.forEach(element => {
        element.classList.remove('selected');
    })
    inputCalendarContainer.classList.remove('selected');
    inputCalendarOptions.classList.remove('selected');
    dateSelection.innerText = 'Pick Date';
    e.target.classList.toggle('selected');
}

const formCalendarButtonClick = () => {
    if (!inputCalendarContainer.className.includes('selected')) {
        inputCalendarContainer.classList.toggle('selected');
    } else if (inputCalendarContainer.className.includes('selected') && dateSelection.innerText == 'Pick Date') {
        inputCalendarContainer.classList.remove('selected');
    }
    inputCalendarOptions.classList.toggle('selected');
}   

const calendarArrowClick = (e) => {
    if (e.target.id == 'forwardMonthIcon') {
        resetCalendar();
        setSelectedDate(addMonths(selectedDate, 1));
        createCalendarMonth(format(selectedDate, 'LLL'))
    } else { 
        if (isBefore(subMonths(selectedDate, 1), new Date()) && !isSameMonth(subMonths(selectedDate, 1), new Date())) {
            return
        } else {
            resetCalendar();
            setSelectedDate(subMonths(selectedDate, 1));
            createCalendarMonth(format(selectedDate, 'LLL'))
        }
    }
    makeCalendar()
}

const calendarDayClick = (e) => {
    const monthString = calendarMonth.innerText;
    const month = monthString.substring(0, monthString.length - 4);
    dateSelection.innerText = month + ' ' + e.target.innerText;
    inputDueDate.forEach(date => {
        date.classList.remove('selected');
    })
    inputCalendarOptions.classList.remove('selected')
}

const formListClick = () => {
    inputListContainer.classList.toggle('selected');
}

const formListOptionsClick = (e) => {
    const inputListItems = document.querySelectorAll('.inputListItem');
    inputListItems.forEach(element =>{
        element.classList.remove('selected');
    })
    e.target.classList.toggle('selected');
    listSelectionName.innerText = e.target.innerText;
    inputListContainer.classList.toggle('selected');
}

const formSearchInput = () => {
    const searchInput = document.querySelector('#inputListTextArea');
    searchInput.addEventListener('input', e => {
        const value = e.target.value.toLowerCase();
        const inputItems = e.target.parentNode.childNodes;
        inputItems.forEach(item=> {
            if (item.className == 'inputListItem' || item.className == 'inputListItem hidden') {
                const valueMatch = item.innerText.toLowerCase().includes(value);
                item.classList.toggle('hidden', !valueMatch);    
            }
        })

        const searchCheck = allLists.some(list => {
            return list.toLowerCase().includes(searchInput.value)
        })

        const createListButton = document.querySelector('#createListButton');
        if (searchCheck) {
            createListButton.classList.add('hidden')
        } else {
            updateCreateListButton(searchInput.value);
            createListButton.classList.remove('hidden')
        }
    })
}

const createListClick = () => {
    const listSelectionName = document.querySelector('#listSelectionName');
    const inputListTextArea = document.querySelector('#inputListTextArea');
    const inputListContainer = document.querySelector('#inputListContainer')
    listSelectionName.innerText = inputListTextArea.value;
    inputListContainer.classList.remove('selected')
}

const formCancel = () => {
    form.style.opacity = "0";
    formContainer.style.visibility = "hidden";
    form.style.transform = "scale(0)";
    inputTaskName.value = '';
    inputTaskDescription.value = '';
    inputDueDate.forEach(element => {
        element.classList.remove('selected')
    })
    inputDueDate[0].classList.toggle('selected');
    document.querySelector('#inputListContainer').classList.remove('selected')
    document.querySelector('#listSelectionName').innerText = 'Add to list'
    const inputListItems = document.querySelectorAll('.inputListItem');
    const searchInput = document.querySelector('#inputListTextArea');
    searchInput.value = '';

    inputCalendarContainer.classList.remove('selected');
    dateSelection.innerText = 'Pick Date';

    inputListItems.forEach(listItem=> {
        listItem.classList.remove('selected');
        listItem.classList.remove('hidden');
    })

    const createListButton = document.querySelector('#createListButton');
    if (!createListButton.className.includes('hidden')) {
        createListButton.classList.add('hidden')
    }

    resetCalendar();
    setSelectedDate(new Date());
    createCalendarMonth(format(new Date(), 'LLL'))
    makeCalendar();
}


//Navbar
const navLogo = () => {
    const sidebarHome = document.querySelector('#sidebarHome')
    shortcutToggle(sidebarHome)
    clearContent();
    setTimeout(() => createTasksContainer('home'), 350);
}

const NavSearchInput = () => {
    const navSearchBar = document.querySelector('#searchBar');
    const navSearchContainer = document.querySelector('#searchContainer')
    const searchResultsContainer = document.querySelector('#searchResultsContainer');
    navSearchBar.addEventListener('input', e => {
        const searchResultName = document.querySelectorAll('.searchResultName');
        const value = e.target.value.toLowerCase();
        searchResultName.forEach(name => {
                const valueMatch = name.innerText.toLowerCase().includes(value);
                name.parentNode.classList.toggle('hidden', !valueMatch);    

                if (name.innerText.toLowerCase().includes(value)) {
                    searchResultsContainer.classList.remove('hidden')
                } 
                if (value.length == 0) {
                    searchResultsContainer.classList.add('hidden')
                }
        })
    })
    navSearchBar.addEventListener('click', ()=>{
        navSearchContainer.classList.add('selected')
        navSearchBar.classList.add('selected')
    })
}

const navSearchResultClick = (e) => {
    const sidebarHome = document.querySelector('#sidebarHome')
    let taskContainer;

    if (document.querySelector('.tasksContainer').id != 'homeContainer' && document.querySelector('.tasksContainer').id != 'allTasksContainer') {
        shortcutToggle(sidebarHome)
        clearContent();
        setTimeout(() => {
            createTasksContainer('allTasks');
            const tasksContainer = document.querySelector('.tasksContainer');
            tasksContainer.style.animation = 'bottomTopBounce 0.15s cubic-bezier(0,.86,1,1)'
        }, 300);
        setTimeout(() => {
            const taskContainers = document.querySelectorAll('.taskContainer');
            taskContainers.forEach(task => {
                if (task.id.toString() == e.target.id.slice(6)) {
                    taskContainer = task;
                }
            })
            taskSelection(taskContainer)
            setTimeout(() => taskContainer.scrollIntoView({ behavior: 'smooth', block: "center"}), 200);
        },500);
    } else {
            const taskContainers = document.querySelectorAll('.taskContainer');
            taskContainers.forEach(task => {
                if (task.id.toString() == e.target.id.slice(6)) {
                    taskContainer = task;
                }
            })
            taskSelection(taskContainer)
            setTimeout(() => taskContainer.scrollIntoView({ behavior: 'smooth', block: "center"}), 200);
    }
}

const navSearchCancel = () => {
    document.addEventListener('click', (e)=> {
        const searchResultName = document.querySelectorAll('.searchResultName');
        const searchBar = document.querySelector('#searchBar')

        if (e.target.id != 'searchBar') {
            searchBar.value = '';
            searchResultName.forEach(name => {
                if (!name.parentNode.className.includes('hidden')) {
                    name.parentNode.classList.add('hidden')
                }
            })
        const navSearchBar = document.querySelector('#searchBar');
        const navSearchContainer = document.querySelector('#searchContainer')
        navSearchContainer.classList.remove('selected')
        navSearchBar.classList.remove('selected')
        }
    })
}

const formButtonClicked = () => {
    formContainer.style.visibility = "visible";
    form.style.opacity = "1";
    form.style.transform = "scale(1)";
}


//Sidebar
const sidebarTabClick = (e) => {
    if (!e.target.className.includes('sidebarTab') && e.target.id != 'sidebarHome' || e.target.className.includes('viewing')) {
        return
    }
    shortcutToggle(e.target);
    clearContent();
    setTimeout(() => {
        if (e.target.id == 'sidebarHome') {
            createTasksContainer('home');
        } else if (e.target.id == 'sidebarShortcutsToday') {
            createTasksContainer('today');
        } else if (e.target.id == 'sidebarShortcutsWeek') {
            createTasksContainer('week');
        } else if (e.target.id == 'sidebarShortcutsAllTasks') {
            createTasksContainer('allTasks');
        } else {
            createTasksContainer(e.target.children[1].innerText, 'list');
        }
    }, 350);
}

const shortcutToggle = (target) => {
    const shortcuts = document.querySelectorAll('.sidebarShortcut');
    const sidebarHome = document.querySelector('#sidebarHome');
    const sidebarListContainers = document.querySelectorAll('.sidebarListContainer')
    sidebarHome.classList.remove('viewing');
    for (let i = 0; i < shortcuts.length; i++) {
        shortcuts[i].classList.remove('viewing');
        shortcuts[i].children[0].classList.remove('viewing')
    }
    for (let i = 0; i < sidebarListContainers.length; i++) {
        sidebarListContainers[i].classList.remove('viewing');
        sidebarListContainers[i].children[0].classList.remove('viewing')
    }
    target.classList.toggle('viewing');
    target.children[0].classList.toggle('viewing');
}

const sidebarArrowClick = (e) => {
    const arrow = e.target
    if (arrow.className.includes('close')) {
        arrow.parentNode.nextElementSibling.style.marginBottom = '0';
    } else {
        if (e.target.id == 'shortcutsArrow') {
            arrow.parentNode.nextElementSibling.style.marginBottom = `${-sidebarShortcuts.clientHeight}px`;
        } else {
            arrow.parentNode.nextElementSibling.style.marginBottom = `${-sidebarLists.clientHeight}px`;
        }
     }
    arrow.parentNode.nextElementSibling.classList.toggle('close');
    arrow.classList.toggle('close');
}


//Tasks
const taskSelection = (taskContainer) => {
    const selectedTask = allTasks.find((task)=> {
        if (task.key == taskContainer.id) {
            return true
        }
    })
    const taskView = document.querySelector('.taskViewContainer')
    if (taskView) {
        taskView.style.opacity = '0';
        setTimeout(()=> {taskView.remove()},200)  
    } else {
        document.querySelector('.tasksContainer').style.transform = "translateX(-35%)";
    }
    createTaskView(selectedTask, taskContainer);  
}

const checkClick = (e) => {
    if (e.target.parentNode.className.includes('checkContainer')) {
        const taskContainer = e.target.parentNode.parentNode;
        allTasks.forEach(task => {
            if (task.key == taskContainer.id) {
                if (e.target.parentNode.className == 'checkContainer') {
                    task.status = "completed";
                } else {
                    task.status = "";
                }
            }
        })
        checkTaskAnimation(e,'');
        console.log(allTasks)
    } else if (e.target.parentNode.className.includes("taskViewCheckContainer")) {
        const taskViewContainer = e.target.parentNode.parentNode.parentNode;
        const key = taskViewContainer.id.substring(1)
        
        let taskContainer;
        const tasks = document.querySelectorAll('.taskContainer');
        tasks.forEach(task => {
            if (task.id == key) {
                taskContainer = task;
            }
        })

        allTasks.forEach(task => {
            if (task.key == taskContainer.id) {
                if (e.target.parentNode.className == "taskViewCheckContainer") {
                    task.status = "completed";
                } else {
                    task.status = "";
                }
            }
        })
        checkTaskAnimation('', taskContainer.children[0]);
    } 
    updateLocalData(allTasks);
}

const deleteClick = (e) => {
    if (e.target.parentNode.className == 'deleteContainer' || e.target.parentNode.className == 'deleteContainer completed') {
        const taskContainer = e.target.parentNode.parentNode;
        const subGroup = taskContainer.parentNode;
        deleteTask(taskContainer);
        allTasks.forEach(task=> {
            if (taskContainer.id == task.key) {
                allTasks.splice(allTasks.indexOf(task), 1)
            }
        })
        updateLocalData(allTasks);
        updateCounter();
        setTimeout(() => {
            checkEmptySubGroup(subGroup)
        }, 200);
        
        console.log(allTasks)
    }
}

export const checkEmptySubGroup = (subGroup) => {
    if (subGroup.children.length == 1) {
        if (subGroup.id == 'overdue') {
            removeSubGroup(subGroup)
        } else {
            subGroup.classList.toggle('empty')
        }
    } else {
        subGroup.classList.remove('empty')
    }
}

//Window Resizing Listeners 
const windowResize = () => {
    window.addEventListener('resize', ()=> {
        decreaseFontSize();
    }) 
    let timer = 0;
    window.addEventListener('resize', () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        } else {
            document.body.classList.add('stop-transitions');
        }
        timer = setTimeout(() => {
            document.body.classList.remove('stop-transitions');
            timer = null;
        }, 100);
    });
}



export const runEventHandlers = () => {
    formContainerClick();
    formSearchInput();
    navbarClick();
    NavSearchInput();
    navSearchCancel();
    sideBarClick();
    contentContainerClick();
    windowResize();
}